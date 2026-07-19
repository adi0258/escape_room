import { ImgKey } from './images';
import { SkinId } from './skins';

/**
 * The whole game world lives here: the school location graph, the diary
 * story beats, the multi-step puzzle content, per-character abilities and
 * both endings. Components stay dumb; editing content = editing this file.
 */

export type LocationId =
  | 'lobby'
  | 'hallway'
  | 'boardCorner'
  | 'office'
  | 'stairs'
  | 'cellar'
  | 'clockRoom';

export interface LocationDef {
  name: string;
  sign: string;
  bg: ImgKey;
  connections: LocationId[];
  /** position on the blueprint map, % */
  mapX: number;
  mapY: number;
  /** floor label for the map */
  floor: 'ground' | 'basement';
}

export const LOCATIONS: Record<LocationId, LocationDef> = {
  lobby: {
    name: 'הלובי',
    sign: 'כניסה ראשית — היציאה נעולה. ברור.',
    bg: 'entrance',
    connections: ['hallway'],
    mapX: 50,
    mapY: 78,
    floor: 'ground',
  },
  hallway: {
    name: 'מסדרון B1',
    sign: 'מסדרון B1 — נא לא לצרוח',
    bg: 'hallway',
    connections: ['lobby', 'boardCorner', 'stairs'],
    mapX: 50,
    mapY: 48,
    floor: 'ground',
  },
  boardCorner: {
    name: 'פינת המודעות',
    sign: 'לוח המודעות — קרא ותשכיל. או תיבהל.',
    bg: 'riddleWall',
    connections: ['hallway', 'office'],
    mapX: 80,
    mapY: 48,
    floor: 'ground',
  },
  office: {
    name: 'משרד השרת',
    sign: 'משרד — דפוק לפני כניסה. אבנר בכל זאת לא יענה.',
    bg: 'janitorOffice',
    connections: ['boardCorner'],
    mapX: 80,
    mapY: 78,
    floor: 'ground',
  },
  stairs: {
    name: 'גרם המדרגות',
    sign: 'ירידה למרתף — בזהירות (או בכלל לא)',
    bg: 'stairs',
    connections: ['hallway', 'cellar'],
    mapX: 20,
    mapY: 48,
    floor: 'ground',
  },
  cellar: {
    name: 'המרתף',
    sign: 'מחסן ציוד — מי צריך כל כך הרבה חרוטים?',
    bg: 'cellar',
    connections: ['stairs', 'clockRoom'],
    mapX: 20,
    mapY: 22,
    floor: 'basement',
  },
  clockRoom: {
    name: 'חדר השעון',
    sign: 'אין כניסה! (חוץ ממך, כנראה)',
    bg: 'clockRoom',
    connections: ['cellar'],
    mapX: 55,
    mapY: 22,
    floor: 'basement',
  },
};

/* ---------------- story flags ---------------- */
export type Flag =
  | 'diary1' // learned the year 1987 + Avner's name
  | 'diary2' // learned about 11:47 attempts
  | 'sawPainting' // "read the numbers backwards"
  | 'lockerOpen'
  | 'stairsChoiceDone'
  | 'cellarSearchDone'
  | 'clockRoomUnlocked'
  | 'gearPlaced'
  | 'candleLit'
  | 'clockFixed'
  | 'detHintLocker'
  | 'detHintBoard'
  | 'sciHintClock'
  | 'ninVent';

/* ---------------- multi-step puzzle content ---------------- */

/** Locker 236: the year from diary1 (1987), read backwards per the painting → 7891 */
export const LOCKER_CODE = '7891';

export interface BoardRiddle {
  text: string;
  options: string[];
  answer: string;
}

/** answers' first letters spell אבנר — the janitor's name */
export const BOARD_RIDDLES: BoardRiddle[] = [
  {
    text: 'אני נכנס מהחלון בלי לשבור אותו, בורח מהצל, וכשסוגרים את התריס — אני נעלם. מי אני?',
    options: ['אור', 'עכביש', 'גשם', 'ציפור'],
    answer: 'אור',
  },
  {
    text: 'יש לי קירות וגג, אבל אני לא עוגה. כולם עוזבים אותי בבוקר וחוזרים אליי בערב. מי אני?',
    options: ['אוטובוס', 'בית', 'ארון', 'כובע'],
    answer: 'בית',
  },
  {
    text: 'אני בוכה דמעות של שעווה כשמדליקים לי את הראש, ובכל דמעה אני נהיה קצת יותר קטן. מי אני?',
    options: ['ברז', 'גפרור', 'נר', 'קרח'],
    answer: 'נר',
  },
  {
    text: 'שומעים אותי בלי אוזניים כשאני עוברת בין העלים, ואף אחד לא ראה אותי אף פעם. מי אני?',
    options: ['שמש', 'דבורה', 'מוזיקה', 'רוח'],
    answer: 'רוח',
  },
];
export const BOARD_NAME_ANSWER = 'אבנר';
export const BOARD_NAME_BANK = ['א', 'ב', 'נ', 'ר', 'ש', 'ת', 'מ'];

/** the cellar note: symbol-coded time. legend lives on the item description! */
export const CLOCK_SYMBOLS = '☾☾:Δ✶';
export const CLOCK_TARGET = { hour: 11, minute: 47 };

/* ---------------- diary pages ---------------- */
export const DIARY = {
  page1: {
    title: 'דף יומן קרוע — 1',
    text:
      'מתוך יומנו של אַבְנֵר, שרת בית הספר:\n"היום השעון הגדול נעצר. שנת 1987, החורף הכי קר שהיה פה. ' +
      'כולם אומרים לזרוק אותו, אבל שעון הוא הלב של בית ספר. אני לא עוזב עד שהוא יחזור לתקתק."',
  },
  page2: {
    title: 'דף יומן קרוע — 2',
    text:
      '"כל לילה אני מנסה שוב לתקן. תמיד באותה שעה — 11:47, הרגע שבו הוא נעצר. ' +
      'חסרים לי רק גלגל שיניים אחד ונר טוב לראות איתו. הם איפשהו במרתף. אני כבר לא זוכר איפה..."',
  },
};

/* ---------------- per-character abilities ---------------- */
export interface Ability {
  label: string;
  narration: string;
  /** effect id handled by LocationScreen */
  effect: 'detLockerHint' | 'detBoardHint' | 'sciClockHint' | 'ninVent';
}

export const ABILITIES: Record<SkinId, Partial<Record<LocationId, Ability>>> = {
  detective: {
    hallway: {
      label: 'חוש בלשי',
      narration:
        'הבלש רכן אל המנעול. ארבע ספרות שחוקות משימוש: 7, 8, 9... ו-1. מעניין באיזה סדר. הקריין העמיד פנים שהוא לא מרשים אותו.',
      effect: 'detLockerHint',
    },
    boardCorner: {
      label: 'חוש בלשי',
      narration:
        'הבלש הבחין שמישהו סימן בעיפרון את האות הראשונה בכל תשובה על הלוח. רמז? בטח רמז.',
      effect: 'detBoardHint',
    },
  },
  scientist: {
    cellar: {
      label: 'ניתוח מדעי',
      narration:
        'המדענית בחנה את גלגל השיניים: "קוטר 40 מ״מ, 24 שיניים... זה לא מתריס. זה משעון! שעון גדול מאוד."',
      effect: 'sciClockHint',
    },
    clockRoom: {
      label: 'כיול מדעי',
      narration:
        'המדענית שלפה מחוגה מהכיס. "מחוג דקות מכויל. על לא דבר." הקריין רשם לעצמו לא להתווכח איתה.',
      effect: 'sciClockHint',
    },
  },
  ninja: {
    hallway: {
      label: 'פתח אוורור',
      narration:
        'הנינג׳ה הרימה עיניים אל פתח האוורור. שלוש שניות אחר כך היא כבר לא הייתה במסדרון. הקריין עדיין מנסה להבין איך.',
      effect: 'ninVent',
    },
    cellar: {
      label: 'טיפוס שקט',
      narration:
        'המדף הגבוה? בשביל נינג׳ה זה בקושי מדף. משהו קטן ושעווה נשלף מלמעלה בלי רעש.',
      effect: 'ninVent',
    },
  },
};

/* ---------------- narrator lines ---------------- */
export const NARRATOR2: Record<string, string> = {
  mapIntro:
    '{name} פרש/ה את מפת בית הספר. הקריין ציין שהמפה לא בקנה מידה, ושגם זה כנראה לא ישנה.',
  travel: '{name} צעד/ה בשקט אל {place}.',
  travelBlocked:
    'לשם? מכאן? {name}, אפילו הקריין לא יכול לספר את זה בצורה הגיונית. צריך לעבור דרך חדר מחובר.',
  lobbyDoorLocked:
    '{name} משך/ה בידית. הדלת לא זזה. הקריין הזכיר בעדינות שדלתות של סיפורים נפתחות רק בסוף שלהם.',
  cellarDark:
    'חושך מוחלט. {name} לא ראה/תה כלום, וגם הקריין, שרואה הכל, התקשה. אולי יש פנס איפשהו בבית הספר?',
  lockerNeedClues:
    'מנעול עם ארבע ספרות. {name} הרגיש/ה שחסר משהו. אולי בית הספר מסתיר רמזים במקומות אחרים.',
  lockerOpened:
    'קליק. קליק. קליק-קליק. הלוקר נפתח! בפנים: פנס ישן ועוד דף קרוע מיומן. הקריין ניסה להסתיר את ההתרגשות שלו. הוא נכשל.',
  paintingClue:
    'מאחורי המסגרת, מישהו חרט בכתב יד רועד: "המספרים משקרים. תקרא אותם הפוך." {name} שינן/ה את זה.',
  boardSolved:
    'ארבע תשובות, ארבע אותיות ראשונות: א-ב-נ-ר. אבנר. לשרת יש שם, ולסיפור הזה יש פתאום לב. מאחורי הלוח חיכה דף יומן.',
  stairsObeyed:
    'כמובן. {name} ירד/ה במדרגות בזהירות, בדיוק כמו שהסיפור תיאר. הקריין מרוצה. חשוד כמה שהוא מרוצה.',
  stairsDefied:
    'רגע — לקפוץ על המעקה?! זה... זה לא היה בתסריט! {name}! טוב. בסדר. גם ככה מגיעים למטה. הקריין מבקש לציין שהוא נעלב, ושזה נראה די כיף.',
  cellarAllFound:
    'גלגל שיניים, נר, ופתק עם סימנים מוזרים. {name} הרגיש/ה שהחפצים האלה שייכים למשהו אחד. דלת נסתרת נפתחה בקיר המזרחי.',
  clockRoomEnter:
    'חדר קטן ובו שעון ענק ושקט. על הקיר: לוח מספרים ישן. {name} שמע/ה תקתוק רפאים — של שעון שרוצה לחזור לחיות.',
  clockNeedItems:
    'המנגנון פעור וחסר. בלי גלגל השיניים ובלי אור של נר — אין מה להתחיל. הקריין הציע לחפש במרתף.',
  clockWrongTime:
    'השעון גנח, זז... ונעצר. השעה לא נכונה. אולי הפתק מהמרתף יודע משהו. אולי כדאי לקרוא אותו בתיק.',
  clockFixedLine:
    'תק. תק. תק. השעון חזר לתקתק, ובית הספר כולו נשם עמוק. {name} שמע/ה צעדים קלים ומישהו שלוחש "תודה". הדלת הראשית נפתחה בקומה למעלה.',
  endingPrompt:
    'הדלת פתוחה. אבל מאחורי {name} עומד עכשיו אבנר, שקוף וקצת נבוך. אפשר פשוט לצאת. ואפשר להישאר עוד רגע אחד ולהיפרד כמו שצריך.',
};

export const narrator2Line = (key: keyof typeof NARRATOR2, name: string, place = '') =>
  NARRATOR2[key].replaceAll('{name}', name || 'הגיבור').replaceAll('{place}', place);

/* ---------------- endings ---------------- */
export const ENDINGS = {
  farewell: {
    title: 'הסוף שבו נשארת רגע',
    text:
      'נשארת. אבנר ריחף אל השעון והניח עליו יד שקופה. "44 שנה חיכיתי שמישהו יקשיב לתקתוק," אמר. ' +
      '"עכשיו אני יכול סוף סוף לנוח. ותגיד לתלמידים — שיעורי בית זה לא כזה נורא. יש דברים גרועים יותר. למשל לתקן שעון 44 שנה."\n\n' +
      'הוא התפוגג לתוך אור חם, והשאיר אחריו ריח קל של שמן מכונות ועוגיות.',
    stamp: 'בוגר/ת המרתף המקולל — דרגת כבוד: מקשיב/ה לרוחות',
  },
  escape: {
    title: 'הסוף שבו פשוט יצאת',
    text:
      'יצאת בריצה אל האוויר הקריר של הלילה. חופש! מאחוריך, בחלון, דמות שקופה נופפה לשלום לאט. ' +
      'הקריין שתק שנייה ארוכה ואמר: "גם זה סוף. לא הסוף שהייתי כותב, אבל הסיפור הוא של מי שמשחק אותו."\n\n' +
      'איפשהו בפנים, שעון תקתק לבד.',
    stamp: 'בוגר/ת המרתף המקולל — דרגת כבוד: רץ/ה מהר ברגעים רגשיים',
  },
};
