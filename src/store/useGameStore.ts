import { create } from 'zustand';
import { SkinId } from '../data/skins';
import { LocationId } from '../data/story';

/** story flags + dynamic ability-use keys */
type Flag = string;

export type ScreenName = 'title' | 'setup' | 'intro' | 'map' | 'location' | 'ending';

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

interface GameState {
  playerName: string;
  skinId: SkinId | null;
  screen: ScreenName;
  location: LocationId;
  inventory: InventoryItem[];
  flags: Record<Flag, boolean>;
  visited: Partial<Record<LocationId, boolean>>;
  hintsUsedTotal: number;
  endingId: 'farewell' | 'escape' | null;
  /** current Stanley-Parable-style narrator subtitle (null = hidden) */
  narration: string | null;

  narrate: (text: string) => void;
  clearNarration: () => void;
  setPlayer: (name: string, skinId: SkinId) => void;
  goTo: (screen: ScreenName) => void;
  travelTo: (loc: LocationId) => void;
  addItem: (item: InventoryItem) => void;
  hasItem: (id: string) => boolean;
  setFlag: (f: Flag) => void;
  hasFlag: (f: Flag) => boolean;
  useHint: () => void;
  setEnding: (e: 'farewell' | 'escape') => void;
  resetGame: () => void;
}

const initialState = {
  playerName: '',
  skinId: null as SkinId | null,
  screen: 'title' as ScreenName,
  location: 'lobby' as LocationId,
  inventory: [] as InventoryItem[],
  flags: {} as Record<Flag, boolean>,
  visited: {} as Partial<Record<LocationId, boolean>>,
  hintsUsedTotal: 0,
  endingId: null as 'farewell' | 'escape' | null,
  narration: null as string | null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  narrate: text => set({ narration: text }),

  clearNarration: () => set({ narration: null }),

  setPlayer: (name, skinId) => set({ playerName: name, skinId }),

  goTo: screen => set({ screen }),

  travelTo: loc =>
    set(state => ({
      location: loc,
      screen: 'location',
      visited: { ...state.visited, [loc]: true },
    })),

  addItem: item =>
    set(state =>
      state.inventory.find(i => i.id === item.id)
        ? state
        : { inventory: [...state.inventory, item] },
    ),

  hasItem: id => !!get().inventory.find(i => i.id === id),

  setFlag: f => set(state => ({ flags: { ...state.flags, [f]: true } })),

  hasFlag: f => !!get().flags[f],

  useHint: () => set(state => ({ hintsUsedTotal: state.hintsUsedTotal + 1 })),

  setEnding: e => set({ endingId: e, screen: 'ending' }),

  resetGame: () =>
    set({ ...initialState, inventory: [], flags: {}, visited: {} }),
}));
