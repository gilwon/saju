/**
 * Storage helper for proxy image URLs.
 *
 * Instead of exposing public Supabase Storage URLs, all image URLs
 * go through `/api/image/[bucket]/[path]` which checks auth.
 */

/** Build a proxy URL for a stored image. */
export function getProxyImageUrl(bucket: string, filePath: string): string {
  return `/api/image/${bucket}/${filePath}`;
}

/** Extract bucket + path from a proxy URL (for server-side downloads). */
export function parseProxyImageUrl(
  proxyUrl: string
): { bucket: string; path: string } | null {
  const prefix = "/api/image/";
  if (!proxyUrl.startsWith(prefix)) return null;
  const rest = proxyUrl.slice(prefix.length);
  const slashIdx = rest.indexOf("/");
  if (slashIdx === -1) return null;
  return {
    bucket: rest.slice(0, slashIdx),
    path: rest.slice(slashIdx + 1),
  };
}
