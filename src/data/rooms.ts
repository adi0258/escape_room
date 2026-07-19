import { ImgKey } from './images';

/**
 * Scene-rendering types. Actual room content is built dynamically by
 * LocationScreen from src/data/story.ts + game flags.
 */
export interface RoomHotspot {
  id: string;
  /** percentage position inside the scene, 0-100 */
  x: number;
  y: number;
  label?: string;
  /** shown in the narrator band when tapped (non-action hotspots) */
  joke?: string;
  /** action id dispatched to the location handler (gold pulsing ring) */
  action?: string;
}

export interface RoomConfig {
  /** office-style signage plate text (Stanley Parable vibes) */
  sign: string;
  /** photographic background from res/ */
  bg: ImgKey;
  hotspots: RoomHotspot[];
}
