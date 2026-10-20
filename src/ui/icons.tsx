const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const SpringIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 5a3.5 3.5 0 0 1 0 7M19 12a3.5 3.5 0 0 1-7 0M12 19a3.5 3.5 0 0 1 0-7M5 12a3.5 3.5 0 0 1 7 0" />
  </svg>
);

export const SummerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </svg>
);

export const AutumnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 21c-4.4 0-8-3.6-8-8 0-4.8 4.2-9 8-11 3.8 2 8 6.2 8 11 0 4.4-3.6 8-8 8Z" />
    <path d="M12 7v14M8.5 13l3.5-3 3.5 3" />
  </svg>
);

export const WinterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 3v18M3 12h18M6.5 6.5l11 11M6.5 17.5l11-11M12 7l2-2M12 17l-2 2M7 12l-2-2M17 12l2 2" />
  </svg>
);

export const CyberIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <circle cx="17.5" cy="17.5" r="3.5" />
  </svg>
);

export const SunsetIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M17 18a5 5 0 0 0-10 0M12 4v4M4.5 10l2.5 1.5M19.5 10l-2.5 1.5M2 18h20M4 21h16" />
  </svg>
);

export const ShareIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={1.8}>
    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    <path d="m16 6-4-4-4 4M12 2v13" />
  </svg>
);

export const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={1.8}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

export const CameraResetIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6" />
    <circle cx="12" cy="7.5" r="0.8" fill="currentColor" />
  </svg>
);
export const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

export const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);


export const SoundOnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

export const SoundOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M11 5 6 9H2v6h4l5 4V5ZM22 9l-6 6M16 9l6 6" />
  </svg>
);

export const BrandMark = () => (
  <svg className="brand__mark" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="2" width="7" height="7" fill="currentColor" rx="1.5" />
    <rect x="4" y="4" width="3" height="3" fill="#f6f1e7" rx="0.6" />
    <rect x="15" y="2" width="7" height="7" fill="currentColor" rx="1.5" />
    <rect x="17" y="4" width="3" height="3" fill="#f6f1e7" rx="0.6" />
    <rect x="2" y="15" width="7" height="7" fill="currentColor" rx="1.5" />
    <rect x="4" y="17" width="3" height="3" fill="#f6f1e7" rx="0.6" />
    <path d="M12 8c-2.4 0-4 1.6-4 3.6 0 1.5.9 2.7 2.2 3.2L10 20h4l-.2-5.2c1.3-.5 2.2-1.7 2.2-3.2 0-2-1.6-3.6-4-3.6Z" fill="currentColor" />
  </svg>
);

/* ------------------------------------------------------------------ species */

export const OakIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 21v-6M10 15c-3 0-5-2-5-5 0-3.5 2.5-6 7-6s7 2.5 7 6c0 3-2 5-5 5" />
  </svg>
);

export const PineIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 21v-4" />
    <path d="m12 3 5 6h-3l4 6h-4l3 4H7l3-4H6l4-6H7l5-6Z" />
  </svg>
);

export const WillowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 21v-7" />
    <path d="M12 14c-4 0-6 3-7 7M12 12c-2-3-4-2-6 3M12 14c4 0 6 3 7 7M12 12c2-3 4-2 6 3" />
  </svg>
);

export const BirchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 21V3M10 8h2M12 12h2M10 16h2" />
    <path d="M12 4c-2.5 0-4 3-4 7s1.5 8 4 8 4-4 4-8-1.5-7-4-7Z" />
  </svg>
);

export const SakuraIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 21v-6M12 15c-3-1-5-3-5-6 0-3 2-5 5-5s5 2 5 5c0 3-2 5-5 6" />
    <circle cx="12" cy="9" r="1.5" fill="currentColor" />
  </svg>
);

export const BonsaiIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M5 19h14M7 19l1 3h8l1-3M12 19c-1-3 1-5-1-8-2-2-4-1-6 0M11 11c2-1 4-3 6-1" />
    <ellipse cx="6" cy="9" rx="3.5" ry="2" />
    <ellipse cx="16" cy="8" rx="4" ry="2" />
  </svg>
);

export const CrystalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 2 4 9l8 13 8-13-8-7ZM4 9h16M12 2v20M8 9l4 13M16 9l-4 13" />
  </svg>
);

export const PalmIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 21c-1-5 0-9 1-13M13 8c-3-3-8-3-10 1M13 8c3-3 8-3 10 1M13 8c-2-5-6-6-8-6M13 8c2-5 6-6 8-6" />
  </svg>
);
export const CastleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M4 21V9l2-2 2 2 4-4 4 4 2-2 2 2v12H4Z" />
    <path d="M9 21v-5a3 3 0 0 1 6 0v5M4 14h16" />
  </svg>
);
export const ShipIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M2 19c3 2 7 2 10 0 3 2 7 2 10 0" />
    <path d="M4 17l1.5-6h13l1.5 6H4Z" />
    <path d="M12 11V3l6 4-6 4" />
    <path d="M7 11V6l4 2.5-4 2.5" />
  </svg>
);


export const AngelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v8M10 12l2 3 2-3" />
    <path d="M10 9C6 7 3 9 2 13c3 1 6 0 8-2M14 9c4-2 7 0 8 4-3 1-6 0-8-2" />
  </svg>
);

export const CraneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M11 21v-7l3-3 4 1-5 4v5" />
    <path d="M14 11c-1-3 0-7 2-9l5 1" />
    <path d="M10 12c-4 0-7 2-8 5 3 0 6-1 8-3" />
    <path d="M2 21c3 0 7-1 11-1" />
  </svg>
);

export const PyramidIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="m12 2-9 18h18L12 2ZM12 2v18" />
  </svg>
);


/* --------------------------------------------------------------- QR styles */

export const QrLeafIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

export const QrVoxelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export const QrPebbleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const QrTowerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <rect x="6" y="3" width="12" height="18" rx="1" />
    <path d="M9 7h6M9 11h6M9 15h6" />
  </svg>
);
