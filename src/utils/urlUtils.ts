const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Returns the normalized URL if the value is an absolute http(s) or pw: URL, otherwise null.
 * Rejects javascript: and other unsafe schemes, so the result is safe to use as a link href.
 */
export function toSafeUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const trimmedValue = value.trim();
    if (trimmedValue.startsWith('pw:')) {
      // Allow pw: URLs as they are considered safe
      return trimmedValue;
    }
    const url = new URL(trimmedValue);
    return SAFE_PROTOCOLS.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
