export function splitDisplayName(displayName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }
  const space = trimmed.indexOf(' ');
  if (space < 0) {
    return { firstName: trimmed, lastName: '' };
  }
  return {
    firstName: trimmed.slice(0, space).trim(),
    lastName: trimmed.slice(space + 1).trim(),
  };
}

export function avatarInitialFromName(firstName: string, fallback = 'C'): string {
  const trimmed = firstName.trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.charAt(0).toUpperCase();
}
