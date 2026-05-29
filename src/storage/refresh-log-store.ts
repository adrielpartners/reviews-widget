// src/storage/refresh-log-store.ts
// Read/write refresh status metadata for a place.

import { kvKeys } from "./kv-keys";

export interface RefreshLogEntry {
  placeId: string;
  status: "success" | "failed";
  fetchedAt: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Write a refresh log entry to KV.
 */
export async function putRefreshLog(
  kv: KVNamespace,
  entry: RefreshLogEntry,
  ttlSeconds: number = 604800 // 7 days
): Promise<void> {
  await kv.put(kvKeys.refreshLog(entry.placeId), JSON.stringify(entry), {
    expirationTtl: ttlSeconds,
  });
}

/**
 * Get the last refresh log entry for a place.
 * Returns null if not found.
 */
export async function getRefreshLog(
  kv: KVNamespace,
  placeId: string
): Promise<RefreshLogEntry | null> {
  try {
    const raw = await kv.get(kvKeys.refreshLog(placeId), "json");
    if (!raw) return null;
    return raw as RefreshLogEntry;
  } catch {
    return null;
  }
}
