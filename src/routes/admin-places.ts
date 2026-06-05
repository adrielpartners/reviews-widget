// src/routes/admin-places.ts
// Admin-protected endpoints for managing places and their remote widget config.
//
// GET  /api/admin/places              — List all registered places with config
// PUT  /api/admin/places/:placeId/config — Update remote widget defaults for a place

import { jsonResponse, successEnvelope, errorEnvelope } from "../lib/envelopes";
import { ErrorCode } from "../types/errors";
import { getPlaceRegistry, putPlaceRegistry } from "../storage/place-registry-store";
import { timingSafeEqual } from "../lib/envelopes";
import type { Env } from "../types/env";
import type { WidgetDefaults } from "../types/place";

function unauthorized(): Response {
  return jsonResponse(401, errorEnvelope(ErrorCode.UNAUTHORIZED, "Invalid or missing admin token"));
}

function validateAdminToken(request: Request, env: Env): boolean {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  return timingSafeEqual(token, env.ADMIN_REFRESH_TOKEN);
}

export async function handleAdminListPlaces(request: Request, env: Env): Promise<Response> {
  if (!validateAdminToken(request, env)) return unauthorized();

  if (request.method !== "GET") {
    return jsonResponse(405, errorEnvelope(ErrorCode.METHOD_NOT_ALLOWED, "Method not allowed"));
  }

  const registry = await getPlaceRegistry(env.REVIEWS_KV);

  const places = registry.places.map((p) => ({
    placeId: p.placeId,
    businessName: p.businessName,
    clientName: p.clientName || p.businessName,
    websiteUrl: p.websiteUrl || "",
    remoteConfig: p.remoteConfig || null,
    active: p.active,
    createdAt: p.createdAt,
    lastRefreshAt: p.lastRefreshAt || null,
    lastRefreshStatus: p.lastRefreshStatus || null,
  }));

  return jsonResponse(200, successEnvelope({ places }));
}

interface UpdateConfigBody {
  remoteConfig?: WidgetDefaults;
  clientName?: string;
  websiteUrl?: string;
}

export async function handleAdminUpdateConfig(request: Request, env: Env, placeId: string): Promise<Response> {
  if (!validateAdminToken(request, env)) return unauthorized();

  if (request.method !== "PUT") {
    return jsonResponse(405, errorEnvelope(ErrorCode.METHOD_NOT_ALLOWED, "Method not allowed"));
  }

  if (!placeId || placeId.length < 5) {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PLACE_ID, "Invalid placeId"));
  }

  let body: UpdateConfigBody;
  try {
    body = await request.json() as UpdateConfigBody;
  } catch {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PAYLOAD, "Invalid JSON body"));
  }

  const registry = await getPlaceRegistry(env.REVIEWS_KV);
  const idx = registry.places.findIndex((p) => p.placeId === placeId);

  if (idx === -1) {
    return jsonResponse(404, errorEnvelope(ErrorCode.NOT_FOUND, "Place not found"));
  }

  if (body.remoteConfig !== undefined) {
    registry.places[idx].remoteConfig = body.remoteConfig;
  }
  if (body.clientName !== undefined) {
    registry.places[idx].clientName = body.clientName;
  }
  if (body.websiteUrl !== undefined) {
    registry.places[idx].websiteUrl = body.websiteUrl;
  }

  try {
    await putPlaceRegistry(env.REVIEWS_KV, registry);
    return jsonResponse(200, successEnvelope({ ok: true }));
  } catch (err) {
    console.error("[admin-places] KV write error:", err);
    return jsonResponse(500, errorEnvelope(ErrorCode.INTERNAL_ERROR, "Failed to update place config"));
  }
}

export async function handleAdminAddPlace(request: Request, env: Env): Promise<Response> {
  if (!validateAdminToken(request, env)) return unauthorized();

  if (request.method !== "POST") {
    return jsonResponse(405, errorEnvelope(ErrorCode.METHOD_NOT_ALLOWED, "Method not allowed"));
  }

  let body: {
    placeId: string;
    businessName: string;
    clientName?: string;
    websiteUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PAYLOAD, "Invalid JSON body"));
  }

  if (!body.placeId || !body.businessName) {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PAYLOAD, "placeId and businessName are required"));
  }

  const registry = await getPlaceRegistry(env.REVIEWS_KV);
  if (registry.places.some((p) => p.placeId === body.placeId)) {
    return jsonResponse(409, errorEnvelope("PLACE_ALREADY_EXISTS", "Place already registered"));
  }

  registry.places.push({
    placeId: body.placeId,
    businessName: body.businessName,
    clientName: body.clientName || body.businessName,
    websiteUrl: body.websiteUrl || "",
    active: true,
    source: "google-places",
    createdAt: new Date().toISOString(),
  });

  try {
    await putPlaceRegistry(env.REVIEWS_KV, registry);
    return jsonResponse(201, successEnvelope({ ok: true }));
  } catch (err) {
    console.error("[admin-places] KV write error:", err);
    return jsonResponse(500, errorEnvelope(ErrorCode.INTERNAL_ERROR, "Failed to add place"));
  }
}
