/**
 * Render sets VITE_API_URL to the backend origin (no path).
 * Local/dev may set full origin + `/api/v1`. Normalize to exactly one `/api/v1` suffix.
 */
export function getApiV1BaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '');
  if (!raw) return '/api/v1';
  if (raw.endsWith('/api/v1')) return raw;
  return `${raw}/api/v1`;
}
