/** Matches app ref ids (e.g. 123ABC): alphanumeric with at least one letter and one digit. */
const REF_ID_PATTERN = /\b(?=[A-Z0-9]*[0-9])(?=[A-Z0-9]*[A-Z])[A-Z0-9]{5,12}\b/gi;
const AMOUNT_PATTERN = /(?:RM\s*)?-?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\b-?\d+\.\d{2}\b/g;
const EMAIL_PATTERN = /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g;

export function redactPiiInString(value: string): string {
  return value
    .replace(REF_ID_PATTERN, '[REDACTED_REF]')
    .replace(EMAIL_PATTERN, '[REDACTED_EMAIL]')
    .replace(AMOUNT_PATTERN, '[REDACTED_AMOUNT]');
}

export function redactPiiValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactPiiInString(value);
  }

  if (Array.isArray(value)) {
    return value.map(redactPiiValue);
  }

  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const redacted: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(record)) {
      if (key === 'refId' || key === 'ref_id') {
        redacted[key] = '[REDACTED_REF]';
        continue;
      }
      if (key === 'amount') {
        redacted[key] = '[REDACTED_AMOUNT]';
        continue;
      }
      if (key === 'recipientName' || key === 'recipient_name') {
        redacted[key] = '[REDACTED_NAME]';
        continue;
      }
      redacted[key] = redactPiiValue(nested);
    }

    return redacted;
  }

  return value;
}
