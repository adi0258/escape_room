/** Central registry of the photographic scene backgrounds (res/). */
export const IMG = {
  entrance: require('../../res/school_entrance.png'),
  hallway: require('../../res/school_hallway.png'),
  locker: require('../../res/locker_in_school.png'),
  riddleWall: require('../../res/riddle_in_hallway.png'),
  stairs: require('../../res/stairs_to_cellar.png'),
  cellar: require('../../res/school_cellar.png'),
  painting: require('../../res/picture_on_wall.png'),
  title: require('../../res/opening_screen.png'),
  map: require('../../res/school_map.png'),
  clockRoom: require('../../res/clock_room.png'),
  janitorOffice: require('../../res/janitor_office.png'),
  ghost: require('../../res/ghost_avner.png'),
  itemGear: require('../../res/item_gear.png'),
  itemCandle: require('../../res/item_candle.png'),
  itemNote: require('../../res/item_note.png'),
  itemFlashlight: require('../../res/item_flashlight.png'),
  itemDiary: require('../../res/item_diary.png'),
};

export type ImgKey = keyof typeof IMG;

/** natural sizes — required to convert image-space hotspot % into
    container coordinates under resizeMode="cover" cropping */
export const IMG_SIZE: Partial<Record<ImgKey, { w: number; h: number }>> = {
  entrance: { w: 1024, h: 1536 },
  hallway: { w: 1672, h: 941 },
  riddleWall: { w: 1672, h: 941 },
  stairs: { w: 1023, h: 1537 },
  cellar: { w: 1672, h: 941 },
  janitorOffice: { w: 1535, h: 1024 },
  clockRoom: { w: 1535, h: 1024 },
  painting: { w: 1122, h: 1402 },
  locker: { w: 1122, h: 1402 },
  title: { w: 1176, h: 856 },
};

/**
 * Map a point given in image-space percent (0-100 on the original photo)
 * to container pixel coordinates under "cover" scaling.
 */
export function coverPoint(
  img: ImgKey,
  xPct: number,
  yPct: number,
  cw: number,
  ch: number,
): { x: number; y: number } {
  const size = IMG_SIZE[img];
  if (!size || cw <= 0 || ch <= 0) return { x: (xPct / 100) * cw, y: (yPct / 100) * ch };
  const scale = Math.max(cw / size.w, ch / size.h);
  const dw = size.w * scale;
  const dh = size.h * scale;
  const offX = (cw - dw) / 2;
  const offY = (ch - dh) / 2;
  return { x: offX + (xPct / 100) * dw, y: offY + (yPct / 100) * dh };
}
