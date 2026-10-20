import * as THREE from 'three';
import { CELL, HEDGE_RING } from './constants';
import { makeRng } from './rng';
import type { Palette } from './palette';
import type { SpeciesId } from './species';

export interface Decorations {
  group: THREE.Group;
  setMorph: (t: number) => void;
  applyPalette: (p: Palette) => void;
  dispose: () => void;
}

/**
 * Builds context-aware, handcrafted 3D environmental architecture and objects
 * specifically matched to the active world subject (e.g. Torii Gate for Pagoda,
 * Fire Braziers for Castle, Neon Terminals for Cyber City, Floating Mana Shards for Temple).
 * All objects smoothly retract into the ground during QR transition for 100% scan clarity.
 */
export function buildDecorations(
  plotSize: number,
  palette: Palette,
  seed: number,
  subjectId: SpeciesId,
): Decorations {
  const group = new THREE.Group();
  const rng = makeRng(seed ^ 0xfeedbacc);

  const plotUnits = plotSize * CELL;
  const halfPlot = plotUnits / 2;
  const rimOuter = halfPlot + HEDGE_RING * CELL * 0.95;
  const rimInner = halfPlot + 0.3; // safe margin outside quiet zone

  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];
  const track = <T extends THREE.BufferGeometry | THREE.Material>(obj: T): T => {
    disposables.push(obj);
    return obj;
  };

  // ----------------------------------------------------------- THEME GENERATORS

  if (subjectId === 'castle') {
    // CASTLE ENVIRONMENT: Fire Braziers, Stone Ramparts, Archway
    const stoneMat = track(new THREE.MeshLambertMaterial({ color: 0x7a7872, flatShading: true }));
    const metalMat = track(new THREE.MeshLambertMaterial({ color: 0x3d3a36 }));
    const fireMat = track(new THREE.MeshBasicMaterial({ color: 0xff6b22 }));

    // 4 Corner Braziers with flickering flame and point light
    const brazierPositions = [
      [-rimOuter * 0.75, -rimOuter * 0.75],
      [rimOuter * 0.75, -rimOuter * 0.75],
      [rimOuter * 0.75, rimOuter * 0.75],
      [-rimOuter * 0.75, rimOuter * 0.75],
    ];

    brazierPositions.forEach(([bx, bz]) => {
      const bG = new THREE.Group();
      bG.position.set(bx, 0, bz);

      // Stone Pedestal
      const base = new THREE.Mesh(track(new THREE.CylinderGeometry(0.5, 0.65, 0.7, 6)), stoneMat);
      base.position.y = 0.35;
      bG.add(base);

      // Metal Bowl
      const bowl = new THREE.Mesh(track(new THREE.CylinderGeometry(0.65, 0.3, 0.45, 8)), metalMat);
      bowl.position.y = 0.85;
      bG.add(bowl);

      // Flame cone
      const flame = new THREE.Mesh(track(new THREE.ConeGeometry(0.38, 0.85, 6)), fireMat);
      flame.position.y = 1.35;
      bG.add(flame);

      const light = new THREE.PointLight(0xff7722, 1.2, 12);
      light.position.y = 1.4;
      bG.add(light);

      group.add(bG);
    });

    // Castle Entrance Stone Archway
    const archG = new THREE.Group();
    archG.position.set(0, 0, rimOuter * 0.85);
    const pillarGeo = track(new THREE.BoxGeometry(0.65, 2.2, 0.65));
    const p1 = new THREE.Mesh(pillarGeo, stoneMat);
    p1.position.set(-1.4, 1.1, 0);
    const p2 = new THREE.Mesh(pillarGeo, stoneMat);
    p2.position.set(1.4, 1.1, 0);
    const lintel = new THREE.Mesh(track(new THREE.BoxGeometry(3.6, 0.6, 0.8)), stoneMat);
    lintel.position.set(0, 2.3, 0);
    archG.add(p1, p2, lintel);
    group.add(archG);

  } else if (subjectId === 'sakura') {
    // SAKURA JAPANESE ZEN ENVIRONMENT: Torii Gate, Stone Lanterns, Bamboo Fountain
    const toriiMat = track(new THREE.MeshLambertMaterial({ color: 0xd63031 }));
    const toriiDark = track(new THREE.MeshLambertMaterial({ color: 0x2d3436 }));
    const stoneMat = track(new THREE.MeshLambertMaterial({ color: 0x9e988e, flatShading: true }));
    const glowMat = track(new THREE.MeshBasicMaterial({ color: 0xffdf78 }));

    // Traditional Torii Gate at front rim
    const torii = new THREE.Group();
    torii.position.set(0, 0, rimOuter * 0.82);
    torii.scale.setScalar(0.95);

    const postGeo = track(new THREE.CylinderGeometry(0.2, 0.24, 3.2, 8));
    const lp = new THREE.Mesh(postGeo, toriiMat);
    lp.position.set(-1.7, 1.6, 0);
    lp.rotation.z = -0.04;
    const rp = new THREE.Mesh(postGeo, toriiMat);
    rp.position.set(1.7, 1.6, 0);
    rp.rotation.z = 0.04;

    // Curved Top Kasagi Beam
    const kasagi = new THREE.Mesh(track(new THREE.BoxGeometry(4.4, 0.45, 0.45)), toriiMat);
    kasagi.position.set(0, 3.2, 0);
    const kasagiTop = new THREE.Mesh(track(new THREE.BoxGeometry(4.6, 0.15, 0.55)), toriiDark);
    kasagiTop.position.set(0, 3.45, 0);

    // Tie-beam (Nuki)
    const nuki = new THREE.Mesh(track(new THREE.BoxGeometry(3.8, 0.28, 0.28)), toriiMat);
    nuki.position.set(0, 2.45, 0);

    torii.add(lp, rp, kasagi, kasagiTop, nuki);
    group.add(torii);

    // Stone Lanterns (Tōrō) on flanking corners
    [-1, 1].forEach((side) => {
      const lG = new THREE.Group();
      lG.position.set(side * rimOuter * 0.72, 0, -rimOuter * 0.72);

      const base = new THREE.Mesh(track(new THREE.BoxGeometry(0.7, 0.35, 0.7)), stoneMat);
      base.position.y = 0.18;
      const post = new THREE.Mesh(track(new THREE.CylinderGeometry(0.18, 0.22, 0.9, 6)), stoneMat);
      post.position.y = 0.75;
      const lightBox = new THREE.Mesh(track(new THREE.BoxGeometry(0.6, 0.5, 0.6)), glowMat);
      lightBox.position.y = 1.35;
      const roof = new THREE.Mesh(track(new THREE.ConeGeometry(0.75, 0.4, 4)), stoneMat);
      roof.position.y = 1.8;
      roof.rotation.y = Math.PI / 4;

      const pLight = new THREE.PointLight(0xffbe5c, 0.8, 10);
      pLight.position.y = 1.35;

      lG.add(base, post, lightBox, roof, pLight);
      group.add(lG);
    });

    // Zen Stepping Stones (Tobi-ishi)
    const stoneGeo = track(new THREE.CylinderGeometry(0.42, 0.48, 0.12, 7));
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(stoneGeo, stoneMat);
      s.position.set((rng() - 0.5) * 0.4, 0.06, rimInner + i * 0.75);
      s.rotation.y = rng() * Math.PI;
      s.scale.set(1 + rng() * 0.3, 1, 0.85 + rng() * 0.3);
      group.add(s);
    }

  } else if (subjectId === 'crane') {
    // WETLAND CRANE & LOTUS POND ENVIRONMENT: Cattails, Lotus Flowers, Stepping Stones
    const reedMat = track(new THREE.MeshLambertMaterial({ color: 0x27ae60 }));
    const brownMat = track(new THREE.MeshLambertMaterial({ color: 0x5a3e2a }));
    const flowerMat = track(new THREE.MeshLambertMaterial({ color: 0xff758f }));
    const stoneMat = track(new THREE.MeshLambertMaterial({ color: 0x8a9296, flatShading: true }));

    // Cattail Reed Clusters at pond corners
    [-1, 1].forEach((side) => {
      const reedG = new THREE.Group();
      reedG.position.set(side * rimOuter * 0.78, 0, -rimOuter * 0.75);

      for (let r = 0; r < 5; r++) {
        const stalk = new THREE.Mesh(track(new THREE.CylinderGeometry(0.04, 0.05, 1.6 + r * 0.2, 5)), reedMat);
        stalk.position.set(r * 0.16 - 0.32, 0.8 + r * 0.1, (r % 2) * 0.1);
        stalk.rotation.z = (r - 2) * 0.05;

        const head = new THREE.Mesh(track(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 6)), brownMat);
        head.position.set(stalk.position.x, 1.4 + r * 0.1, stalk.position.z);
        reedG.add(stalk, head);
      }
      group.add(reedG);
    });

    // Pond Stepping Stones
    const stoneGeo = track(new THREE.CylinderGeometry(0.42, 0.48, 0.12, 7));
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Mesh(stoneGeo, stoneMat);
      s.position.set((rng() - 0.5) * 0.4, 0.06, rimInner + i * 0.8);
      s.rotation.y = rng() * Math.PI;
      group.add(s);
    }

    // Blooming Lotus Flowers in water
    const lotusGeo = track(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 6));
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.5;
      const fl = new THREE.Mesh(lotusGeo, flowerMat);
      fl.position.set(Math.cos(angle) * (rimOuter * 0.8), 0.1, Math.sin(angle) * (rimOuter * 0.8));
      group.add(fl);
    }

  } else if (subjectId === 'temple') {
    // MYSTIC CRYSTAL TEMPLE ENVIRONMENT: Floating Mana Shards & Runic Monoliths
    const crystalMat = track(
      new THREE.MeshLambertMaterial({
        color: 0x48cae4,
        transparent: true,
        opacity: 0.88,
        flatShading: true,
      }),
    );
    const runeMat = track(new THREE.MeshLambertMaterial({ color: 0x223247 }));
    const glowMat = track(new THREE.MeshBasicMaterial({ color: 0x00f5d4 }));

    // 4 Floating Orbiting Mana Shards around the rim
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const dist = rimOuter * 0.78;
      const mG = new THREE.Group();
      mG.position.set(Math.cos(angle) * dist, 1.2 + rng() * 0.6, Math.sin(angle) * dist);

      const shard = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.75, 0)), crystalMat);
      shard.scale.set(0.65, 1.4, 0.65);
      shard.rotation.set(0.2, rng() * Math.PI, 0.2);
      mG.add(shard);

      const light = new THREE.PointLight(0x00f5d4, 0.9, 10);
      mG.add(light);
      group.add(mG);
    }

    // 2 Standing Runic Monoliths
    [-1, 1].forEach((side) => {
      const mono = new THREE.Group();
      mono.position.set(side * rimOuter * 0.75, 0, 0);

      const pillar = new THREE.Mesh(track(new THREE.BoxGeometry(0.65, 2.6, 0.45)), runeMat);
      pillar.position.y = 1.3;
      const runeEye = new THREE.Mesh(track(new THREE.BoxGeometry(0.25, 0.25, 0.5)), glowMat);
      runeEye.position.set(0, 1.8, 0);
      mono.add(pillar, runeEye);
      group.add(mono);
    });
  } else if (subjectId === 'ship') {
    // OCEAN & PIRATE HARBOR ENVIRONMENT: Mooring Pilings, Floating Sea Lanterns, Wave Crests
    const woodMat = track(new THREE.MeshLambertMaterial({ color: 0x4a2e1b }));
    const waterMat = track(new THREE.MeshLambertMaterial({ color: 0x2471a3 }));
    const buoyMat = track(new THREE.MeshLambertMaterial({ color: 0xe74c3c }));
    const glowMat = track(new THREE.MeshBasicMaterial({ color: 0xf1c40f }));

    // Wooden Dock Mooring Pilings
    [-1, 1].forEach((side) => {
      const pilingG = new THREE.Group();
      pilingG.position.set(side * rimOuter * 0.78, 0, rimOuter * 0.75);

      for (let p = 0; p < 3; p++) {
        const post = new THREE.Mesh(track(new THREE.CylinderGeometry(0.16, 0.18, 1.4 + p * 0.2, 7)), woodMat);
        post.position.set(p * 0.28 - 0.28, 0.7 + p * 0.1, 0);
        pilingG.add(post);
      }
      group.add(pilingG);
    });

    // Floating Navigational Sea Lanterns / Buoys
    [-1, 1].forEach((side) => {
      const buoy = new THREE.Group();
      buoy.position.set(side * rimOuter * 0.75, 0.35, -rimOuter * 0.72);

      const floatMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(0.35, 0.45, 0.5, 8)), buoyMat);
      const lightMesh = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.2, 0)), glowMat);
      lightMesh.position.y = 0.45;

      const pLight = new THREE.PointLight(0xf1c40f, 0.9, 10);
      pLight.position.y = 0.5;

      buoy.add(floatMesh, lightMesh, pLight);
      group.add(buoy);
    });

    // Wave crests on water rim
    const waveGeo = track(new THREE.ConeGeometry(0.35, 0.25, 4));
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const wave = new THREE.Mesh(waveGeo, waterMat);
      wave.position.set(Math.cos(angle) * (rimOuter * 0.8), 0.1, Math.sin(angle) * (rimOuter * 0.8));
      wave.rotation.z = Math.PI / 2;
      wave.rotation.y = angle;
      group.add(wave);
    }

  } else if (subjectId === 'angel') {
    // CELESTIAL ANGEL ENVIRONMENT: Classical Marble Pedestals with Glowing Orbs
    const marbleMat = track(new THREE.MeshLambertMaterial({ color: 0xf5f3ee, flatShading: true }));
    const goldMat = track(new THREE.MeshLambertMaterial({ color: 0xf1c40f }));
    const glowMat = track(new THREE.MeshBasicMaterial({ color: 0xffffff }));

    // 4 Corner Celestial Pedestals with Glowing Orbs
    [
      [-rimOuter * 0.78, -rimOuter * 0.78],
      [rimOuter * 0.78, -rimOuter * 0.78],
      [rimOuter * 0.78, rimOuter * 0.78],
      [-rimOuter * 0.78, rimOuter * 0.78],
    ].forEach(([cx, cz]) => {
      const ped = new THREE.Group();
      ped.position.set(cx, 0, cz);

      const base = new THREE.Mesh(track(new THREE.CylinderGeometry(0.4, 0.5, 0.8, 8)), marbleMat);
      base.position.y = 0.4;
      ped.add(base);

      const cap = new THREE.Mesh(track(new THREE.BoxGeometry(0.7, 0.15, 0.7)), goldMat);
      cap.position.y = 0.85;
      ped.add(cap);

      const orb = new THREE.Mesh(track(new THREE.SphereGeometry(0.25, 12, 12)), glowMat);
      orb.position.y = 1.15;
      ped.add(orb);

      const pLight = new THREE.PointLight(0xfff8db, 0.9, 10);
      pLight.position.y = 1.2;
      ped.add(pLight);

      group.add(ped);
    });
  } else if (subjectId === 'pyramid') {
    // DESERT SANDSTONE ENVIRONMENT: Sandstone Obelisks, Terracotta Urns
    const sandMat = track(new THREE.MeshLambertMaterial({ color: 0xd4a373, flatShading: true }));
    const terraMat = track(new THREE.MeshLambertMaterial({ color: 0xb55a30 }));

    // Twin Entrance Obelisks
    [-1, 1].forEach((side) => {
      const obelisk = new THREE.Mesh(
        track(new THREE.CylinderGeometry(0.2, 0.38, 2.8, 4)),
        sandMat,
      );
      obelisk.position.set(side * 1.8, 1.4, rimOuter * 0.85);
      obelisk.rotation.y = Math.PI / 4;
      group.add(obelisk);
    });

    // Terracotta Amphora Urns
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.3;
      const urn = new THREE.Mesh(track(new THREE.CylinderGeometry(0.25, 0.15, 0.65, 8)), terraMat);
      urn.position.set(Math.cos(angle) * (rimOuter * 0.72), 0.32, Math.sin(angle) * (rimOuter * 0.72));
      group.add(urn);
    }

  } else if (subjectId === 'pine') {
    // NORDIC FOREST ENVIRONMENT: Campfire, Split Logs, Wild Mushrooms, Granite Rocks
    const woodMat = track(new THREE.MeshLambertMaterial({ color: 0x5a3e2a }));
    const fireMat = track(new THREE.MeshBasicMaterial({ color: 0xff6622 }));
    const rockMat = track(new THREE.MeshLambertMaterial({ color: 0x767873, flatShading: true }));

    // Campfire at front right corner
    const camp = new THREE.Group();
    camp.position.set(rimOuter * 0.75, 0, rimOuter * 0.75);

    const logGeo = track(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 5));
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(logGeo, woodMat);
      log.position.y = 0.08;
      log.rotation.y = (i * Math.PI) / 4;
      log.rotation.x = Math.PI / 2;
      camp.add(log);
    }
    const fire = new THREE.Mesh(track(new THREE.ConeGeometry(0.35, 0.8, 6)), fireMat);
    fire.position.y = 0.45;
    const fLight = new THREE.PointLight(0xff7722, 1.2, 12);
    fLight.position.y = 0.6;
    camp.add(fire, fLight);
    group.add(camp);

    // Nordic Granite Rocks
    const rockGeo = track(new THREE.DodecahedronGeometry(0.7, 0));
    [-1, 1].forEach((side) => {
      const r = new THREE.Mesh(rockGeo, rockMat);
      r.position.set(side * rimOuter * 0.75, 0.3, -rimOuter * 0.75);
      r.rotation.set(rng(), rng(), rng());
      group.add(r);
    });

  } else {
    // NATURE / BONSAI / OAK / WILLOW / BIRCH ENVIRONMENT: Zen Rocks, Wildflowers, Moss
    const rockMat = track(new THREE.MeshLambertMaterial({ color: 0x8a8882, flatShading: true }));
    const flowerMat = track(new THREE.MeshLambertMaterial({ color: 0xff70a6 }));

    const rockGeo = track(new THREE.DodecahedronGeometry(0.65, 0));
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.4;
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(Math.cos(angle) * (rimOuter * 0.75), 0.25, Math.sin(angle) * (rimOuter * 0.75));
      rock.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      rock.scale.set(0.8 + rng() * 0.4, 0.6 + rng() * 0.4, 0.8 + rng() * 0.4);
      group.add(rock);
    }

    // Wildflowers in grass
    const flGeo = track(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 5));
    for (let i = 0; i < 16; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rimInner + rng() * (rimOuter - rimInner);
      const fl = new THREE.Mesh(flGeo, flowerMat);
      fl.position.set(Math.cos(angle) * dist, 0.1, Math.sin(angle) * dist);
      fl.rotation.y = rng() * Math.PI;
      group.add(fl);
    }
  }

  // ------------------------------------------------------------- LIFECYCLE

  function applyPalette(_p: Palette) {
    // Colors adapt with the theme where applicable
  }

  function setMorph(t: number) {
    // Smoothly scale down early (0 to 0.4) so by the time the camera is overhead,
    // all objects are completely flat/hidden, guaranteeing 100% scannability!
    const visibility = Math.max(0, 1 - t * 2.8);
    group.scale.set(visibility, visibility, visibility);
    group.position.y = -t * 2.0;
    group.visible = visibility > 0.001;
  }

  function dispose() {
    disposables.forEach((d) => d.dispose());
  }

  applyPalette(palette);

  return { group, setMorph, applyPalette, dispose };
}
