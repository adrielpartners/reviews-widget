// src/routes/config.ts
// GET /api/config?placeId=XXX — Returns remote widget defaults for a place.
// The widget merges these with its data-* attributes (data-* wins).

import { jsonResponse, successEnvelope, errorEnvelope, CORS_HEADERS } from "../lib/envelopes";
import { ErrorCode } from "../types/errors";
import { getPlaceRecord } from "../storage/place-registry-store";
import type { WidgetDefaults } from "../types/place";

export async function handleConfig(request: Request, kv: KVNamespace): Promise<Response> {
  const url = new URL(request.url);
  const placeId = url.searchParams.get("placeId");

  if (!placeId || placeId.length < 5) {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PLACE_ID, "Missing or invalid placeId parameter"), CORS_HEADERS);
  }

  try {
    const record = await getPlaceRecord(kv, placeId);

    if (!record) {
      // Place not registered — return empty config, widget will use data-* only
      return jsonResponse(200, successEnvelope({ config: null }), CORS_HEADERS);
    }

    // Return only the remote config subset — no secrets, no internal fields
    return jsonResponse(200, successEnvelope({
      config: record.remoteConfig || null,
      businessName: record.businessName,
    }), CORS_HEADERS);
  } catch (err) {
    console.error("[config] Error fetching config:", err);
    return jsonResponse(500, errorEnvelope(ErrorCode.INTERNAL_ERROR, "Failed to fetch config"), CORS_HEADERS);
  }
}
