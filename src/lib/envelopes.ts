// src/lib/envelopes.ts
// Standardized API response helpers.

import type { ApiResponseOk, ApiResponseErr } from "../types/api";

export function successEnvelope<T>(data: T): ApiResponseOk<T> {
  return { ok: true, data };
}

export function errorEnvelope(
  code: string,
  message: string
): ApiResponseErr {
  return { ok: false, error: { code, message } };
}

export function jsonResponse(
  status: number,
  body: ApiResponseOk<unknown> | ApiResponseErr,
  extraHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

// Cache-friendly response headers for public endpoints
export const CACHE_HEADERS_SHORT = {
  "Cache-Control": "public, max-age=300", // 5 minutes
};

export const CACHE_HEADERS_NONE = {
  "Cache-Control": "no-store",
};

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Always compares all characters regardless of where a difference is found.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  var result = 0;
  for (var i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** CORS headers for public API endpoints */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};
