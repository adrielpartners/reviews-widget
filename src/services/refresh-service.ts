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
  attempts?: number;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function isRetryableError(code: string): boolean {
  return code === "GOOGLE_API_TIMEOUT" || code === "GOOGLE_API_ERROR" || code === "GOOGLE_RATE_LIMITED" || code === "GOOGLE_API_FAILED";
}

function delay(ms: number): Promise<void> {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
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
  var lastError: RefreshResult | null = null;

  for (var attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const result = await tryRefreshPlace(env, placeId, apiKey, attempt);
    if (result.ok) return result;
    lastError = result;
    if (!isRetryableError(result.error || "") || attempt > MAX_RETRIES) break;
    await delay(RETRY_DELAY_MS * attempt);
  }

  return lastError!;
}

async function tryRefreshPlace(
  env: Env,
  placeId: string,
  apiKey: string,
  attempt: number
): Promise<RefreshResult> {

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
      attempts: attempt,
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
