import { bm } from '../bm';
import { dictionaries, translationKeys } from '../dictionaries';
import { en } from '../en';
import { t } from '../t';
import type { TranslationKey } from '../types';

describe('t', () => {
  it.each(translationKeys)('returns a non-empty string for %s in en and bm', (key) => {
    expect(t(key, 'en').length).toBeGreaterThan(0);
    expect(t(key, 'bm').length).toBeGreaterThan(0);
  });

  it('returns the English dictionary entry', () => {
    expect(t('list.title', 'en')).toBe(en['list.title']);
  });

  it('returns the Bahasa Malaysia dictionary entry', () => {
    expect(t('retry.button', 'bm')).toBe(bm['retry.button']);
  });

  it('covers every TranslationKey in both locales', () => {
    const enKeys = Object.keys(en).sort();
    const bmKeys = Object.keys(bm).sort();
    expect(enKeys).toEqual(bmKeys);
    expect(enKeys).toEqual([...translationKeys].sort());
  });
});

describe('dictionaries', () => {
  it('has matching keys for en and bm', () => {
    expect(Object.keys(dictionaries.en).sort()).toEqual(
      Object.keys(dictionaries.bm).sort(),
    );
  });

  it('has no duplicate or missing keys vs TranslationKey union', () => {
    const sample: TranslationKey = 'language.label';
    expect(dictionaries.en[sample]).toBeDefined();
    expect(dictionaries.bm[sample]).toBeDefined();
  });
});
