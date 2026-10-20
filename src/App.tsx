import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MagicTreeScene, type ViewMode } from './scene';
import {
  SEASONS,
  SEASON_ORDER,
  BLOSSOM_SWATCHES,
  type SeasonId,
  type BlossomId,
  type Palette,
} from './scene/palette';
import { SPECIES, SPECIES_ORDER, type SpeciesId } from './scene/species';
import { QR_STYLES, type QrStyle } from './scene/canopy';
import { Ambience } from './audio/ambience';
import {
  MoonIcon,
  SunIcon,
  ShareIcon,
  DownloadIcon,
  CameraResetIcon,
  InfoIcon,
  SoundOnIcon,
  SoundOffIcon,
} from './ui/icons';

const DEFAULT_URL = 'https://example.com';

type DockTab = 'worlds' | 'qrStyle' | 'themes';

const REBUILD_DELAY = 500;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MagicTreeScene | null>(null);
  const ambienceRef = useRef<Ambience | null>(null);

  const [draft, setDraft] = useState(DEFAULT_URL);
  const [committed, setCommitted] = useState(DEFAULT_URL);
  const [season, setSeason] = useState<SeasonId>('summer');
  const [species, setSpecies] = useState<SpeciesId>('oak');
  const [qrStyle, setQrStyle] = useState<QrStyle>('voxel');
  const [blossom, setBlossom] = useState<BlossomId>('blush');
  const [activeTab, setActiveTab] = useState<DockTab>('worlds');
  const [mode, setMode] = useState<ViewMode>('tree');
  const [muted, setMuted] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const palette = useMemo<Palette>(() => {
    const base = SEASONS[season];
    const spTheme = SPECIES[species].worldTheme;
    let res = base;
    if (season === 'spring') {
      const swatch = BLOSSOM_SWATCHES.find((s) => s.id === blossom) ?? BLOSSOM_SWATCHES[0];
      res = { ...base, leaf: [...swatch.leaf], qrLeaf: [...swatch.qr] };
    }
    if (spTheme) {
      res = {
        ...res,
        ground: spTheme.ground,
        slab: spTheme.slab,
        moduleLight: spTheme.moduleLight,
        moduleDark: spTheme.moduleDark,
        hedge: [...base.hedge],
        moteColors: spTheme.moteColors ? [...spTheme.moteColors] : undefined,
      };
    }
    return res;
  }, [season, blossom, species]);

  // ---- scene lifecycle ---------------------------------------------------

  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new MagicTreeScene(
      canvasRef.current,
      committed,
      palette,
      SPECIES[species],
      qrStyle,
    );
    sceneRef.current = scene;

    const onResize = () => scene.resize();
    window.addEventListener('orientationchange', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(canvasRef.current);

    return () => {
      window.removeEventListener('orientationchange', onResize);
      ro.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setPalette(palette);
  }, [palette]);

  useEffect(() => {
    sceneRef.current?.setText(committed);
  }, [committed]);

  useEffect(() => {
    sceneRef.current?.setMode(mode);
  }, [mode]);

  useEffect(() => {
    sceneRef.current?.setSpecies(species);
  }, [species]);

  useEffect(() => {
    sceneRef.current?.setQrStyle(qrStyle);
  }, [qrStyle]);

  useEffect(() => {
    sceneRef.current?.setDarkMode(isDark);
  }, [isDark]);

  // Report the dock's real height so the code is never framed underneath it.
  useEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    const report = () => sceneRef.current?.setDockHeight(el.getBoundingClientRect().height);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setCommitted(draft.trim() || DEFAULT_URL), REBUILD_DELAY);
    return () => window.clearTimeout(t);
  }, [draft]);

  useEffect(() => {
    ambienceRef.current = new Ambience();
    return () => ambienceRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // ---- interactions ------------------------------------------------------

  const toggleMode = useCallback(() => {
    setMode((m) => {
      const next: ViewMode = m === 'tree' ? 'code' : 'tree';
      if (next === 'code') ambienceRef.current?.chord();
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    const on = ambienceRef.current?.toggle() ?? false;
    setMuted(!on);
  }, []);

  const downloadPng = useCallback(() => {
    if (!sceneRef.current) return;
    const dataUrl = sceneRef.current.snapshot();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `treefy-${species}-${mode}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setToast('Gorsel indirildi');
  }, [species, mode]);

  const resetCamera = useCallback(() => {
    sceneRef.current?.resetCamera();
    setToast('3D Aci Sifirlandi');
  }, []);

  const share = useCallback(async () => {
    const url = committed;
    const payload = {
      title: 'Treefy 3D QR Illusion Studio',
      text: '3D İllüzyon QR Kod Üretici.',
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast('Baglanti kopyalandi');
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setToast('Paylaşılamadı');
      }
    }
  }, [committed]);

  const onCanvasKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMode();
    }
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    if (sceneRef.current?.wasDragged) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    toggleMode();
  };


  const hint = mode === 'tree'
    ? 'QR Kodunu Gormek Icin Modele Dokunun'
    : '3D Sahneye Donmek Icin Dokunun';

  return (
    <div className={`stage ${isDark ? 'theme-dark' : ''}`} style={{ background: isDark ? '#0f1218' : palette.ground }}>


      {/* Top action toolbar */}
      <div className="top-actions">
        <button
          className="action-btn"
          type="button"
          title={isDark ? "Acik Tema" : "Koyu Tema"}
          aria-label="Tema degistir"
          onClick={() => setIsDark((v) => !v)}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          className="action-btn"
          type="button"
          title="3D Görünüm Açısını Sıfırla"
          aria-label="3D açıyı sıfırla"
          onClick={resetCamera}
        >
          <CameraResetIcon />
        </button>
        <button
          className="action-btn"
          type="button"
          title="PNG Olarak İndir"
          aria-label="Görseli indir"
          onClick={downloadPng}
        >
          <DownloadIcon />
        </button>

        <button
          className="action-btn"
          type="button"
          aria-pressed={!muted}
          aria-label={muted ? 'Sesi Aç' : 'Sesi Kapat'}
          title={muted ? 'Sesi Aç' : 'Sesi Kapat'}
          onClick={toggleSound}
        >
          {muted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>

        <button
          className="action-btn"
          type="button"
          aria-expanded={showInfo}
          aria-label="Hakkında"
          title="Proje Bilgisi"
          onClick={() => setShowInfo((v) => !v)}
        >
          <InfoIcon />
        </button>
      </div>

      {showInfo && (
        <div className="info__card info__card--modal" role="dialog" aria-label="Treefy Hakkında">
          <div className="info__card-header">
            <strong>Treefy 3D QR Illuzyon Studyosu</strong>
            <button className="info__card-close" onClick={() => setShowInfo(false)}>Kapat</button>
          </div>
          <p>
            Herhangi bir linki, 3D heykellere ve çevreleyen atmosferik objelere dönüştürür.
          </p>
          <p>
            - 3D Illuzyon: Kale, Turna Kusu, Melek Heykeli veya Doga modelleri bir illuzyon olusturur. Ekrana tikladiginizda tum parcalar zemine dokulerek Level H taranabilir QR koduna donusur!
          </p>
          <p>
            - Ortama Ozel Objeler: Her dunya kendi temasina uygun cevre objeleriyle (mesaleler, niluferler, mermer kaideler) otomatik olarak insa edilir.
          </p>
          <p>
            - 3D Serbest Aci: Fare ile surukleyerek sahneyi dilediginiz acidan cevirebilirsiniz.
          </p>
        </div>
      )}

      {/* Live scannable status badge */}
      <div className="scannable-badge" title="QR Kod Taranabilirlik Doğrulaması">
        <span className="badge-dot" />
        {mode === 'code' ? 'Taranabilir QR Aktif' : `3D ${SPECIES[species].label} Modu`}
      </div>

      <canvas
        ref={canvasRef}
        className="stage__canvas"
        role="button"
        tabIndex={0}
        aria-label={hint}
        onClick={onCanvasClick}
        onKeyDown={onCanvasKey}
      />

      <div className="dock" ref={dockRef}>
        <div className="dock__toast-anchor">
          {toast && <div className="toast">{toast}</div>}
          <button className={`hint ${mode === 'code' ? 'hint--active' : ''}`} type="button" onClick={toggleMode}>
            {hint}
          </button>
        </div>

        {/* Input link field */}
        <div className="field">
          <input
            className="field__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="https://baglanti-adresi.com"
            aria-label="QR yapılacak link"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <button
            className="field__action"
            type="button"
            onClick={share}
            aria-label="Linki paylaş"
            title="Bağlantıyı Paylaş / Kopyala"
          >
            <ShareIcon />
          </button>
        </div>

        {/* Dock Tab Selector */}
        <div className="dock-tabs">
          <button
            type="button"
            className={`dock-tab ${activeTab === 'worlds' ? 'active' : ''}`}
            onClick={() => setActiveTab('worlds')}
          >
            3D Objeler ({SPECIES[species].label})
          </button>
          <button
            type="button"
            className={`dock-tab ${activeTab === 'qrStyle' ? 'active' : ''}`}
            onClick={() => setActiveTab('qrStyle')}
          >
            QR Sekli ({QR_STYLES.find((s) => s.id === qrStyle)?.label})
          </button>
          <button
            type="button"
            className={`dock-tab ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            Tema ({SEASONS[season].label})
          </button>
        </div>

        {/* Tab 1: 3D Worlds & Subjects */}
        {activeTab === 'worlds' && (
          <div className="tab-pane worlds-grid">
            {SPECIES_ORDER.map((id) => (
              <button
                key={id}
                className="selector-btn"
                type="button"
                title={SPECIES[id].label}
                aria-pressed={species === id}
                onClick={() => setSpecies(id)}
              >
                <span className="selector-btn__label">{SPECIES[id].label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tab 2: QR Block Geometries */}
        {activeTab === 'qrStyle' && (
          <div className="tab-pane qr-styles-grid">
            {QR_STYLES.map((st) => (
              <button
                key={st.id}
                className="selector-btn"
                type="button"
                aria-pressed={qrStyle === st.id}
                onClick={() => setQrStyle(st.id)}
              >
                <span className="selector-btn__label">{st.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: Themes & Seasonal Colors */}
        {activeTab === 'themes' && (
          <div className="tab-pane themes-container">
            <div className="themes-row">
              {SEASON_ORDER.map((id) => (
                <button
                  key={id}
                  className="selector-btn"
                  type="button"
                  aria-pressed={season === id}
                  onClick={() => setSeason(id)}
                >
                  <span className="selector-btn__label">{SEASONS[id].label}</span>
                </button>
              ))}
            </div>

            {season === 'spring' && (
              <div className="blossoms">
                {BLOSSOM_SWATCHES.map((s) => (
                  <button
                    key={s.id}
                    className="blossom"
                    type="button"
                    aria-pressed={blossom === s.id}
                    aria-label={`${s.label} çiçeği`}
                    style={{ background: s.leaf[0] }}
                    onClick={() => setBlossom(s.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
