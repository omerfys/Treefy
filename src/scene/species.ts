export type SpeciesId =
  | 'oak'
  | 'pine'
  | 'willow'
  | 'birch'
  | 'sakura'
  | 'bonsai'
  | 'palm'
  | 'castle'
  | 'ship'
  | 'angel'
  | 'temple'
  | 'crane'
  | 'pyramid';

export interface WorldThemeColors {
  ground: string;
  slab: string;
  moduleLight: string;
  moduleDark: string;
  hedge: string[];
  moteColors?: string[];
}

export interface Species {
  id: SpeciesId;
  label: string;
  category: 'nature' | 'architecture' | 'fantasy' | 'scifi';
  /** Canopy height as a multiple of the plot width. */
  heightFactor: number;
  /** Trunk length as a fraction of total height. */
  trunkFraction: number;
  trunkRadius: number;
  maxDepth: number;
  /** Chance a node throws a third branch instead of two. */
  forkChance: number;
  /** Branching angle away from the parent, in radians. */
  spread: [number, number];
  /** How much shorter each generation gets. */
  lengthDecay: [number, number];
  radiusDecay: number;
  /** Floor on a branch's vertical direction, low in the trunk and up in the crown. */
  upBiasLow: number;
  upBiasHigh: number;
  /** Conifers keep a central leader running straight to the tip. */
  leader: boolean;
  /** Foliage only hangs on branches at least this deep. */
  leafFromDepth: number;
  /** Where along a branch foliage may sit, as a fraction of its length. */
  leafAlong: [number, number];
  /** Leaf cluster radius around each branch tip. */
  cluster: [number, number];
  /** Vertical squash (<1) or stretch (>1) of those clusters. */
  clusterYScale: number;
  leafSize: [number, number];
  /** Narrows the canopy toward the top: 0 is columnar, 1 is a cone. */
  taper: number;
  bark?: { bark: string; barkDark: string };
  worldTheme?: WorldThemeColors;
}

export const SPECIES: Record<SpeciesId, Species> = {
  oak: {
    id: 'oak',
    label: 'Meşe (Oak)',
    category: 'nature',
    heightFactor: 0.86,
    trunkFraction: 0.23,
    trunkRadius: 0.033,
    maxDepth: 7,
    forkChance: 0.28,
    spread: [0.8, 1.38],
    lengthDecay: [0.72, 0.85],
    radiusDecay: 0.68,
    upBiasLow: 0.28,
    upBiasHigh: -0.18,
    leader: false,
    leafFromDepth: 3,
    leafAlong: [0.35, 1],
    cluster: [0.45, 1.4],
    clusterYScale: 0.62,
    leafSize: [0.5, 0.95],
    taper: 0.15,
  },
  pine: {
    id: 'pine',
    label: 'Çam (Pine)',
    category: 'nature',
    heightFactor: 0.92,
    trunkFraction: 0.2,
    trunkRadius: 0.026,
    maxDepth: 5,
    forkChance: 0.75,
    spread: [1.05, 1.4],
    lengthDecay: [0.6, 0.74],
    radiusDecay: 0.6,
    upBiasLow: -0.12,
    upBiasHigh: -0.32,
    leader: true,
    leafFromDepth: 1,
    leafAlong: [0.15, 1],
    cluster: [0.25, 0.65],
    clusterYScale: 0.45,
    leafSize: [0.36, 0.65],
    taper: 0.88,
    worldTheme: {
      ground: '#f1f5f2',
      slab: '#b8ccb9',
      moduleLight: '#fafdfa',
      moduleDark: '#93ab95',
      hedge: ['#2d6a4f', '#40916c', '#52b788', '#74c69d'],
    },
  },
  willow: {
    id: 'willow',
    label: 'Salkımsöğüt',
    category: 'nature',
    heightFactor: 0.82,
    trunkFraction: 0.26,
    trunkRadius: 0.036,
    maxDepth: 7,
    forkChance: 0.32,
    spread: [0.7, 1.3],
    lengthDecay: [0.74, 0.87],
    radiusDecay: 0.66,
    upBiasLow: 0.18,
    upBiasHigh: -0.42,
    leader: false,
    leafFromDepth: 4,
    leafAlong: [0.45, 1],
    cluster: [0.5, 1.6],
    clusterYScale: 1.45,
    leafSize: [0.45, 0.9],
    taper: 0.1,
  },
  birch: {
    id: 'birch',
    label: 'Gümüş Huş',
    category: 'nature',
    heightFactor: 0.98,
    trunkFraction: 0.32,
    trunkRadius: 0.022,
    maxDepth: 6,
    forkChance: 0.24,
    spread: [0.45, 0.95],
    lengthDecay: [0.7, 0.82],
    radiusDecay: 0.64,
    upBiasLow: 0.62,
    upBiasHigh: 0.28,
    leader: false,
    leafFromDepth: 3,
    leafAlong: [0.4, 1],
    cluster: [0.35, 1.1],
    clusterYScale: 0.85,
    leafSize: [0.38, 0.75],
    taper: 0.35,
    bark: { bark: '#eae6de', barkDark: '#2c2824' },
  },
  sakura: {
    id: 'sakura',
    label: 'Sakura',
    category: 'nature',
    heightFactor: 0.85,
    trunkFraction: 0.22,
    trunkRadius: 0.034,
    maxDepth: 7,
    forkChance: 0.36,
    spread: [0.82, 1.42],
    lengthDecay: [0.74, 0.86],
    radiusDecay: 0.69,
    upBiasLow: 0.24,
    upBiasHigh: -0.14,
    leader: false,
    leafFromDepth: 3,
    leafAlong: [0.3, 1],
    cluster: [0.52, 1.5],
    clusterYScale: 0.55,
    leafSize: [0.52, 0.98],
    taper: 0.12,
    bark: { bark: '#523c32', barkDark: '#35241e' },
    worldTheme: {
      ground: '#fcf3f5',
      slab: '#d8c2c8',
      moduleLight: '#fff9fb',
      moduleDark: '#be9ea6',
      hedge: ['#ffb7b2', '#ffccd5', '#f8bbd0', '#ff8fa3'],
    },
  },
  bonsai: {
    id: 'bonsai',
    label: 'Bonsai',
    category: 'nature',
    heightFactor: 0.7,
    trunkFraction: 0.24,
    trunkRadius: 0.042,
    maxDepth: 6,
    forkChance: 0.22,
    spread: [0.95, 1.55],
    lengthDecay: [0.68, 0.82],
    radiusDecay: 0.66,
    upBiasLow: 0.12,
    upBiasHigh: -0.3,
    leader: false,
    leafFromDepth: 2,
    leafAlong: [0.4, 1],
    cluster: [0.65, 1.7],
    clusterYScale: 0.36,
    leafSize: [0.55, 1.05],
    taper: 0.08,
    bark: { bark: '#4a372c', barkDark: '#2e2019' },
    worldTheme: {
      ground: '#f5ede4',
      slab: '#cfc0b0',
      moduleLight: '#faf6f0',
      moduleDark: '#b29f8d',
      hedge: ['#8a9087', '#5f655c', '#a4aaa1'],
    },
  },
  palm: {
    id: 'palm',
    label: 'Palmiye',
    category: 'nature',
    heightFactor: 0.95,
    trunkFraction: 0.62,
    trunkRadius: 0.028,
    maxDepth: 4,
    forkChance: 0.42,
    spread: [1.1, 1.55],
    lengthDecay: [0.6, 0.78],
    radiusDecay: 0.6,
    upBiasLow: 0.72,
    upBiasHigh: -0.45,
    leader: false,
    leafFromDepth: 2,
    leafAlong: [0.5, 1],
    cluster: [0.62, 1.8],
    clusterYScale: 0.42,
    leafSize: [0.62, 1.2],
    taper: 0.12,
    bark: { bark: '#9c7951', barkDark: '#6b4f32' },
  },

  // ------------------------------------------------------------- ARCHITECTURE & WORLDS
  castle: {
    id: 'castle',
    label: 'Kale Sehir',
    category: 'architecture',
    heightFactor: 0.9,
    trunkFraction: 0.4,
    trunkRadius: 0.045,
    maxDepth: 5,
    forkChance: 0.5,
    spread: [0.8, 1.2],
    lengthDecay: [0.7, 0.85],
    radiusDecay: 0.7,
    upBiasLow: 0.5,
    upBiasHigh: 0.3,
    leader: false,
    leafFromDepth: 1,
    leafAlong: [0.2, 1],
    cluster: [0.6, 1.5],
    clusterYScale: 0.8,
    leafSize: [0.65, 1.15],
    taper: 0.15,
    bark: { bark: '#6e7075', barkDark: '#44464a' },
    worldTheme: {
      ground: '#eae6df',
      slab: '#c2beaf',
      moduleLight: '#fcfbf7',
      moduleDark: '#a3a093',
      hedge: ['#787c82', '#9fa3a6', '#5a5e65'],
    },
  },
  ship: {
    id: 'ship',
    label: 'Korsan Gemisi',
    category: 'fantasy',
    heightFactor: 0.98,
    trunkFraction: 0.35,
    trunkRadius: 0.04,
    maxDepth: 5,
    forkChance: 0.4,
    spread: [0.6, 1.1],
    lengthDecay: [0.75, 0.88],
    radiusDecay: 0.7,
    upBiasLow: 0.5,
    upBiasHigh: 0.3,
    leader: false,
    leafFromDepth: 1,
    leafAlong: [0.2, 1],
    cluster: [0.6, 1.5],
    clusterYScale: 0.8,
    leafSize: [0.7, 1.25],
    taper: 0.2,
    bark: { bark: '#382010', barkDark: '#1c0f07' },
    worldTheme: {
      ground: '#eef5f8',
      slab: '#a8cad9',
      moduleLight: '#f7fbfe',
      moduleDark: '#7fa7bd',
      hedge: ['#2980b9', '#3498db', '#1abc9c', '#e0fbfc'],
    },
  },
  crane: {
    id: 'crane',
    label: 'Turna & Niluferler',
    category: 'nature',
    heightFactor: 0.95,
    trunkFraction: 0.35,
    trunkRadius: 0.035,
    maxDepth: 5,
    forkChance: 0.35,
    spread: [0.6, 1.1],
    lengthDecay: [0.75, 0.86],
    radiusDecay: 0.7,
    upBiasLow: 0.5,
    upBiasHigh: 0.4,
    leader: false,
    leafFromDepth: 1,
    leafAlong: [0.2, 1],
    cluster: [0.5, 1.4],
    clusterYScale: 0.8,
    leafSize: [0.65, 1.2],
    taper: 0.25,
    bark: { bark: '#2c3437', barkDark: '#1a1f21' },
    worldTheme: {
      ground: '#f0f7f5',
      slab: '#a8d5c8',
      moduleLight: '#f7fcfb',
      moduleDark: '#7bb3a4',
      hedge: ['#2ecc71', '#27ae60', '#ff758f', '#2980b9'],
    },
  },
  pyramid: {
    id: 'pyramid',
    label: 'Col Piramidi',
    category: 'architecture',
    heightFactor: 0.88,
    trunkFraction: 0.3,
    trunkRadius: 0.045,
    maxDepth: 5,
    forkChance: 0.3,
    spread: [0.6, 1.0],
    lengthDecay: [0.75, 0.85],
    radiusDecay: 0.75,
    upBiasLow: 0.4,
    upBiasHigh: 0.4,
    leader: false,
    leafFromDepth: 1,
    leafAlong: [0.2, 1],
    cluster: [0.6, 1.4],
    clusterYScale: 0.7,
    leafSize: [0.7, 1.2],
    taper: 0.6,
    bark: { bark: '#c99e69', barkDark: '#8a6537' },
    worldTheme: {
      ground: '#f7f1e6',
      slab: '#d9bf92',
      moduleLight: '#fffdf6',
      moduleDark: '#ba9a61',
      hedge: ['#e9c46a', '#f4a261', '#d4a373', '#e76f51'],
      moteColors: ['#e9c46a', '#f39c12', '#d4a373', '#ffd166'],
    },
  },

  // ------------------------------------------------------------- FANTASY & SCIFI
  temple: {
    id: 'temple',
    label: 'Kristal Tapinak',
    category: 'fantasy',
    heightFactor: 1.05,
    trunkFraction: 0.35,
    trunkRadius: 0.04,
    maxDepth: 5,
    forkChance: 0.3,
    spread: [0.4, 0.8],
    lengthDecay: [0.78, 0.9],
    radiusDecay: 0.72,
    upBiasLow: 0.6,
    upBiasHigh: 0.7,
    leader: true,
    leafFromDepth: 1,
    leafAlong: [0.2, 1],
    cluster: [0.4, 1.2],
    clusterYScale: 1.2,
    leafSize: [0.65, 1.25],
    taper: 0.8,
    bark: { bark: '#5b8fa8', barkDark: '#315a6e' },
    worldTheme: {
      ground: '#edf4f8',
      slab: '#a3c2d4',
      moduleLight: '#f6fbfe',
      moduleDark: '#759db5',
      hedge: ['#00f5d4', '#48cae4', '#7209b7', '#4361ee'],
    },
  },
  angel: {
    id: 'angel',
    label: 'Melek Heykeli',
    category: 'fantasy',
    heightFactor: 1.0,
    trunkFraction: 0.35,
    trunkRadius: 0.04,
    maxDepth: 5,
    forkChance: 0.35,
    spread: [0.6, 1.1],
    lengthDecay: [0.75, 0.88],
    radiusDecay: 0.72,
    upBiasLow: 0.6,
    upBiasHigh: 0.7,
    leader: false,
    leafFromDepth: 1,
    leafAlong: [0.2, 1],
    cluster: [0.5, 1.4],
    clusterYScale: 0.9,
    leafSize: [0.7, 1.25],
    taper: 0.2,
    bark: { bark: '#ded9cd', barkDark: '#b8b2a3' },
    worldTheme: {
      ground: '#f7f8fb',
      slab: '#d5dbe5',
      moduleLight: '#fdfefe',
      moduleDark: '#b0bac9',
      hedge: ['#e8ecf2', '#f39c12', '#d5dbe5', '#ffffff'],
    },
  },
};

export const SPECIES_ORDER: SpeciesId[] = [
  'oak',
  'pine',
  'willow',
  'birch',
  'sakura',
  'bonsai',
  'palm',
  'castle',
  'ship',
  'pyramid',
  'angel',
  'crane',
];
