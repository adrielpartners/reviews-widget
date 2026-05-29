// src/providers/types.ts
// Types for Google Places API provider responses.

export interface GooglePlaceReview {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: {
    text: string;
    languageCode?: string;
  };
  authorAttribution?: {
    displayName: string;
    uri?: string;
    photoUri?: string;
  };
}

export interface GooglePlaceResponse {
  name?: string;
  id?: string;
  rating?: number;
  userRatingCount?: number;
  reviews?: GooglePlaceReview[];
  displayName?: {
    text: string;
    languageCode?: string;
  };
  types?: string[];
}

export interface ProviderSuccess {
  ok: true;
  data: GooglePlaceResponse;
}

export interface ProviderError {
  ok: false;
  status: number;
  code: string;
  message: string;
}

export type ProviderResult = ProviderSuccess | ProviderError;
