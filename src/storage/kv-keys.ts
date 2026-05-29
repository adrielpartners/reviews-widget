// src/storage/kv-keys.ts
// Single source of truth for all KV key construction.
// Do not scatter raw key strings elsewhere in the codebase.

export const kvKeys = {
  /** Cached normalized review data for a place */
  reviews: (placeId: string): string => `REVIEWS:${placeId}`,

  /** Per-place metadata (name, active, etc.) */
  place: (placeId: string): string => `PLACE:${placeId}`,

  /** Global active place registry (JSON array) */
  activePlaces: (): string => "PLACES:ACTIVE",

  /** Last refresh result for a place */
  refreshLog: (placeId: string): string => `REFRESH_LOG:${placeId}`,
} as const;
