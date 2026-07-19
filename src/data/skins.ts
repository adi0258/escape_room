export type SkinId = 'detective' | 'scientist' | 'ninja';

export interface Skin {
  id: SkinId;
  name: string;
  /** single-letter ink monogram shown instead of any emoji */
  initial: string;
  tagline: string;
  color: string;
}

export const SKINS: Skin[] = [
  {
    id: 'detective',
    name: 'הבלש האמיץ',
    initial: 'ב',
    tagline: 'רואה רמזים שאף אחד אחר לא שם לב אליהם',
    color: '#f2c14e',
  },
  {
    id: 'scientist',
    name: 'המדענית המטורללת',
    initial: 'מ',
    tagline: 'תמיד יש לה תיאוריה (ובדרך כלל היא צודקת)',
    color: '#3ddad0',
  },
  {
    id: 'ninja',
    name: 'הנינג׳ה השקטה',
    initial: 'נ',
    tagline: 'זזה בלי רעש, גם כשהיא נלחצת',
    color: '#7c5cff',
  },
];
