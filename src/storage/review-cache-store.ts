// src/storage/review-cache-store.ts
// Read/write normalized review data from KV.

import { kvKeys } from "./kv-keys";
import type { NormalizedReviewCache } from "../types/reviews";

/**
 * Fetch cached review data for a place.
 * Returns null if not found or on parse error.
 */
export async function getReviewCache(
  kv: KVNamespace,
  placeId: string
): Promise<NormalizedReviewCache | null> {
  try {
    const raw = await kv.get(kvKeys.reviews(placeId), "json");
    if (!raw) return null;
    return raw as NormalizedReviewCache;
  } catch {
    return null;
  }
}

/**
 * Write normalized review cache to KV.
 * Throws on write failure.
 */
export async function putReviewCache(
  kv: KVNamespace,
  placeId: string,
  data: NormalizedReviewCache,
  ttlSeconds: number = 86400
): Promise<void> {
  await kv.put(kvKeys.reviews(placeId), JSON.stringify(data), {
    expirationTtl: ttlSeconds,
  });
}
