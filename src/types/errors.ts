// src/types/errors.ts
// Error code constants and validation error codes.

export const ErrorCode = {
  // Client errors
  INVALID_PLACE_ID: "INVALID_PLACE_ID",
  REVIEWS_NOT_FOUND: "REVIEWS_NOT_FOUND",
  REVIEWS_CACHE_EMPTY: "REVIEWS_CACHE_EMPTY",
  UNAUTHORIZED: "UNAUTHORIZED",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  INVALID_PAYLOAD: "INVALID_PAYLOAD",
  NOT_FOUND: "NOT_FOUND",

  // Provider errors
  GOOGLE_API_FAILED: "GOOGLE_API_FAILED",
  GOOGLE_RESPONSE_INVALID: "GOOGLE_RESPONSE_INVALID",

  // Internal errors
  REFRESH_FAILED: "REFRESH_FAILED",
  KV_READ_FAILED: "KV_READ_FAILED",
  KV_WRITE_FAILED: "KV_WRITE_FAILED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];
