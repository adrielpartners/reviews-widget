// src/types/reviews.ts

export interface Review {
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  relativeTimeDescription?: string;
  publishedAt?: string;
  profileUrl?: string;
}

export interface NormalizedReviewCache {
  schemaVersion: number;
  source: string;
  placeId: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  fetchedAt: string;
}
