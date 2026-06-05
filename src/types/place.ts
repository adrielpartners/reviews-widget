// src/types/place.ts
// Domain types for the place registry.

/** Remote widget configuration defaults — overridden by embed data-* attributes */
export interface WidgetDefaults {
  mode?: string;
  layout?: string;
  theme?: string;
  position?: string;
  maxReviews?: number;
  ctaText?: string;
  ctaUrl?: string;
  mount?: string;
  customClass?: string;
  customColors?: Record<string, string>;
  customFontSizes?: Record<string, string>;
  customFontFamilies?: Record<string, string>;
}

export interface PlaceRecord {
  placeId: string;
  businessName: string;
  /** Display name shown on the admin dashboard card */
  clientName?: string;
  /** Website URL shown on the admin dashboard card */
  websiteUrl?: string;
  /** Remote widget config defaults — data-* attrs override these */
  remoteConfig?: WidgetDefaults;
  active: boolean;
  source: string;
  createdAt: string;
  lastRefreshAt?: string;
  lastRefreshStatus?: "success" | "failed";
}

export interface ActivePlaceRegistry {
  places: PlaceRecord[];
}
