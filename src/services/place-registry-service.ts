// src/services/place-registry-service.ts
// Business logic for managing the active place registry.

import {
  getPlaceRegistry,
  getActivePlaces,
  putPlaceRegistry,
  isPlaceActive,
} from "../storage/place-registry-store";
import type { PlaceRecord } from "../types/place";

/**
 * List all active places from the registry.
 */
export function listActivePlaces(kv: KVNamespace) {
  return getActivePlaces(kv);
}

/**
 * Check if a place is registered and active.
 */
export function checkPlaceActive(kv: KVNamespace, placeId: string) {
  return isPlaceActive(kv, placeId);
}

/**
 * Add a new place to the registry (or reactivate an existing one).
 * Initializes businessName as empty string — will be populated on first refresh.
 */
export async function addPlace(
  kv: KVNamespace,
  placeId: string,
  businessName: string = ""
): Promise<PlaceRecord> {
  const registry = await getPlaceRegistry(kv);
  const existing = registry.places.find((p) => p.placeId === placeId);

  if (existing) {
    existing.active = true;
    existing.businessName = businessName || existing.businessName;
    await putPlaceRegistry(kv, registry);
    return existing;
  }

  const record: PlaceRecord = {
    placeId,
    businessName,
    active: true,
    source: "google_places",
    createdAt: new Date().toISOString(),
  };

  registry.places.push(record);
  await putPlaceRegistry(kv, registry);
  return record;
}

/**
 * Mark a place inactive (soft delete).
 */
export async function deactivatePlace(
  kv: KVNamespace,
  placeId: string
): Promise<boolean> {
  const registry = await getPlaceRegistry(kv);
  const place = registry.places.find((p) => p.placeId === placeId);
  if (!place) return false;
  place.active = false;
  await putPlaceRegistry(kv, registry);
  return true;
}
