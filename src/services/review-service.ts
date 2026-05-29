// src/services/review-service.ts
// Business logic for review cache reads.

import { getReviewCache } from "../storage/review-cache-store";
import type { NormalizedReviewCache } from "../types/reviews";

/**
 * Look up cached review data for a place.
 * Returns null if no cached data exists.
 */
export async function lookupReviews(
  kv: KVNamespace,
  placeId: string
): Promise<NormalizedReviewCache | null> {
  return getReviewCache(kv, placeId);
}
