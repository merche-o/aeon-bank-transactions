import { bm } from './bm';
import { en } from './en';
import type { Dictionary, Locale, TranslationKey } from './types';

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  bm,
};

export const translationKeys = Object.keys(en) as TranslationKey[];
