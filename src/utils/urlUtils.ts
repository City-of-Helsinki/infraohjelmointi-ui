/**
 * Returns the normalized URL if the value is an absolute http(s) URL, otherwise null.
 * Rejects javascript: and other unsafe schemes, so the result is safe to use as a link href.
 */
export function toSafeUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
