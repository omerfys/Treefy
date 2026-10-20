import * as THREE from 'three';
import { buildQr, type QrMatrix } from './qr';
import { buildPlot, type PlotMeshes } from './plot';
import { buildCanopy, type Canopy, type QrStyle } from './canopy';
import { buildMotes, type Motes } from './motes';
import { buildDecorations, type Decorations } from './decorations';
import { CELL, HEDGE_RING, ISO_AZIMUTH, ISO_ELEVATION, TOP_ELEVATION } from './constants';
import { clamp01, lerp, easeInOutCubic } from './rng';
import type { Palette } from './palette';
import { SPECIES, type Species, type SpeciesId } from './species';

export type ViewMode = 'tree' | 'code';

/** Seconds for a full canopy <-> code transition. */
const MORPH_SECONDS = 0.95;

export class MagicTreeScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
  private key: THREE.DirectionalLight;
  private ambient: THREE.AmbientLight;
  private hemi: THREE.HemisphereLight;

  private plot!: PlotMeshes;
  private canopy!: Canopy;
  private motes!: Motes;
  private decorations!: Decorations;
  private qr!: QrMatrix;
  private world = new THREE.Group();
  private target = new THREE.Vector3();
  private offset = new THREE.Vector3();


  private palette: Palette;
  private species: Species;
  private qrStyle: QrStyle = 'leaf';


  private morph = 0;
  private morphTarget = 0;
  private lastTime = 0;
  private elapsed = 0;
  private raf = 0;
  private disposed = false;

  private currentHalfW = 20;
  private currentHalfV = 20;
  private targetHalfW = 20;
  private targetHalfV = 20;
  private isoCenter = new THREE.Vector3();
  private rimUnits = 40;
  /** Height of the control dock in CSS px, reported by the UI. */
  private dockPx = 200;

  // Interactive camera rotation
  private userAzimuth = 0;
  private userElevation = 0;
  private isDragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private startPointerX = 0;
  private startPointerY = 0;
  private hasDragged = false;
  private morphStartAzimuth = ISO_AZIMUTH;
  private morphStartElevation = ISO_ELEVATION;
  private morphTargetAzimuth = 0;

  onMorphChange?: (t: number) => void;

  private canvas: HTMLCanvasElement;

  constructor(
    canvas: HTMLCanvasElement,
    text: string,
    palette: Palette,
    species: Species = SPECIES.oak,
    qrStyle: QrStyle = 'leaf',
  ) {
    this.canvas = canvas;
    this.palette = palette;
    this.species = species;
    this.qrStyle = qrStyle;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.scene.background = new THREE.Color(palette.ground);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.62);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0xd8cfbe, 0.5);
    this.key = new THREE.DirectionalLight(0xfff6e6, 1.15);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    this.key.shadow.bias = -0.0006;
    this.scene.add(this.ambient, this.hemi, this.key, this.key.target);

    this.scene.add(this.world);
    this.build(text);
    this.resize();
    this.setupPointerControls();

    this.lastTime = performance.now();
    this.loop();

    if (import.meta.env.DEV) {
      (window as unknown as { __magicTree?: MagicTreeScene }).__magicTree = this;
    }
  }

  // ---------------------------------------------------------------- build

  private build(text: string) {
    this.qr = buildQr(text);
    this.plot = buildPlot(this.qr, this.palette);
    this.canopy = buildCanopy(this.qr, this.palette, this.species, this.qrStyle);
    this.motes = buildMotes(this.qr, this.palette);
    this.decorations = buildDecorations(this.qr.plot, this.palette, this.qr.darkCells.length, this.species.id);

    this.world.add(
      this.plot.group,
      this.canopy.group,
      this.motes.points,
      this.decorations.group,
    );

    const rim = (this.qr.plot + HEDGE_RING * 2) * CELL;
    this.rimUnits = rim;
    this.measureIsoFraming(rim);

    const shadowExtent = rim * 0.8;
    const cam = this.key.shadow.camera;
    cam.left = -shadowExtent;
    cam.right = shadowExtent;
    cam.top = shadowExtent;
    cam.bottom = -shadowExtent;
    cam.near = 1;
    cam.far = 400;
    cam.updateProjectionMatrix();

    this.canopy.setMorph(this.morph, 0);
    this.decorations.setMorph(this.morph);
  }

  private measureIsoFraming(rim: number) {
    const { canopyTop, canopyRadius } = this.canopy.model;

    const dir = new THREE.Vector3(
      Math.cos(ISO_ELEVATION) * Math.sin(ISO_AZIMUTH),
      Math.sin(ISO_ELEVATION),
      Math.cos(ISO_ELEVATION) * Math.cos(ISO_AZIMUTH),
    ).normalize();
    const forward = dir.clone().negate();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, forward).normalize();

    const half = rim / 2;
    const points: THREE.Vector3[] = [
      new THREE.Vector3(-half, 0, -half),
      new THREE.Vector3(half, 0, -half),
      new THREE.Vector3(-half, 0, half),
      new THREE.Vector3(half, 0, half),
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        points.push(new THREE.Vector3(sx * canopyRadius, 0, sz * canopyRadius));
        points.push(new THREE.Vector3(sx * canopyRadius, canopyTop, sz * canopyRadius));
      }
    }

    let wMin = Infinity;
    let wMax = -Infinity;
    let vMin = Infinity;
    let vMax = -Infinity;
    for (const pt of points) {
      const w = pt.dot(right);
      const v = pt.dot(up);
      wMin = Math.min(wMin, w);
      wMax = Math.max(wMax, w);
      vMin = Math.min(vMin, v);
      vMax = Math.max(vMax, v);
    }

    this.targetHalfW = (wMax - wMin) / 2;
    this.targetHalfV = (vMax - vMin) / 2;
    if (this.currentHalfW === 20 && this.targetHalfW !== 20) {
      this.currentHalfW = this.targetHalfW;
      this.currentHalfV = this.targetHalfV;
    }
    this.isoCenter
      .set(0, 0, 0)
      .addScaledVector(right, (wMin + wMax) / 2)
      .addScaledVector(up, (vMin + vMax) / 2);
  }

  private teardown() {
    this.world.remove(
      this.plot.group,
      this.canopy.group,
      this.motes.points,
      this.decorations.group,
    );
    this.canopy.dispose();
    this.motes.dispose();
    this.decorations.dispose();
    this.plot.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | undefined;
      mat?.dispose();
    });
  }

  // ------------------------------------------------------------- pointer
  private setupPointerControls() {
    const onPointerDown = (e: PointerEvent) => {
      if (this.morph > 0.4) return;
      this.isDragging = true;
      this.hasDragged = false;
      this.startPointerX = e.clientX;
      this.startPointerY = e.clientY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging || this.morph > 0.4) return;
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      if (Math.hypot(e.clientX - this.startPointerX, e.clientY - this.startPointerY) > 5) {
        this.hasDragged = true;
      }

      this.userAzimuth += dx * 0.008;
      this.userElevation = Math.max(-0.45, Math.min(0.45, this.userElevation - dy * 0.008));
      this.morphStartAzimuth = ISO_AZIMUTH + this.userAzimuth;
      this.morphStartElevation = ISO_ELEVATION + this.userElevation;
      this.updateCamera();
    };

    const onPointerUp = () => {
      this.isDragging = false;
      // Keep hasDragged true momentarily so that the browser's subsequent click event ignores it!
      setTimeout(() => {
        this.hasDragged = false;
      }, 100);
    };

    this.canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  // ----------------------------------------------------------------- api

  setText(text: string) {
    if (text === this.qr.text) return;
    this.teardown();
    this.build(text);
  }

  setSpecies(species: SpeciesId | Species) {
    const next = typeof species === 'string' ? SPECIES[species] : species;
    if (next.id === this.species.id) return;
    this.species = next;
    const text = this.qr.text;
    this.teardown();
    this.build(text);
  }

  setQrStyle(style: QrStyle) {
    if (style === this.qrStyle) return;
    this.qrStyle = style;
    const text = this.qr.text;
    this.teardown();
    this.build(text);
  }



  resetCamera() {
    this.userAzimuth = 0;
    this.userElevation = 0;
    this.morphStartAzimuth = ISO_AZIMUTH;
    this.morphStartElevation = ISO_ELEVATION;
    this.morphTargetAzimuth = 0;
    this.updateCamera(true);
  }

  setDockHeight(px: number) {
    const next = Math.max(0, px);
    if (Math.abs(next - this.dockPx) < 1) return;
    this.dockPx = next;
    this.updateCamera(true);
  }

  setPalette(palette: Palette) {
    this.palette = palette;
    (this.scene.background as THREE.Color).set(palette.ground);
    this.plot.applyPalette(palette);
    this.canopy.applyPalette(palette);
    this.motes.applyPalette(palette);
    this.decorations.applyPalette(palette);
  }
  private isDarkMode = false;

  setDarkMode(dark: boolean) {
    this.isDarkMode = dark;
    const bgCol = dark ? '#0f1218' : this.palette.ground;
    (this.scene.background as THREE.Color).set(bgCol);
    if (dark) {
      this.ambient.intensity = lerp(0.4, 1.8, this.morph);
      this.ambient.color.set('#3a4759');
      this.hemi.color.set('#8fa8c9');
      this.hemi.groundColor.set('#0b0e14');
      this.key.color.set('#fff2db');
    } else {
      this.ambient.intensity = lerp(0.62, 2.45, this.morph);
      this.ambient.color.set(0xffffff);
      this.hemi.color.set(0xffffff);
      this.hemi.groundColor.set(0xd8cfbe);
      this.key.color.set('#fff6e6');
    }
    this.plot.applyPalette(this.palette);
  }
  get darkMode(): boolean {
    return this.isDarkMode;
  }



  setMode(mode: ViewMode) {
    const next = mode === 'code' ? 1 : 0;
    if (next !== this.morphTarget) {
      if (next === 1) {
        this.morphStartAzimuth = ISO_AZIMUTH + this.userAzimuth;
        this.morphStartElevation = ISO_ELEVATION + this.userElevation;
        const quarter = Math.PI / 2;
        this.morphTargetAzimuth = Math.round(this.morphStartAzimuth / quarter) * quarter;
      }
      this.morphTarget = next;
    }
  }

  toggleMode() {
    const next = this.morphTarget > 0.5 ? 0 : 1;
    if (next === 1) {
      this.morphStartAzimuth = ISO_AZIMUTH + this.userAzimuth;
      this.morphStartElevation = ISO_ELEVATION + this.userElevation;
      const quarter = Math.PI / 2;
      this.morphTargetAzimuth = Math.round(this.morphStartAzimuth / quarter) * quarter;
    }
    this.morphTarget = next;
    return this.morphTarget > 0.5 ? 'code' : 'tree';
  }

  get mode(): ViewMode {
    return this.morphTarget > 0.5 ? 'code' : 'tree';
  }

  get currentQrStyle(): QrStyle {
    return this.qrStyle;
  }

  get wasDragged(): boolean {
    return this.hasDragged;
  }



  /** PNG of the current framing, for download/share. */
  snapshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL('image/png');
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.updateCamera(true);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.teardown();
    this.renderer.dispose();
  }

  // -------------------------------------------------------------- camera

  private updateCamera(force = false) {
    const t = easeInOutCubic(this.morph);
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    const aspect = w / h;

    const margin = 1.05;
    const dockPx = Math.min(this.dockPx + 18, h * 0.5);
    const usable = Math.max(h - dockPx, h * 0.4);

    const fit = (halfW: number, halfV: number) => {
      const half = Math.max(halfV * (h / usable), halfW / aspect) * margin;
      return { half, shift: (half * dockPx) / h };
    };

    const isoFit = fit(this.currentHalfW, this.currentHalfV);
    const halfRim = this.rimUnits / 2;
    const topFit = fit(halfRim, halfRim);

    const half = lerp(isoFit.half, topFit.half, t);
    const shift = lerp(isoFit.shift, topFit.shift, t);

    // Shift projection bounds so the 3D origin projects higher up (above dock),
    // while keeping target strictly at (0, 0, 0) with ZERO eccentric wobble!
    this.camera.left = -half * aspect;
    this.camera.right = half * aspect;
    this.camera.top = half - shift * 0.9;
    this.camera.bottom = -half - shift * 0.9;
    this.camera.near = -600;
    this.camera.far = 600;
    this.camera.updateProjectionMatrix();

    // Smooth camera transition from the current viewpoint to overhead view (nearest angle, zero excess spin)
    const azimuth = lerp(this.morphStartAzimuth, this.morphTargetAzimuth, t);
    const elevation = lerp(this.morphStartElevation, TOP_ELEVATION, t);
    const r = 220;

    this.offset.set(
      r * Math.cos(elevation) * Math.sin(azimuth),
      r * Math.sin(elevation),
      r * Math.cos(elevation) * Math.cos(azimuth),
    );

    // Pivot is pinned strictly on the vertical axis (x=0, z=0), so camera orbits cleanly around the QR code!
    const yPivot = lerp(this.isoCenter.y * 0.35, 0, t);
    this.target.set(0, yPivot, 0);
    this.camera.position.copy(this.target).add(this.offset);

    // Prevent gimbal lock when looking straight down in QR code mode
    if (t > 0.95) {
      this.camera.up.set(-Math.sin(this.morphTargetAzimuth), 0, -Math.cos(this.morphTargetAzimuth));
    } else {
      this.camera.up.set(0, 1, 0);
    }
    this.camera.lookAt(this.target);
    if (force) this.camera.updateMatrixWorld();

    this.key.intensity = lerp(1.15, 0.14, t);
    this.ambient.intensity = lerp(0.62, 2.45, t);
    this.hemi.intensity = lerp(0.5, 0.18, t);
    this.key.castShadow = t < 0.6;
    this.key.position.set(-60, 120, 70).add(this.target);
    this.key.target.position.copy(this.target);
    this.key.target.updateMatrixWorld();
  }

  // ---------------------------------------------------------------- loop

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.elapsed += dt;
    const time = this.elapsed;
    // Smooth gradual camera widening when selecting tall/wide models like Palmiye
    const diffW = Math.abs(this.currentHalfW - this.targetHalfW);
    const diffV = Math.abs(this.currentHalfV - this.targetHalfV);
    if (diffW > 0.05 || diffV > 0.05) {
      const k = 1 - Math.exp(-dt * 3.8);
      this.currentHalfW = lerp(this.currentHalfW, this.targetHalfW, k);
      this.currentHalfV = lerp(this.currentHalfV, this.targetHalfV, k);
      this.updateCamera();
    }


    if (this.morph !== this.morphTarget) {
      const step = dt / MORPH_SECONDS;
      const dir = Math.sign(this.morphTarget - this.morph);
      this.morph = clamp01(
        dir > 0
          ? Math.min(this.morph + step, this.morphTarget)
          : Math.max(this.morph - step, this.morphTarget),
      );
      this.onMorphChange?.(this.morph);
      this.updateCamera();
    }

    this.canopy.setMorph(this.morph, time);
    this.decorations.setMorph(this.morph);
    this.motes.update(dt, time, 1 - this.morph);
    this.renderer.render(this.scene, this.camera);
  };
}
