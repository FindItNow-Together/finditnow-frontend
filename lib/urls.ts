/**
 * Central URL derivation utility.
 * All URLs are derived from a single env variable: NEXT_PUBLIC_APP_URL
 */

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost";

/** Base application URL (e.g. https://finditnow-discover.duckdns.org) */
export const APP_URL = appUrl;

/**
 * Internal base URL for server-side container-to-container calls.
 * Falls back to APP_URL for local development.
 * Set INTERNAL_BASE_URL in docker-compose for production (e.g. http://nginx:80).
 */
export const INTERNAL_URL = process.env.INTERNAL_BASE_URL || appUrl;

/** Image gateway URL prefix (e.g. https://finditnow-discover.duckdns.org/api/files/download) */
export const IMAGE_GATEWAY_URL = `${appUrl}/api/files/download`;

/** Build a full image URL from a file key returned by the backend */
export function getImageSrc(fileKey: string): string {
  return `${IMAGE_GATEWAY_URL}${fileKey}`;
}

/** Build a WebSocket URL by swapping https→wss / http→ws */
export function getWebSocketUrl(path: string): string {
  const wsUrl = appUrl.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
  return `${wsUrl}${path}`;
}
