// src/providers/google-places-provider.ts
// Google Places API (New) adapter.
// Isolates all Google-specific request/response handling.

import type { ProviderResult } from "./types";

const GOOGLE_PLACES_BASE_URL = "https://places.googleapis.com/v1/places";
const FETCH_TIMEOUT_MS = 10000;

/**
 * Fetch place data from Google Places API (New).
 * Includes reviews in the field mask.
 *
 * @param placeId - Google Place ID
 * @param apiKey - Google Places API key (from Worker secret)
 * @returns ProviderResult with raw Google response or normalized error
 */
export async function fetchPlaceReviews(
  placeId: string,
  apiKey: string
): Promise<ProviderResult> {
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      code: "GOOGLE_API_KEY_MISSING",
      message: "Google Places API key is not configured",
    };
  }

  if (!placeId || placeId.trim().length === 0) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_PLACE_ID",
      message: "Place ID is required",
    };
  }

  const url = `${GOOGLE_PLACES_BASE_URL}/${encodeURIComponent(placeId)}`;
  const fieldMask = "name,id,rating,userRatingCount,reviews,displayName";
  const headers: Record<string, string> = {
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": fieldMask,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        code: googleStatusToErrorCode(response.status),
        message: `Google Places API returned ${response.status}`,
      };
    }

    const data = await response.json();

    return { ok: true, data: data as any };
  } catch (error: any) {
    if (error?.name === "AbortError") {
      return {
        ok: false,
        status: 408,
        code: "GOOGLE_API_TIMEOUT",
        message: "Google Places API request timed out",
      };
    }

    return {
      ok: false,
      status: 502,
      code: "GOOGLE_API_FAILED",
      message: "Failed to reach Google Places API",
    };
  }
}

function googleStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return "GOOGLE_INVALID_REQUEST";
    case 403:
      return "GOOGLE_API_KEY_INVALID";
    case 404:
      return "GOOGLE_PLACE_NOT_FOUND";
    case 429:
      return "GOOGLE_RATE_LIMITED";
    case 500:
    case 503:
      return "GOOGLE_API_ERROR";
    default:
      return "GOOGLE_API_FAILED";
  }
}
