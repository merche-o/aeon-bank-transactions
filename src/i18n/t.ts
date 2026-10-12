import { dictionaries } from './dictionaries';
import type { Locale, TranslationKey } from './types';

export function t(key: TranslationKey, locale: Locale): string {
  return dictionaries[locale][key];
}
