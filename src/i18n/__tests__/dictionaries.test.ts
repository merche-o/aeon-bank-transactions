import { bm } from '../bm';
import { en } from '../en';
import { translationKeys } from '../dictionaries';

describe('locale dictionaries', () => {
  it('expose the same set of keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(bm).sort());
  });

  it('align translationKeys with dictionary keys', () => {
    expect([...translationKeys].sort()).toEqual(Object.keys(en).sort());
  });

  it('includes required screen and state keys', () => {
    const required = [
      'list.title',
      'detail.title',
      'detail.recipient',
      'share.button',
      'filters.incoming',
      'filters.date7d',
      'loading.transactions',
      'empty.transactions',
      'error.loadFailed',
      'retry.button',
      'theme.light',
      'language.label',
    ] as const;

    for (const key of required) {
      expect(en[key]).toBeTruthy();
      expect(bm[key]).toBeTruthy();
    }
  });
});
