const SAFE_PROTOCOLS = ['http:', 'https:', 'pw:'];

/**
 * Returns the normalized URL if the value is an absolute http(s) or pw: URL, otherwise null.
 * Rejects javascript: and other unsafe schemes, so the result is safe to use as a link href.
 */
export function toSafeUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return SAFE_PROTOCOLS.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
