/**
 * Parse a user amount string into a positive finite number rounded half-up
 * to cents (max 2 decimal places). Returns null when invalid.
 */
export function parseAmountInput(raw: string): number | null {
  const normalized = raw.replace(/,/g, '').trim();
  if (normalized.length === 0) {
    return null;
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const [wholePart, fracPart = ''] = normalized.split('.');
  let cents = Number(wholePart) * 100;

  if (fracPart.length === 1) {
    cents += Number(fracPart) * 10;
  } else if (fracPart.length === 2) {
    cents += Number(fracPart);
  } else if (fracPart.length > 2) {
    cents += Number(fracPart.slice(0, 2));
    const thirdDigit = Number(fracPart[2]);
    if (thirdDigit >= 5) {
      cents += 1;
    }
  }

  if (!Number.isFinite(cents) || cents <= 0) {
    return null;
  }
  return cents / 100;
}
