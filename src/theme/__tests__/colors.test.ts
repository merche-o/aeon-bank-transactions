import { darkColors, lightColors } from '../colors';

describe('color tokens', () => {
  const lightKeys = Object.keys(lightColors).sort();
  const darkKeys = Object.keys(darkColors).sort();

  it('uses the same token names in light and dark', () => {
    expect(lightKeys).toEqual(darkKeys);
  });

  it('uses AEON magenta and deep neutrals as brand accents', () => {
    expect(lightColors.primary).toBe('#B0307A');
    expect(lightColors.primarySubtle).toBe('#F9E4F0');
    expect(lightColors.navy).toBe('#2D1F28');
    expect(darkColors.primary).toBe('#D857A0');
    expect(darkColors.primarySubtle).toBe('#3D2235');
    expect(darkColors.navy).toBe('#F5EBF2');
  });

  it('uses light textInverse for primary magenta buttons', () => {
    expect(lightColors.textInverse).toBe('#FFFFFF');
    expect(darkColors.textInverse).toBe('#FFFFFF');
  });
});
