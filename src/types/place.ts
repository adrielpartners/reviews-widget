// src/types/place.ts
// Domain types for the place registry.

export interface PlaceRecord {
  placeId: string;
  businessName: string;
  active: boolean;
  source: string;
  createdAt: string;
  lastRefreshAt?: string;
  lastRefreshStatus?: "success" | "failed";
}

export interface ActivePlaceRegistry {
  places: PlaceRecord[];
}
