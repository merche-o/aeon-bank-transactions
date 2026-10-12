/**
 * Masks account / IBAN-like values for UI display.
 * Keeps only the last `visibleDigits` digits; everything else becomes bullets.
 */
export function obfuscateAccountHint(
  value: string | undefined | null,
  visibleDigits = 4,
): string | undefined {
  if (value == null) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 0) {
    return '••••';
  }

  const visible = Math.min(visibleDigits, digits.length);
  const last = digits.slice(-visible);
  return `••••${last}`;
}
