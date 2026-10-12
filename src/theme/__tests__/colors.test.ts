import { darkColors, lightColors } from '../colors';

describe('color tokens', () => {
  const lightKeys = Object.keys(lightColors).sort();
  const darkKeys = Object.keys(darkColors).sort();

  it('uses the same token names in light and dark', () => {
    expect(lightKeys).toEqual(darkKeys);
  });

  it('uses teal and navy as primary brand accents', () => {
    expect(lightColors.primary).toBe('#0D9488');
    expect(lightColors.navy).toBe('#1E3A5F');
    expect(darkColors.primary).toBe('#2DD4BF');
    expect(darkColors.navy).toBe('#1E3A5F');
  });
});
