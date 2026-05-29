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
