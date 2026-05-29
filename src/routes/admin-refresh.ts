// src/routes/admin-refresh.ts
// Admin-protected manual refresh endpoint.
// POST /api/admin/refresh-place
// Body: { "placeId": "..." }

import { jsonResponse, successEnvelope, errorEnvelope } from "../lib/envelopes";
import { ErrorCode } from "../types/errors";
import type { Env } from "../types/env";
import { refreshPlace } from "../services/refresh-service";

const MAX_PLACE_ID_LENGTH = 256;

export async function handleAdminRefresh(request: Request, env: Env): Promise<Response> {
  // Method check
  if (request.method !== "POST") {
    return jsonResponse(405, errorEnvelope(ErrorCode.METHOD_NOT_ALLOWED, "Method not allowed"));
  }

  // Auth check
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return jsonResponse(401, errorEnvelope(ErrorCode.UNAUTHORIZED, "Missing or invalid Authorization header"));
  }

  const token = authHeader.slice(7);
  if (token !== env.ADMIN_REFRESH_TOKEN) {
    return jsonResponse(401, errorEnvelope(ErrorCode.UNAUTHORIZED, "Invalid token"));
  }

  // Parse and validate body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PAYLOAD, "Invalid JSON body"));
  }

  if (!body || typeof body !== "object") {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PAYLOAD, "Request body must be a JSON object"));
  }

  const placeId = body.placeId;
  if (!placeId || typeof placeId !== "string" || placeId.trim().length === 0) {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PLACE_ID, "placeId is required"));
  }

  if (placeId.length > MAX_PLACE_ID_LENGTH) {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PLACE_ID, "placeId is too long"));
  }

  // Execute refresh
  const result = await refreshPlace(env, placeId.trim());

  if (!result.ok) {
    return jsonResponse(502, errorEnvelope(
      ErrorCode.REFRESH_FAILED,
      `Refresh failed for place ${result.placeId}: ${result.error}`
    ));
  }

  return jsonResponse(200, successEnvelope({
    placeId: result.placeId,
    status: "refreshed",
    reviewCount: result.reviewCount,
    fetchedAt: new Date().toISOString(),
  }));
}
