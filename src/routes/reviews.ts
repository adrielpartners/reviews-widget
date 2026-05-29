// src/routes/reviews.ts
// Public reviews endpoint — reads cached review data from KV only.
// GET /api/reviews?placeId=<place_id>

import { jsonResponse, successEnvelope, errorEnvelope, CACHE_HEADERS_SHORT, CORS_HEADERS } from "../lib/envelopes";
import { ErrorCode } from "../types/errors";
import { lookupReviews } from "../services/review-service";

const MAX_PLACE_ID_LENGTH = 256;
// Only allow alphanumeric, hyphens, underscores in place IDs (defense in depth)
const PLACE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export async function handleReviews(request: Request, kv: KVNamespace): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse(405, errorEnvelope(ErrorCode.METHOD_NOT_ALLOWED, "Method not allowed"));
  }

  const url = new URL(request.url);
  const placeId = url.searchParams.get("placeId");

  // Validate placeId
  if (!placeId || placeId.trim().length === 0) {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PLACE_ID, "placeId query parameter is required"));
  }

  if (placeId.length > MAX_PLACE_ID_LENGTH) {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PLACE_ID, "placeId is too long"));
  }

  if (!PLACE_ID_PATTERN.test(placeId)) {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PLACE_ID, "placeId contains invalid characters"), CORS_HEADERS);
  }

  // Read from KV only — no Google calls
  const cached = await lookupReviews(kv, placeId);

  if (!cached) {
    return jsonResponse(
      404,
      errorEnvelope(ErrorCode.REVIEWS_NOT_FOUND, "Reviews are not available for this business yet"),
      { ...CACHE_HEADERS_SHORT, ...CORS_HEADERS }
    );
  }

  return jsonResponse(
    200,
    successEnvelope({
      placeId: cached.placeId,
      businessName: cached.businessName,
      rating: cached.rating,
      reviewCount: cached.reviewCount,
      reviews: cached.reviews,
      fetchedAt: cached.fetchedAt,
    }),
    { ...CACHE_HEADERS_SHORT, ...CORS_HEADERS }
  );
}
