// src/types/env.ts
// Centralized environment and binding types.

export interface Env {
  REVIEWS_KV: KVNamespace;
  GOOGLE_PLACES_API_KEY: string;
  ADMIN_REFRESH_TOKEN: string;
  LOG_LEVEL: string;
  ALLOWED_ORIGINS?: string;
  /** D1 database for widget analytics events */
  EVENTS_DB: D1Database;
}