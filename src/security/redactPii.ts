/** Matches app ref ids (e.g. 123ABC): alphanumeric with at least one letter and one digit. */
const REF_ID_PATTERN = /\b(?=[A-Z0-9]*[0-9])(?=[A-Z0-9]*[A-Z])[A-Z0-9]{5,12}\b/gi;
const AMOUNT_PATTERN = /(?:RM\s*)?-?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\b-?\d+\.\d{2}\b/g;
const EMAIL_PATTERN = /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g;

/** Object keys whose entire value is replaced (nested objects still recurse for other keys). */
const DENYLIST_REPLACEMENTS: Readonly<Record<string, string>> = {
  refId: '[REDACTED_REF]',
  ref_id: '[REDACTED_REF]',
  amount: '[REDACTED_AMOUNT]',
  recipientName: '[REDACTED_NAME]',
  recipient_name: '[REDACTED_NAME]',
  firstName: '[REDACTED_NAME]',
  lastName: '[REDACTED_NAME]',
  first_name: '[REDACTED_NAME]',
  last_name: '[REDACTED_NAME]',
  displayName: '[REDACTED_NAME]',
  display_name: '[REDACTED_NAME]',
  transferName: '[REDACTED_NAME]',
  transfer_name: '[REDACTED_NAME]',
  dateOfBirth: '[REDACTED_DOB]',
  date_of_birth: '[REDACTED_DOB]',
  accountHint: '[REDACTED_ACCOUNT]',
  account_hint: '[REDACTED_ACCOUNT]',
  email: '[REDACTED_EMAIL]',
  phone: '[REDACTED_PHONE]',
};

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
      const replacement = DENYLIST_REPLACEMENTS[key];
      if (replacement !== undefined) {
        redacted[key] = replacement;
        continue;
      }
      redacted[key] = redactPiiValue(nested);
    }

    return redacted;
  }

  return value;
}
