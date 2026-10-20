import * as THREE from 'three';
import { growTree, branchMatrix, type TreeModel } from './tree';
import { type QrMatrix } from './qr';
import { leafTarget, leafCountFor } from './moduleLayout';
import { LEAVES_PER_MODULE } from './constants';
import { hashString, makeRng, clamp01, smoothstep } from './rng';
import type { Palette } from './palette';
import type { Species } from './species';

export type QrStyle = 'leaf' | 'voxel' | 'crystal' | 'cylinder' | 'pillar';

export const QR_STYLES: { id: QrStyle; label: string }[] = [
  { id: 'leaf', label: 'Leaf' },
  { id: 'voxel', label: 'Voxel' },
  { id: 'crystal', label: 'Crystal' },
  { id: 'cylinder', label: 'Pebble' },
  { id: 'pillar', label: 'Tower' },
];

export interface Canopy {
  group: THREE.Group;
  leaves: THREE.InstancedMesh;
  branches: THREE.InstancedMesh;
  model: TreeModel;
  leafCount: number;
  /** 0 = grown tree, 1 = settled into the code. */
  setMorph: (t: number, time: number) => void;
  applyPalette: (p: Palette) => void;
  dispose: () => void;
}

function createLeafGeometry(style: QrStyle): THREE.BufferGeometry {
  switch (style) {
    case 'voxel':
      return new THREE.BoxGeometry(0.96, 0.96, 0.96);
    case 'crystal':
      return new THREE.OctahedronGeometry(0.68, 0);
    case 'cylinder':
      return new THREE.CylinderGeometry(0.48, 0.48, 1, 8);
    case 'pillar':
      return new THREE.BoxGeometry(0.88, 1.8, 0.88);
    case 'leaf':
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}
function toScannableQrColor(r: number, g: number, b: number): THREE.Color {
  const col = new THREE.Color(r, g, b);
  const hsl = { h: 0, s: 0, l: 0 };
  col.getHSL(hsl);

  const isAchromatic = hsl.s < 0.12;
  const s = isAchromatic ? hsl.s * 0.5 : Math.min(1.0, hsl.s * 1.35 + 0.12);
  const l = Math.min(0.18, Math.max(0.11, hsl.l * 0.32));

  const qrCol = new THREE.Color();
  qrCol.setHSL(hsl.h, s, l);
  return qrCol;
}


/**
 * Builds the tree and, for every leaf, the module cell it flies down to.
 * Leaf count is derived from the code so each dark module ends up evenly packed.
 */
export function buildCanopy(
  qr: QrMatrix,
  palette: Palette,
  species: Species,
  style: QrStyle = 'leaf',
): Canopy {
  const seed = hashString(qr.text);
  const rng = makeRng(seed ^ 0x9e3779b9);

  const darkCells = qr.darkCells;
  const leafCount = leafCountFor(qr);
  const treeHeight = qr.plot * species.heightFactor;

  const model = growTree(seed, { height: treeHeight, leafCount, species });

  const group = new THREE.Group();

  // ---- branches --------------------------------------------------------
  const branchGeo = new THREE.CylinderGeometry(0.42, 1, 1, 6, 1);
  const branchMat = new THREE.MeshLambertMaterial();
  const branches = new THREE.InstancedMesh(branchGeo, branchMat, model.branches.length);
  branches.castShadow = true;

  const m = new THREE.Matrix4();
  model.branches.forEach((b, i) => branches.setMatrixAt(i, branchMatrix(b, m)));
  branches.instanceMatrix.needsUpdate = true;
  branches.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(branches);

  // ---- leaves ----------------------------------------------------------
  const leafGeo = createLeafGeometry(style);
  const leafMat = new THREE.MeshLambertMaterial();
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
  leaves.castShadow = true;
  leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(leaves);

  const treePos = new Float32Array(leafCount * 3);
  const qrPos = new Float32Array(leafCount * 3);
  const treeScale = new Float32Array(leafCount);
  const qrScale = new Float32Array(leafCount * 3);
  const phase = new Float32Array(leafCount);
  const delay = new Float32Array(leafCount);
  const spin = new Float32Array(leafCount * 3);

  // Each dark module receives LEAVES_PER_MODULE leaves in a 2 x 2 x N stack.
  for (let i = 0; i < leafCount; i++) {
    const src = model.leaves[i];
    treePos[i * 3] = src.x;
    treePos[i * 3 + 1] = src.y;
    treePos[i * 3 + 2] = src.z;
    treeScale[i] = model.leafScales[i];
    phase[i] = rng() * Math.PI * 2;
    spin[i * 3] = rng() * Math.PI;
    spin[i * 3 + 1] = rng() * Math.PI;
    spin[i * 3 + 2] = rng() * Math.PI;

    const target = leafTarget(qr, i);
    qrPos[i * 3] = target.x;
    qrPos[i * 3 + 1] = target.y;
    qrPos[i * 3 + 2] = target.z;
    qrScale[i * 3] = target.sx;
    qrScale[i * 3 + 1] = style === 'pillar' ? target.sy * 1.6 : target.sy;
    qrScale[i * 3 + 2] = target.sz;

    // A short stagger reads as the canopy unfurling; too much and the tail of
    // stragglers makes the whole transition feel slow.
    delay[i] = clamp01(0.0001 + rng() * 0.18);
  }

  const treeColors = new Float32Array(leafCount * 3);
  const qrColors = new Float32Array(leafCount * 3);

  let paintedFor = -1;

  const applyPalette = (p: Palette) => {
    const rngC = makeRng(seed ^ 0x1234abcd);
    const leafPool = p.leaf.map((c) => new THREE.Color(c));
    const qrPool = p.qrLeaf.map((c) => new THREE.Color(c));

    // Each dark module derives its tone directly from the 3D particles that land in it
    const moduleTone = new Array<THREE.Color>(darkCells.length);
    if (model.leafColors && model.leafColors.length >= leafCount * 3) {
      for (let m = 0; m < darkCells.length; m++) {
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        for (let s = 0; s < LEAVES_PER_MODULE; s++) {
          const idx = (m * LEAVES_PER_MODULE + s) * 3;
          sumR += model.leafColors[idx];
          sumG += model.leafColors[idx + 1];
          sumB += model.leafColors[idx + 2];
        }
        moduleTone[m] = toScannableQrColor(
          sumR / LEAVES_PER_MODULE,
          sumG / LEAVES_PER_MODULE,
          sumB / LEAVES_PER_MODULE,
        );
      }
    } else {
      const rngM = makeRng(seed ^ 0x77aa33);
      for (let m = 0; m < darkCells.length; m++) {
        moduleTone[m] = qrPool[Math.floor(rngM() * qrPool.length)];
      }
    }

    for (let i = 0; i < leafCount; i++) {
      if (model.leafColors && model.leafColors.length >= (i + 1) * 3) {
        treeColors[i * 3] = model.leafColors[i * 3];
        treeColors[i * 3 + 1] = model.leafColors[i * 3 + 1];
        treeColors[i * 3 + 2] = model.leafColors[i * 3 + 2];
      } else {
        const a = leafPool[Math.floor(rngC() * leafPool.length)];
        treeColors[i * 3] = a.r;
        treeColors[i * 3 + 1] = a.g;
        treeColors[i * 3 + 2] = a.b;
      }
      const b = moduleTone[Math.floor(i / LEAVES_PER_MODULE)];
      qrColors[i * 3] = b.r;
      qrColors[i * 3 + 1] = b.g;
      qrColors[i * 3 + 2] = b.b;
    }
    const bark = new THREE.Color(species.bark?.bark ?? p.bark);
    const barkDark = new THREE.Color(species.bark?.barkDark ?? p.barkDark);
    model.branches.forEach((b, i) => {
      const col = model.branchColors && model.branchColors[i]
        ? model.branchColors[i]
        : (b.depth <= 1 ? barkDark : bark);
      branches.setColorAt(i, col);
    });
    if (branches.instanceColor) branches.instanceColor.needsUpdate = true;
    paintedFor = -1; // force a colour rewrite on the next frame
  };

  const mat4 = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const color = new THREE.Color();

  // Cached branch transforms, so retracting them each frame is just a rescale.
  const bMid = new Float32Array(model.branches.length * 3);
  const bQuat = new Float32Array(model.branches.length * 4);
  const bLen = new Float32Array(model.branches.length);
  const bRad = new Float32Array(model.branches.length);
  {
    const dir = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    model.branches.forEach((b, i) => {
      dir.copy(b.end).sub(b.start);
      const len = dir.length();
      bLen[i] = len;
      bRad[i] = b.radius;
      bMid[i * 3] = b.start.x + dir.x * 0.5;
      bMid[i * 3 + 1] = b.start.y + dir.y * 0.5;
      bMid[i * 3 + 2] = b.start.z + dir.z * 0.5;
      q.setFromUnitVectors(up, dir.normalize());
      bQuat[i * 4] = q.x;
      bQuat[i * 4 + 1] = q.y;
      bQuat[i * 4 + 2] = q.z;
      bQuat[i * 4 + 3] = q.w;
    });
  }
  let branchesAt = -1;

  /**
   * Withdraws the woody skeleton into the plot as the code resolves. It has to
   * be gone well before the leaves land, otherwise a trunk is left standing
   * over the finished code.
   */
  const setBranchRetraction = (t: number) => {
    if (branchesAt === t) return;
    branchesAt = t;

    const k = 1 - smoothstep(clamp01(t / 0.45));
    branches.visible = k > 0.02;
    if (!branches.visible) return;

    for (let i = 0; i < model.branches.length; i++) {
      // Shrink the whole skeleton toward the trunk base at the origin.
      pos.set(bMid[i * 3] * k, bMid[i * 3 + 1] * k, bMid[i * 3 + 2] * k);
      quat.set(bQuat[i * 4], bQuat[i * 4 + 1], bQuat[i * 4 + 2], bQuat[i * 4 + 3]);
      scl.set(bRad[i] * k, bLen[i] * k, bRad[i] * k);
      mat4.compose(pos, quat, scl);
      branches.setMatrixAt(i, mat4);
    }
    branches.instanceMatrix.needsUpdate = true;
    branches.castShadow = k > 0.4;
  };

  const setMorph = (t: number, time: number) => {
    const settled = t > 0.999;
    for (let i = 0; i < leafCount; i++) {
      // Stagger: each leaf runs its own eased sub-window of the global morph.
      const d = delay[i];
      const local = clamp01((t - d) / (1 - d));
      const e = local < 0.5 ? 4 * local ** 3 : 1 - (-2 * local + 2) ** 3 / 2;

      // A gentle breeze while the canopy is up; dead still once it is a code.
      const sway = (1 - e) * 0.09 * Math.sin(time * 0.9 + phase[i]);
      // Leaves arc upward before dropping into place.
      const lift = Math.sin(e * Math.PI) * 1.15;

      pos.set(
        treePos[i * 3] + (qrPos[i * 3] - treePos[i * 3]) * e + sway,
        treePos[i * 3 + 1] + (qrPos[i * 3 + 1] - treePos[i * 3 + 1]) * e + lift,
        treePos[i * 3 + 2] + (qrPos[i * 3 + 2] - treePos[i * 3 + 2]) * e + sway * 0.6,
      );

      const ts = treeScale[i];
      scl.set(
        ts + (qrScale[i * 3] - ts) * e,
        ts + (qrScale[i * 3 + 1] - ts) * e,
        ts + (qrScale[i * 3 + 2] - ts) * e,
      );

      // Tumble in flight, then snap square so the modules stay crisp.
      const spinAmt = Math.sin(e * Math.PI) * 1.2;
      euler.set(
        spin[i * 3] * (1 - e) + spinAmt,
        spin[i * 3 + 1] * (1 - e) + spinAmt,
        spin[i * 3 + 2] * (1 - e),
      );
      quat.setFromEuler(euler);

      mat4.compose(pos, quat, scl);
      leaves.setMatrixAt(i, mat4);

      if (paintedFor !== t) {
        color.setRGB(
          treeColors[i * 3] + (qrColors[i * 3] - treeColors[i * 3]) * e,
          treeColors[i * 3 + 1] + (qrColors[i * 3 + 1] - treeColors[i * 3 + 1]) * e,
          treeColors[i * 3 + 2] + (qrColors[i * 3 + 2] - treeColors[i * 3 + 2]) * e,
        );
        leaves.setColorAt(i, color);
      }
    }
    leaves.instanceMatrix.needsUpdate = true;
    if (paintedFor !== t && leaves.instanceColor) {
      leaves.instanceColor.needsUpdate = true;
      paintedFor = t;
    }
    // Once flat, the canopy must not cast anything onto the code.
    leaves.castShadow = !settled;
    setBranchRetraction(t);
  };

  const dispose = () => {
    branchGeo.dispose();
    branchMat.dispose();
    leafGeo.dispose();
    leafMat.dispose();
  };

  applyPalette(palette);

  return { group, leaves, branches, model, leafCount, setMorph, applyPalette, dispose };
}
