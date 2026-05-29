// src/storage/place-registry-store.ts
// Read/write the active place registry from KV.

import { kvKeys } from "./kv-keys";
import type { PlaceRecord, ActivePlaceRegistry } from "../types/place";

const DEFAULT_REGISTRY: ActivePlaceRegistry = { places: [] };

/**
 * Load the active place registry from KV.
 * Returns empty registry if not found or on parse error.
 */
export async function getPlaceRegistry(kv: KVNamespace): Promise<ActivePlaceRegistry> {
  try {
    const raw = await kv.get(kvKeys.activePlaces(), "json");
    if (!raw) return DEFAULT_REGISTRY;
    const registry = raw as ActivePlaceRegistry;
    if (!Array.isArray(registry.places)) return DEFAULT_REGISTRY;
    return registry;
  } catch {
    return DEFAULT_REGISTRY;
  }
}

/**
 * Filter registry to only active places.
 */
export async function getActivePlaces(kv: KVNamespace): Promise<PlaceRecord[]> {
  const registry = await getPlaceRegistry(kv);
  return registry.places.filter((p) => p.active);
}

/**
 * Write the place registry to KV.
 */
export async function putPlaceRegistry(
  kv: KVNamespace,
  registry: ActivePlaceRegistry
): Promise<void> {
  await kv.put(kvKeys.activePlaces(), JSON.stringify(registry));
}

/**
 * Check if a place ID exists in the active registry.
 */
export async function isPlaceActive(
  kv: KVNamespace,
  placeId: string
): Promise<boolean> {
  const registry = await getPlaceRegistry(kv);
  const match = registry.places.find((p) => p.placeId === placeId);
  return match ? match.active : false;
}
