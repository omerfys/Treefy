import * as THREE from 'three';
import { type Branch, type TreeModel, type GrowOptions } from './tree';
import { makeRng, lerp } from './rng';

function computeBounds(leaves: THREE.Vector3[], height: number) {
  let canopyTop = height;
  let canopyRadius = 0;
  for (const l of leaves) {
    canopyTop = Math.max(canopyTop, l.y);
    canopyRadius = Math.max(canopyRadius, Math.hypot(l.x, l.z));
  }
  return { canopyTop, canopyRadius };
}

// ------------------------------------------------------------------ 1. CASTLE
export function generateCastle(seed: number, opts: GrowOptions): TreeModel {
  const rng = makeRng(seed);
  const branches: Branch[] = [];
  const branchColors: THREE.Color[] = [];
  const leaves: THREE.Vector3[] = [];
  const leafScales: number[] = [];
  const leafColors = new Float32Array(opts.leafCount * 3);

  const h = opts.height * opts.species.heightFactor * 1.02;
  const keepH = h * 0.88;
  const turretH = h * 0.72;
  const wallH = h * 0.46;
  const span = h * 0.38;

  // Material Palette
  const colStone = new THREE.Color('#7a7e85');
  const colLimestone = new THREE.Color('#dcd9cf');
  const colDarkSlate = new THREE.Color('#464950');
  const colRoofBlue = new THREE.Color('#255085');
  const colRoofRed = new THREE.Color('#a83226');
  const colBanner = new THREE.Color('#c0392b');
  const colMoat = new THREE.Color('#3498db');
  const colWood = new THREE.Color('#5c4028');

  // Keep Central Core
  const keepCorners = [
    [-span * 0.45, -span * 0.45],
    [span * 0.45, -span * 0.45],
    [span * 0.45, span * 0.45],
    [-span * 0.45, span * 0.45],
  ];
  for (let i = 0; i < 4; i++) {
    const [cx, cz] = keepCorners[i];
    branches.push({
      start: new THREE.Vector3(cx, 0, cz),
      end: new THREE.Vector3(cx, keepH, cz),
      radius: h * 0.04,
      depth: 0,
    });
    branchColors.push(colStone);

    const [nx, nz] = keepCorners[(i + 1) % 4];
    branches.push({
      start: new THREE.Vector3(cx, keepH * 0.5, cz),
      end: new THREE.Vector3(nx, keepH * 0.5, nz),
      radius: h * 0.026,
      depth: 1,
    });
    branchColors.push(colStone);

    branches.push({
      start: new THREE.Vector3(cx, keepH, cz),
      end: new THREE.Vector3(nx, keepH, nz),
      radius: h * 0.026,
      depth: 1,
    });
    branchColors.push(colStone);
  }

  // 4 Outer Corner Turrets & Walls
  const turretCorners = [
    [-span, -span],
    [span, -span],
    [span, span],
    [-span, span],
  ];
  for (let i = 0; i < 4; i++) {
    const [tx, tz] = turretCorners[i];
    branches.push({
      start: new THREE.Vector3(tx, 0, tz),
      end: new THREE.Vector3(tx, turretH, tz),
      radius: h * 0.034,
      depth: 1,
    });
    branchColors.push(colStone);

    branches.push({
      start: new THREE.Vector3(tx, turretH, tz),
      end: new THREE.Vector3(tx, turretH + h * 0.14, tz),
      radius: h * 0.012,
      depth: 2,
    });
    branchColors.push(colWood);

    const [ntx, ntz] = turretCorners[(i + 1) % 4];
    branches.push({
      start: new THREE.Vector3(tx, wallH, tz),
      end: new THREE.Vector3(ntx, wallH, ntz),
      radius: h * 0.028,
      depth: 1,
    });
    branchColors.push(colStone);

    branches.push({
      start: new THREE.Vector3(tx, wallH * 0.5, tz),
      end: new THREE.Vector3(ntx, wallH * 0.5, ntz),
      radius: h * 0.02,
      depth: 2,
    });
    branchColors.push(colDarkSlate);
  }

  // Gatehouse
  branches.push({
    start: new THREE.Vector3(-span * 0.32, 0, span),
    end: new THREE.Vector3(-span * 0.32, wallH * 0.72, span),
    radius: h * 0.026,
    depth: 1,
  });
  branchColors.push(colWood);
  branches.push({
    start: new THREE.Vector3(span * 0.32, 0, span),
    end: new THREE.Vector3(span * 0.32, wallH * 0.72, span),
    radius: h * 0.026,
    depth: 1,
  });
  branchColors.push(colWood);
  branches.push({
    start: new THREE.Vector3(-span * 0.32, wallH * 0.72, span),
    end: new THREE.Vector3(span * 0.32, wallH * 0.72, span),
    radius: h * 0.024,
    depth: 2,
  });
  branchColors.push(colWood);

  // Castle Blocks
  for (let i = 0; i < opts.leafCount; i++) {
    const roll = rng();
    let x = 0;
    let y = 0;
    let z = 0;
    let col = colStone;

    if (roll < 0.28) {
      // 4 Turret Conical Roofs
      const [tx, tz] = turretCorners[Math.floor(rng() * 4)];
      const r = rng() * span * 0.38;
      const theta = rng() * Math.PI * 2;
      x = tx + Math.cos(theta) * r;
      z = tz + Math.sin(theta) * r;
      const coneLift = (1 - r / (span * 0.38)) * (h * 0.18);
      y = turretH + coneLift + (rng() - 0.5) * 0.1;
      col = rng() < 0.8 ? colRoofBlue : colRoofRed;
    } else if (roll < 0.52) {
      // Citadel Walls & Battlements
      const edge = (rng() - 0.5) * span * 0.95;
      const side = rng() < 0.5 ? -span * 0.45 : span * 0.45;
      if (rng() < 0.5) {
        x = edge;
        z = side;
      } else {
        x = side;
        z = edge;
      }
      y = rng() < 0.3 ? keepH + (rng() < 0.5 ? h * 0.06 : 0) : lerp(wallH, keepH, rng());
      col = y > keepH * 0.9 ? colLimestone : colStone;
    } else if (roll < 0.75) {
      // Curtain Walls & Crenellations
      const wallIdx = Math.floor(rng() * 4);
      const [t1x, t1z] = turretCorners[wallIdx];
      const [t2x, t2z] = turretCorners[(wallIdx + 1) % 4];
      const f = rng();
      x = lerp(t1x, t2x, f) + (rng() - 0.5) * 0.15;
      z = lerp(t1z, t2z, f) + (rng() - 0.5) * 0.15;
      y = lerp(0.3, wallH, rng()) + (rng() < 0.2 ? h * 0.05 : 0);
      col = rng() < 0.4 ? colLimestone : colStone;
    } else if (roll < 0.88) {
      // Water Moat
      const angle = rng() * Math.PI * 2;
      const dist = span * (1.1 + rng() * 0.35);
      x = Math.cos(angle) * dist;
      z = Math.sin(angle) * dist;
      y = 0.12 + (rng() - 0.5) * 0.04;
      col = colMoat;
    } else {
      // Flags and details
      x = (rng() - 0.5) * span * 0.7;
      z = (rng() - 0.5) * span * 0.7;
      y = lerp(wallH * 0.2, keepH * 1.05, rng());
      col = rng() < 0.5 ? colBanner : colLimestone;
    }

    leaves.push(new THREE.Vector3(x, Math.max(0.12, y), z));
    leafScales.push(lerp(0.75, 1.25, rng()));
    leafColors[i * 3] = col.r;
    leafColors[i * 3 + 1] = col.g;
    leafColors[i * 3 + 2] = col.b;
  }

  return {
    branches,
    branchColors,
    leaves,
    leafScales,
    leafColors,
    height: keepH + h * 0.14,
    ...computeBounds(leaves, keepH + h * 0.14),
  };
}

// ------------------------------------------------------------------ 2. SHIP (GALLEON)
export function generateShip(seed: number, opts: GrowOptions): TreeModel {
  const rng = makeRng(seed);
  const branches: Branch[] = [];
  const branchColors: THREE.Color[] = [];
  const leaves: THREE.Vector3[] = [];
  const leafScales: number[] = [];
  const leafColors = new Float32Array(opts.leafCount * 3);

  const h = opts.height * opts.species.heightFactor * 1.1;
  const hullLen = h * 0.85;
  const mastH = h * 0.95;

  const colHull = new THREE.Color('#382010');
  const colDeck = new THREE.Color('#78471f');
  const colSailWhite = new THREE.Color('#fdfcf7');
  const colSailRed = new THREE.Color('#b71c1c');
  const colWater = new THREE.Color('#2980b9');
  const colSeafoam = new THREE.Color('#e0fbfc');

  // Keel & Bowsprit
  branches.push({
    start: new THREE.Vector3(0, h * 0.08, -hullLen * 0.5),
    end: new THREE.Vector3(0, h * 0.08, hullLen * 0.5),
    radius: h * 0.045,
    depth: 0,
  });
  branchColors.push(colHull);

  branches.push({
    start: new THREE.Vector3(0, h * 0.22, hullLen * 0.5),
    end: new THREE.Vector3(0, h * 0.38, hullLen * 0.72),
    radius: h * 0.02,
    depth: 1,
  });
  branchColors.push(colDeck);

  // 3 Masts & Yardarms
  const mastPositions = [-hullLen * 0.28, 0, hullLen * 0.28];
  const mastHeights = [mastH * 0.85, mastH, mastH * 0.88];

  for (let m = 0; m < 3; m++) {
    const mz = mastPositions[m];
    const mh = mastHeights[m];

    branches.push({
      start: new THREE.Vector3(0, h * 0.15, mz),
      end: new THREE.Vector3(0, mh, mz),
      radius: h * 0.032,
      depth: 0,
    });
    branchColors.push(colDeck);

    for (let y = 1; y <= 3; y++) {
      const yardY = (mh * (y + 1)) / 5;
      const yardW = (hullLen * 0.42) * (1 - y * 0.16);
      branches.push({
        start: new THREE.Vector3(-yardW * 0.5, yardY, mz),
        end: new THREE.Vector3(yardW * 0.5, yardY, mz),
        radius: h * 0.016,
        depth: 1,
      });
      branchColors.push(colDeck);
    }
  }

  // Railings
  branches.push({
    start: new THREE.Vector3(-hullLen * 0.18, h * 0.22, -hullLen * 0.45),
    end: new THREE.Vector3(-hullLen * 0.18, h * 0.22, hullLen * 0.45),
    radius: h * 0.02,
    depth: 1,
  });
  branchColors.push(colHull);
  branches.push({
    start: new THREE.Vector3(hullLen * 0.18, h * 0.22, -hullLen * 0.45),
    end: new THREE.Vector3(hullLen * 0.18, h * 0.22, hullLen * 0.45),
    radius: h * 0.02,
    depth: 1,
  });
  branchColors.push(colHull);

  // Transverse hull ribs
  for (let r = -2; r <= 2; r++) {
    const rz = (r / 2) * hullLen * 0.35;
    branches.push({
      start: new THREE.Vector3(-hullLen * 0.16, h * 0.2, rz),
      end: new THREE.Vector3(0, h * 0.08, rz),
      radius: h * 0.02,
      depth: 1,
    });
    branchColors.push(colHull);
    branches.push({
      start: new THREE.Vector3(0, h * 0.08, rz),
      end: new THREE.Vector3(hullLen * 0.16, h * 0.2, rz),
      radius: h * 0.02,
      depth: 1,
    });
    branchColors.push(colHull);
  }

  // Rigging stays
  for (let m = 0; m < 3; m++) {
    const mz = mastPositions[m];
    const mh = mastHeights[m];
    branches.push({
      start: new THREE.Vector3(-hullLen * 0.18, h * 0.22, mz),
      end: new THREE.Vector3(0, mh * 0.85, mz),
      radius: h * 0.008,
      depth: 2,
    });
    branchColors.push(colDeck);
    branches.push({
      start: new THREE.Vector3(hullLen * 0.18, h * 0.22, mz),
      end: new THREE.Vector3(0, mh * 0.85, mz),
      radius: h * 0.008,
      depth: 2,
    });
    branchColors.push(colDeck);
  }

  // Sails, Hull & Ocean Waves
  for (let i = 0; i < opts.leafCount; i++) {
    const roll = rng();
    let x = 0;
    let y = 0;
    let z = 0;
    let col = colSailWhite;

    if (roll < 0.58) {
      // Billowing Sails with pirate crimson stripes
      const mIdx = Math.floor(rng() * 3);
      const mz = mastPositions[mIdx];
      const mh = mastHeights[mIdx];
      const tier = Math.floor(rng() * 3) + 1;
      const yardY = (mh * (tier + 1)) / 5;
      const sailH = mh * 0.18;
      const sailW = (hullLen * 0.4) * (1 - tier * 0.15);

      const u = (rng() - 0.5) * sailW;
      const v = rng() * sailH;
      const billow = Math.sin((v / sailH) * Math.PI) * (1 - Math.abs(u / (sailW * 0.5))) * (h * 0.08);

      x = u;
      y = yardY - v;
      z = mz + billow;

      const isRedStripe = Math.floor(u * 8 + tier * 2) % 3 === 0;
      col = isRedStripe ? colSailRed : colSailWhite;
    } else if (roll < 0.82) {
      // Hull wood
      const fz = (rng() - 0.5) * hullLen;
      const taper = 1 - Math.pow(Math.abs(fz) / (hullLen * 0.5), 2) * 0.55;
      const side = rng() < 0.5 ? -1 : 1;
      const hw = (hullLen * 0.22) * taper * (0.8 + rng() * 0.2);

      x = side * hw;
      z = fz;
      const sternLift = fz < -hullLen * 0.2 ? Math.abs(fz + hullLen * 0.2) * 0.35 : 0;
      y = lerp(0.08, h * 0.25, rng()) + sternLift;
      col = y > h * 0.2 ? colDeck : colHull;
    } else {
      // Ocean Waves
      const angle = rng() * Math.PI * 2;
      const dist = lerp(hullLen * 0.35, hullLen * 0.75, rng());
      x = Math.cos(angle) * dist;
      z = Math.sin(angle) * dist;
      y = 0.08 + Math.sin(x * 1.5 + z * 1.2) * 0.05 + (rng() - 0.5) * 0.04;
      col = rng() < 0.3 ? colSeafoam : colWater;
    }

    leaves.push(new THREE.Vector3(x, Math.max(0.08, y), z));
    leafScales.push(lerp(0.7, 1.2, rng()));
    leafColors[i * 3] = col.r;
    leafColors[i * 3 + 1] = col.g;
    leafColors[i * 3 + 2] = col.b;
  }

  return {
    branches,
    branchColors,
    leaves,
    leafScales,
    leafColors,
    height: mastH,
    ...computeBounds(leaves, mastH),
  };
}

// ------------------------------------------------------------------ 3. PYRAMID
export function generatePyramid(seed: number, opts: GrowOptions): TreeModel {
  const rng = makeRng(seed);
  const branches: Branch[] = [];
  const branchColors: THREE.Color[] = [];
  const leaves: THREE.Vector3[] = [];
  const leafScales: number[] = [];
  const leafColors = new Float32Array(opts.leafCount * 3);

  const h = opts.height * opts.species.heightFactor * 0.95;
  const baseSpan = h * 0.48;
  const steps = 6;

  const colSand = new THREE.Color('#d4a373');
  const colSandLight = new THREE.Color('#e9c46a');
  const colGold = new THREE.Color('#f39c12');
  const colGoldBright = new THREE.Color('#f1c40f');
  const colSandWarm = new THREE.Color('#f4a261');
  const colSandDark = new THREE.Color('#b57a3e');
  const colTerracotta = new THREE.Color('#c26d36');

  for (let s = 0; s < steps; s++) {
    const y0 = (s * h) / steps;
    const y1 = ((s + 1) * h) / steps;
    const span0 = baseSpan * (1 - s / steps);
    const span1 = baseSpan * (1 - (s + 1) / steps);

    const corners0 = [
      [-span0, -span0],
      [span0, -span0],
      [span0, span0],
      [-span0, span0],
    ];
    const corners1 = [
      [-span1, -span1],
      [span1, -span1],
      [span1, span1],
      [-span1, span1],
    ];

    for (let c = 0; c < 4; c++) {
      branches.push({
        start: new THREE.Vector3(corners0[c][0], y0, corners0[c][1]),
        end: new THREE.Vector3(corners1[c][0], y1, corners1[c][1]),
        radius: h * 0.03 * (1 - s * 0.12),
        depth: 0,
      });
      branchColors.push(s === steps - 1 ? colGold : colSand);

      branches.push({
        start: new THREE.Vector3(corners0[c][0], y0, corners0[c][1]),
        end: new THREE.Vector3(corners0[(c + 1) % 4][0], y0, corners0[(c + 1) % 4][1]),
        radius: h * 0.02 * (1 - s * 0.12),
        depth: 1,
      });
      branchColors.push(colSand);
    }
  }

  // Twin Obelisks
  [-1, 1].forEach((side) => {
    branches.push({
      start: new THREE.Vector3(side * baseSpan * 0.38, 0, baseSpan * 1.15),
      end: new THREE.Vector3(side * baseSpan * 0.38, h * 0.58, baseSpan * 1.15),
      radius: h * 0.026,
      depth: 1,
    });
    branchColors.push(colSandLight);
  });

  for (let i = 0; i < opts.leafCount; i++) {
    const roll = rng();
    let x = 0;
    let y = 0;
    let z = 0;
    let col = colSand;

    if (roll < 0.82) {
      const s = Math.floor(rng() * steps);
      const terraceY = (s * h) / steps;
      const curSpan = baseSpan * (1 - s / steps);
      const side = Math.floor(rng() * 4);
      const along = (rng() - 0.5) * 2 * curSpan;
      const offset = (rng() - 0.5) * (h * 0.05);

      if (side === 0) {
        x = along;
        z = curSpan + offset;
      } else if (side === 1) {
        x = along;
        z = -curSpan + offset;
      } else if (side === 2) {
        x = curSpan + offset;
        z = along;
      } else {
        x = -curSpan + offset;
        z = along;
      }
      y = terraceY + rng() * (h / steps);
      if (s >= steps - 1) {
        col = rng() < 0.6 ? colGoldBright : colGold;
      } else if (s % 2 === 0) {
        col = rng() < 0.4 ? colSandLight : colSand;
      } else {
        col = rng() < 0.4 ? colSandWarm : colSandDark;
      }
    } else {
      // Desert sand dunes and sandstone foundation blocks around the base
      const angle = rng() * Math.PI * 2;
      const dist = baseSpan * (0.95 + rng() * 0.45);
      x = Math.cos(angle) * dist;
      z = Math.sin(angle) * dist;
      y = 0.12 + Math.pow(rng(), 1.6) * (h * 0.15);
      col = rng() < 0.35 ? colTerracotta : (rng() < 0.5 ? colSand : colSandWarm);
    }

    leaves.push(new THREE.Vector3(x, Math.max(0.12, y), z));
    leafScales.push(lerp(0.7, 1.25, rng()));
    leafColors[i * 3] = col.r;
    leafColors[i * 3 + 1] = col.g;
    leafColors[i * 3 + 2] = col.b;
  }

  return {
    branches,
    branchColors,
    leaves,
    leafScales,
    leafColors,
    height: h,
    ...computeBounds(leaves, h),
  };
}

// ------------------------------------------------------------------ 4. ANGEL (MELEK HEYKELİ & KANATLAR)
export function generateAngel(seed: number, opts: GrowOptions): TreeModel {
  const rng = makeRng(seed);
  const branches: Branch[] = [];
  const branchColors: THREE.Color[] = [];
  const leaves: THREE.Vector3[] = [];
  const leafScales: number[] = [];
  const leafColors = new Float32Array(opts.leafCount * 3);

  const h = opts.height * opts.species.heightFactor * 1.06;
  const wingSpan = h * 0.52;
  const torsoH = h * 0.55;

  // Material Palette (Celestial Ivory, Gold, Marble)
  const colMarble = new THREE.Color('#f0ece1');
  const colMarbleShadow = new THREE.Color('#d1cbc0');
  const colGold = new THREE.Color('#f1c40f');
  const colFeatherWhite = new THREE.Color('#ffffff');
  const colFeatherGold = new THREE.Color('#f5d76e');
  const colCloud = new THREE.Color('#f8f9fa');

  // 1. Classical Marble Base Plinth & Pedestal
  branches.push({
    start: new THREE.Vector3(0, 0, 0),
    end: new THREE.Vector3(0, h * 0.22, 0),
    radius: h * 0.055,
    depth: 0,
  });
  branchColors.push(colMarble);

  // Pedestal Column
  branches.push({
    start: new THREE.Vector3(0, h * 0.22, 0),
    end: new THREE.Vector3(0, h * 0.42, 0),
    radius: h * 0.038,
    depth: 0,
  });
  branchColors.push(colMarble);

  // Angel Torso & Head
  branches.push({
    start: new THREE.Vector3(0, h * 0.42, 0),
    end: new THREE.Vector3(0, torsoH, 0),
    radius: h * 0.03,
    depth: 1,
  });
  branchColors.push(colMarble);

  // Halo Ring over head
  branches.push({
    start: new THREE.Vector3(0, torsoH * 1.05, 0),
    end: new THREE.Vector3(0, torsoH * 1.16, 0),
    radius: h * 0.015,
    depth: 2,
  });
  branchColors.push(colGold);
  // 8 Radiant Celestial Halo Rays
  for (let r = 0; r < 8; r++) {
    const angle = (r / 8) * Math.PI * 2;
    branches.push({
      start: new THREE.Vector3(Math.cos(angle) * (wingSpan * 0.1), torsoH * 1.12, Math.sin(angle) * (wingSpan * 0.1)),
      end: new THREE.Vector3(Math.cos(angle) * (wingSpan * 0.2), torsoH * 1.12, Math.sin(angle) * (wingSpan * 0.2)),
      radius: h * 0.008,
      depth: 2,
    });
    branchColors.push(colGold);
  }


  // 2. Outstretched Sweeping Archangel Wings (Symmetrical)
  [-1, 1].forEach((side) => {
    // Primary Wing Bone (Arching up and outward)
    const midWing = new THREE.Vector3(side * wingSpan * 0.5, h * 0.72, -wingSpan * 0.08);
    const tipWing = new THREE.Vector3(side * wingSpan * 0.88, h * 0.96, -wingSpan * 0.15);

    branches.push({
      start: new THREE.Vector3(0, torsoH * 0.85, -0.1),
      end: midWing,
      radius: h * 0.026,
      depth: 1,
    });
    branchColors.push(colMarble);

    branches.push({
      start: midWing,
      end: tipWing,
      radius: h * 0.018,
      depth: 2,
    });
    branchColors.push(colGold);

    // 4 Secondary Feather Spars fanning downward per wing
    for (let f = 1; f <= 4; f++) {
      const fFrac = f / 4;
      const sparStart = new THREE.Vector3().lerpVectors(midWing, tipWing, fFrac);
      const sparEnd = new THREE.Vector3(
        side * wingSpan * (0.3 + fFrac * 0.5),
        h * (0.35 + fFrac * 0.3),
        -wingSpan * 0.1,
      );
      branches.push({
        start: sparStart,
        end: sparEnd,
        radius: h * 0.012,
        depth: 2,
      });
      branchColors.push(colMarble);
    }

    // Classical Colonnade Pillars at plinth corners
    branches.push({
      start: new THREE.Vector3(side * wingSpan * 0.6, 0, wingSpan * 0.4),
      end: new THREE.Vector3(side * wingSpan * 0.6, h * 0.42, wingSpan * 0.4),
      radius: h * 0.024,
      depth: 1,
    });
    branchColors.push(colMarble);

    branches.push({
      start: new THREE.Vector3(side * wingSpan * 0.6, 0, -wingSpan * 0.4),
      end: new THREE.Vector3(side * wingSpan * 0.6, h * 0.42, -wingSpan * 0.4),
      radius: h * 0.024,
      depth: 1,
    });
    branchColors.push(colMarble);
  });

  // 3. Feathers, Drapery, Radiant Halo & Cloud Base
  for (let i = 0; i < opts.leafCount; i++) {
    const roll = rng();
    let x = 0;
    let y = 0;
    let z = 0;
    let col = colFeatherWhite;

    if (roll < 0.65) {
      // Outstretched Wing Feathers (Left and Right)
      const side = rng() < 0.5 ? -1 : 1;
      const u = rng(); // 0 at base, 1 at wing tip
      const spanCurve = Math.pow(u, 0.75) * wingSpan * 0.85;
      const lift = Math.pow(u, 0.85) * (h * 0.5) + (rng() - 0.5) * (h * 0.12);
      const featherDrop = (1 - u) * rng() * (h * 0.28);

      x = side * (spanCurve + (rng() - 0.5) * 0.2);
      y = (torsoH * 0.6) + lift - featherDrop;
      z = -wingSpan * (0.05 + u * 0.15) + (rng() - 0.5) * 0.15;

      // Golden accents on wingtips and crests
      col = u > 0.82 ? colFeatherGold : (rng() < 0.2 ? colFeatherGold : colFeatherWhite);
    } else if (roll < 0.85) {
      // Flowing Alabaster Marble Drapery & Torso
      const frac = rng();
      const r = (1 - frac * 0.5) * (wingSpan * 0.22);
      const theta = rng() * Math.PI * 2;
      x = Math.cos(theta) * r;
      z = Math.sin(theta) * r;
      y = lerp(h * 0.15, torsoH * 1.05, frac);
      col = rng() < 0.3 ? colMarbleShadow : colMarble;
    } else if (roll < 0.92) {
      // Golden Celestial Halo above head
      const theta = rng() * Math.PI * 2;
      const haloR = wingSpan * 0.14;
      x = Math.cos(theta) * haloR;
      z = Math.sin(theta) * haloR;
      y = torsoH * 1.12 + (rng() - 0.5) * 0.04;
      col = colGold;
    } else {
      // Ethereal Mist Clouds at base
      const angle = rng() * Math.PI * 2;
      const dist = lerp(wingSpan * 0.25, wingSpan * 0.75, rng());
      x = Math.cos(angle) * dist;
      z = Math.sin(angle) * dist;
      y = 0.08 + rng() * 0.15;
      col = colCloud;
    }

    leaves.push(new THREE.Vector3(x, Math.max(0.08, y), z));
    leafScales.push(lerp(0.7, 1.25, rng()));
    leafColors[i * 3] = col.r;
    leafColors[i * 3 + 1] = col.g;
    leafColors[i * 3 + 2] = col.b;
  }

  return {
    branches,
    branchColors,
    leaves,
    leafScales,
    leafColors,
    height: h * 1.02,
    ...computeBounds(leaves, h * 1.02),
  };
}

// ------------------------------------------------------------------ 5. CRANE (TURNA KUŞU & NİLÜFERLER)
export function generateCrane(seed: number, opts: GrowOptions): TreeModel {
  const rng = makeRng(seed);
  const branches: Branch[] = [];
  const branchColors: THREE.Color[] = [];
  const leaves: THREE.Vector3[] = [];
  const leafScales: number[] = [];
  const leafColors = new Float32Array(opts.leafCount * 3);

  const h = opts.height * opts.species.heightFactor * 1.05;
  const span = h * 0.38;

  // Material Palette (Inspired directly by Image #1 Heron in Lotus Pond!)
  const colLegs = new THREE.Color('#2c3437');
  const colBeak = new THREE.Color('#f39c12');
  const colCrownRed = new THREE.Color('#c0392b');
  const colFeatherWhite = new THREE.Color('#ffffff');
  const colFeatherBlack = new THREE.Color('#1a1c1e');
  const colLotusGreen = new THREE.Color('#27ae60');
  const colLotusPink = new THREE.Color('#ff758f');
  const colWater = new THREE.Color('#2980b9');

  // 1. Stilt Legs standing in the water
  // Leg 1 (Standing)
  branches.push({
    start: new THREE.Vector3(-span * 0.1, 0, 0),
    end: new THREE.Vector3(-span * 0.08, h * 0.38, 0),
    radius: h * 0.018,
    depth: 0,
  });
  branchColors.push(colLegs);

  // Leg 2 (Slightly lifted / posed)
  branches.push({
    start: new THREE.Vector3(span * 0.1, h * 0.08, 0),
    end: new THREE.Vector3(span * 0.08, h * 0.38, 0),
    radius: h * 0.018,
    depth: 0,
  });
  branchColors.push(colLegs);

  // Thigh joint to body
  branches.push({
    start: new THREE.Vector3(-span * 0.08, h * 0.38, 0),
    end: new THREE.Vector3(0, h * 0.48, -span * 0.1),
    radius: h * 0.024,
    depth: 1,
  });
  branchColors.push(colLegs);
  branches.push({
    start: new THREE.Vector3(span * 0.08, h * 0.38, 0),
    end: new THREE.Vector3(0, h * 0.48, -span * 0.1),
    radius: h * 0.024,
    depth: 1,
  });
  branchColors.push(colLegs);

  // 2. Body Keel & Elegant S-Curved Neck
  branches.push({
    start: new THREE.Vector3(0, h * 0.48, -span * 0.35),
    end: new THREE.Vector3(0, h * 0.52, span * 0.15),
    radius: h * 0.04,
    depth: 0,
  });
  branchColors.push(colFeatherWhite);

  // Neck Segments (S-Curve rising up to head)
  const neckPoints = [
    new THREE.Vector3(0, h * 0.52, span * 0.15),
    new THREE.Vector3(0, h * 0.65, span * 0.28),
    new THREE.Vector3(0, h * 0.78, span * 0.22),
    new THREE.Vector3(0, h * 0.88, span * 0.32),
  ];
  for (let n = 0; n < neckPoints.length - 1; n++) {
    branches.push({
      start: neckPoints[n],
      end: neckPoints[n + 1],
      radius: h * (0.024 - n * 0.003),
      depth: 1,
    });
    branchColors.push(colFeatherWhite);
  }

  // Slender Beak pointing forward
  branches.push({
    start: new THREE.Vector3(0, h * 0.87, span * 0.32),
    end: new THREE.Vector3(0, h * 0.85, span * 0.58),
    radius: h * 0.012,
    depth: 2,
  });
  branchColors.push(colBeak);

  // Wing frame bones curving back on flanks
  [-1, 1].forEach((side) => {
    branches.push({
      start: new THREE.Vector3(side * span * 0.18, h * 0.52, 0),
      end: new THREE.Vector3(side * span * 0.22, h * 0.44, -span * 0.38),
      radius: h * 0.02,
      depth: 1,
    });
    branchColors.push(colFeatherBlack);

    branches.push({
      start: new THREE.Vector3(side * span * 0.22, h * 0.44, -span * 0.38),
      end: new THREE.Vector3(side * span * 0.12, h * 0.36, -span * 0.52),
      radius: h * 0.014,
      depth: 2,
    });
    branchColors.push(colFeatherBlack);
  });
  // Foot toes standing on water / lotus pad
  [-1, 1].forEach((tSide) => {
    const ankle = tSide === -1 ? new THREE.Vector3(-span * 0.1, 0.02, 0) : new THREE.Vector3(span * 0.1, 0.08, 0);
    for (let toe = -1; toe <= 1; toe++) {
      branches.push({
        start: ankle,
        end: new THREE.Vector3(ankle.x + toe * span * 0.05, 0.01, ankle.z + span * 0.08),
        radius: h * 0.008,
        depth: 2,
      });
      branchColors.push(colLegs);
    }
  });


  // Reed stalks around pond edge
  for (let r = 0; r < 10; r++) {
    const angle = (r / 10) * Math.PI * 2 + 0.3;
    const rx = Math.cos(angle) * (span * 0.95);
    const rz = Math.sin(angle) * (span * 0.95);
    branches.push({
      start: new THREE.Vector3(rx, 0, rz),
      end: new THREE.Vector3(rx + (rng() - 0.5) * 0.2, h * (0.35 + rng() * 0.25), rz + (rng() - 0.5) * 0.2),
      radius: h * 0.01,
      depth: 1,
    });
    branchColors.push(colLotusGreen);
  }

  // 3. Feathers (White Body, Jet-Black Wingtips, Red Crown) & Pond Lotus
  for (let i = 0; i < opts.leafCount; i++) {
    const roll = rng();
    let x = 0;
    let y = 0;
    let z = 0;
    let col = colFeatherWhite;

    if (roll < 0.42) {
      // White Body & Neck Feathers
      const isNeck = rng() < 0.35;
      if (isNeck) {
        const nf = rng();
        const p1 = neckPoints[Math.min(2, Math.floor(nf * 3))];
        const p2 = neckPoints[Math.min(3, Math.floor(nf * 3) + 1)];
        const cur = new THREE.Vector3().lerpVectors(p1, p2, (nf * 3) % 1);
        x = cur.x + (rng() - 0.5) * (h * 0.06);
        y = cur.y + (rng() - 0.5) * (h * 0.06);
        z = cur.z + (rng() - 0.5) * (h * 0.06);
        col = colFeatherWhite;
      } else {
        const theta = rng() * Math.PI * 2;
        const rad = rng() * (span * 0.25);
        x = Math.cos(theta) * rad;
        z = lerp(-span * 0.35, span * 0.15, rng());
        y = h * 0.5 + Math.sin(theta) * (h * 0.1);
        col = colFeatherWhite;
      }
    } else if (roll < 0.62) {
      // Jet-Black Wingtips & Tail Plume (Dramatic Crane contrast!)
      const side = rng() < 0.5 ? -1 : 1;
      const bFrac = rng();
      x = side * (span * 0.16 + bFrac * (span * 0.15));
      z = lerp(-span * 0.15, -span * 0.55, bFrac);
      y = lerp(h * 0.52, h * 0.32, bFrac) + (rng() - 0.5) * 0.08;
      col = colFeatherBlack;
    } else if (roll < 0.68) {
      // Red Crown patch on Crane's head!
      x = (rng() - 0.5) * (h * 0.04);
      y = h * 0.9 + rng() * (h * 0.035);
      z = span * 0.3 + (rng() - 0.5) * (h * 0.05);
      col = colCrownRed;
    } else if (roll < 0.86) {
      // Floating Lotus Water Lily Pads on pond surface
      const angle = rng() * Math.PI * 2;
      const dist = lerp(span * 0.3, span * 1.15, rng());
      x = Math.cos(angle) * dist;
      z = Math.sin(angle) * dist;
      y = 0.08 + (rng() - 0.5) * 0.03;
      col = colLotusGreen;
    } else {
      // Blooming Pink Lotus Blossoms on pond
      const angle = rng() * Math.PI * 2;
      const dist = lerp(span * 0.45, span * 0.95, rng());
      x = Math.cos(angle) * dist;
      z = Math.sin(angle) * dist;
      y = 0.14 + rng() * 0.08;
      col = rng() < 0.6 ? colLotusPink : colWater;
    }

    leaves.push(new THREE.Vector3(x, Math.max(0.08, y), z));
    leafScales.push(lerp(0.65, 1.2, rng()));
    leafColors[i * 3] = col.r;
    leafColors[i * 3 + 1] = col.g;
    leafColors[i * 3 + 2] = col.b;
  }

  return {
    branches,
    branchColors,
    leaves,
    leafScales,
    leafColors,
    height: h * 0.94,
    ...computeBounds(leaves, h * 0.94),
  };
}
