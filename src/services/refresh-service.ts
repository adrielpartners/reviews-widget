// src/services/refresh-service.ts
// Orchestrates fetching, normalizing, and caching review data for a single place.

import { fetchPlaceReviews } from "../providers/google-places-provider";
import { normalizeGoogleResponse, hasMeaningfulData } from "./normalization-service";
import { putReviewCache } from "../storage/review-cache-store";
import { putRefreshLog } from "../storage/refresh-log-store";
import type { Env } from "../types/env";

export interface RefreshResult {
  ok: boolean;
  placeId: string;
  error?: string;
  reviewCount?: number;
}

/**
 * Refresh a single place: fetch from Google, normalize, write KV.
 * Continues gracefully on failure — logs the error and returns a result object.
 */
export async function refreshPlace(
  env: Env,
  placeId: string
): Promise<RefreshResult> {
  const apiKey = env.GOOGLE_PLACES_API_KEY;

  // Fetch from Google
  const providerResult = await fetchPlaceReviews(placeId, apiKey);

  if (!providerResult.ok) {
    // Log the failure
    await putRefreshLog(env.REVIEWS_KV, {
      placeId,
      status: "failed",
      fetchedAt: new Date().toISOString(),
      errorCode: providerResult.code,
      errorMessage: providerResult.message,
    });

    return {
      ok: false,
      placeId,
      error: providerResult.code,
    };
  }

  // Normalize the response
  const normalized = normalizeGoogleResponse(placeId, providerResult.data);

  if (!normalized) {
    await putRefreshLog(env.REVIEWS_KV, {
      placeId,
      status: "failed",
      fetchedAt: new Date().toISOString(),
      errorCode: "NORMALIZATION_FAILED",
      errorMessage: "Failed to normalize Google response",
    });

    return {
      ok: false,
      placeId,
      error: "NORMALIZATION_FAILED",
    };
  }

  // Write to KV cache
  try {
    await putReviewCache(env.REVIEWS_KV, placeId, normalized);
  } catch (kvError: any) {
    await putRefreshLog(env.REVIEWS_KV, {
      placeId,
      status: "failed",
      fetchedAt: new Date().toISOString(),
      errorCode: "KV_WRITE_FAILED",
      errorMessage: "Failed to write review cache to KV",
    });

    return {
      ok: false,
      placeId,
      error: "KV_WRITE_FAILED",
    };
  }

  // Log success
  await putRefreshLog(env.REVIEWS_KV, {
    placeId,
    status: "success",
    fetchedAt: normalized.fetchedAt,
  });

  return {
    ok: true,
    placeId,
    reviewCount: normalized.reviews.length,
  };
}
