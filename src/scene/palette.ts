export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter' | 'cyberpunk' | 'sunset';

export interface Palette {
  id: SeasonId;
  label: string;
  /** Canopy colours, sampled per leaf. */
  leaf: string[];
  /** Darker, high-contrast tones used once the leaves settle into QR modules. */
  qrLeaf: string[];
  bark: string;
  barkDark: string;
  hedge: string[];
  /** Colour of the raised (dark) QR modules on the ground slab. */
  moduleDark: string;
  moduleLight: string;
  slab: string;
  ground: string;
  moteColors?: string[];
}

/**
 * Spring lets the visitor repaint the blossom. Each swatch carries a canopy
 * tone and a much deeper `qr` tone: once the leaves become code modules they
 * have to stay dark enough for a scanner to binarise against the pale plot.
 */
export const BLOSSOM_SWATCHES = [
  { id: 'blush', label: 'Blush', leaf: ['#f4b8cf', '#efa4c2', '#f8cfe0', '#e88fb2'], qr: ['#5e2340', '#4e1c35', '#6b2b4a'] },
  { id: 'lilac', label: 'Lilac', leaf: ['#c3aae6', '#b295dd', '#d6c4f0', '#a17fd2'], qr: ['#392556', '#2f1e48', '#432d63'] },
  { id: 'poppy', label: 'Poppy', leaf: ['#ef7c72', '#e35f56', '#f59a92', '#d64c45'], qr: ['#5c1a16', '#4d1512', '#69211c'] },
  { id: 'honey', label: 'Honey', leaf: ['#f2c25c', '#e8b141', '#f7d585', '#dda32c'], qr: ['#543c08', '#463105', '#61470d'] },
  { id: 'sky', label: 'Sky', leaf: ['#7cb6ea', '#63a4e0', '#9dcbf2', '#4a92d6'], qr: ['#16324d', '#122942', '#1b3b5a'] },
  { id: 'snow', label: 'Snow', leaf: ['#f4f1ea', '#e8e3d8', '#fbfaf6', '#ddd6c8'], qr: ['#46403a', '#3a3531', '#514a43'] },
] as const;

export type BlossomId = (typeof BLOSSOM_SWATCHES)[number]['id'];

export const SEASONS: Record<SeasonId, Palette> = {
  spring: {
    id: 'spring',
    label: 'Spring',
    leaf: ['#f4b8cf', '#efa4c2', '#f8cfe0', '#e88fb2'],
    qrLeaf: ['#5e2340', '#4e1c35', '#6b2b4a'],
    bark: '#8a6a4e',
    barkDark: '#5f4733',
    hedge: ['#8fbf6a', '#7bad57', '#a2cd7e'],
    moduleDark: '#d6d1c4',
    moduleLight: '#fdfbf6',
    slab: '#cfc9bb',
    ground: '#f6f1e7',
  },
  summer: {
    id: 'summer',
    label: 'Summer',
    leaf: ['#6ab24a', '#5aa03c', '#84c664', '#4c8f31'],
    qrLeaf: ['#255417', '#1e4512', '#2c631d'],
    bark: '#8a6a4e',
    barkDark: '#5f4733',
    hedge: ['#7ec25a', '#6bb047', '#93d06f'],
    moduleDark: '#d6d1c4',
    moduleLight: '#fdfbf6',
    slab: '#cfc9bb',
    ground: '#f6f1e7',
  },
  autumn: {
    id: 'autumn',
    label: 'Autumn',
    leaf: ['#f2a13c', '#e8842a', '#f7c05e', '#d96a1f'],
    qrLeaf: ['#8a400c', '#763409', '#9c4c12'],
    bark: '#6f5540',
    barkDark: '#4a382a',
    hedge: ['#dcb84a', '#c9a437', '#e8cc6a'],
    moduleDark: '#d6d1c4',
    moduleLight: '#fdfbf6',
    slab: '#cfc9bb',
    ground: '#f6f1e7',
  },
  winter: {
    id: 'winter',
    label: 'Winter',
    leaf: ['#cbe3f5', '#b3d7f2', '#e1f0fa', '#9cc9eb'],
    qrLeaf: ['#17334d', '#112538', '#1e405e'],
    bark: '#5c6470',
    barkDark: '#3e444d',
    hedge: ['#d8e6f0', '#c2d9e8', '#e9f2f8'],
    moduleDark: '#cbd5e1',
    moduleLight: '#f8fafc',
    slab: '#c4d1de',
    ground: '#f0f4f8',
  },
  cyberpunk: {
    id: 'cyberpunk',
    label: 'Cyber',
    leaf: ['#00f0ff', '#ff007f', '#7928ca', '#00e5ff'],
    qrLeaf: ['#1b0d2a', '#10061c', '#241038'],
    bark: '#3b384d',
    barkDark: '#211f2e',
    hedge: ['#00f0ff', '#bd00ff', '#00b8ff'],
    moduleDark: '#b8c0d4',
    moduleLight: '#f5f7fa',
    slab: '#a3aec4',
    ground: '#eceef4',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    leaf: ['#ff6b6b', '#f9844a', '#f9c74f', '#e76f51'],
    qrLeaf: ['#541414', '#420d0d', '#631c1c'],
    bark: '#5e433a',
    barkDark: '#3d2b25',
    hedge: ['#f39c12', '#e67e22', '#d35400'],
    moduleDark: '#dbc8be',
    moduleLight: '#fdf8f5',
    slab: '#cfb9ad',
    ground: '#f7efe9',
  },
};

export const SEASON_ORDER: SeasonId[] = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'cyberpunk',
  'sunset',
];
