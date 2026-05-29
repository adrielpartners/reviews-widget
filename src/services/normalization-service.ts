// src/services/normalization-service.ts
// Converts Google Places API responses into stable, widget-facing data.

import type { GooglePlaceResponse } from "../providers/types";
import type { NormalizedReviewCache, Review } from "../types/reviews";

/**
 * Normalize a Google Places API response into the internal review cache schema.
 * Returns null if the response is unusable.
 */
export function normalizeGoogleResponse(
  placeId: string,
  response: GooglePlaceResponse
): NormalizedReviewCache | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  // Business name: prefer displayName.text, fall back to name
  const businessName = response.displayName?.text || response.name || "";

  // Defaults for missing fields
  const rating = typeof response.rating === "number" ? response.rating : 0;
  const reviewCount =
    typeof response.userRatingCount === "number" ? response.userRatingCount : 0;

  // Normalize reviews array
  const rawReviews = Array.isArray(response.reviews) ? response.reviews : [];
  const reviews: Review[] = rawReviews
    .filter((r) => r && typeof r === "object")
    .map((r) => normalizeSingleReview(r))
    .filter((r) => r !== null) as Review[];

  // Validate: if we have zero rating and zero reviews, data is essentially empty
  if (rating === 0 && reviewCount === 0 && reviews.length === 0) {
    // Still return the record — the place may genuinely have no reviews
  }

  return {
    schemaVersion: 1,
    source: "google_places",
    placeId,
    businessName,
    rating,
    reviewCount,
    reviews,
    fetchedAt: new Date().toISOString(),
  };
}

function normalizeSingleReview(raw: any): Review | null {
  // At minimum we need a text or rating to be useful
  const hasText = raw.text?.text && raw.text.text.trim().length > 0;
  const hasRating = typeof raw.rating === "number";

  if (!hasText && !hasRating) {
    return null;
  }

  return {
    authorName: raw.authorAttribution?.displayName || "Anonymous",
    authorPhotoUrl: raw.authorAttribution?.photoUri || undefined,
    rating: raw.rating || 0,
    text: raw.text?.text || "",
    relativeTimeDescription: raw.relativePublishTimeDescription || undefined,
    publishedAt: undefined, // Google Places (New) doesn't give absolute timestamps for reviews
    profileUrl: raw.authorAttribution?.uri || undefined,
  };
}

/**
 * Quick validation: does the normalized cache have meaningful data?
 */
export function hasMeaningfulData(cache: NormalizedReviewCache): boolean {
  return cache.reviews.length > 0 || cache.reviewCount > 0;
}
