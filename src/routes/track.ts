// src/routes/track.ts
// POST /api/track — Receive analytics events from the widget and store in D1.

import { jsonResponse, successEnvelope, errorEnvelope } from "../lib/envelopes";
import { ErrorCode } from "../types/errors";
import { CORS_HEADERS } from "../lib/envelopes";
import type { Env } from "../types/env";

interface TrackPayload {
  placeId: string;
  site?: string;
  event: string;
}

const VALID_EVENTS = new Set(["widget_impression", "panel_open", "cta_click"]);

export async function handleTrack(request: Request, env: Env): Promise<Response> {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...CORS_HEADERS,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, errorEnvelope(ErrorCode.METHOD_NOT_ALLOWED, "Method not allowed"));
  }

  let payload: TrackPayload;
  try {
    payload = await request.json() as TrackPayload;
  } catch {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PAYLOAD, "Invalid JSON body"));
  }

  const { placeId, site, event } = payload;

  if (!placeId || typeof placeId !== "string" || placeId.length < 5) {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PLACE_ID, "Invalid or missing placeId"));
  }

  if (!event || !VALID_EVENTS.has(event)) {
    return jsonResponse(400, errorEnvelope(ErrorCode.INVALID_PAYLOAD, `Invalid event. Must be one of: ${Array.from(VALID_EVENTS).join(", ")}`));
  }

  try {
    const siteHost = site || (typeof site === "string" ? site : "");
    await env.EVENTS_DB.prepare(
      "INSERT INTO events (place_id, site, event) VALUES (?, ?, ?)"
    ).bind(placeId, siteHost, event).run();

    return jsonResponse(200, successEnvelope({ ok: true }), CORS_HEADERS);
  } catch (err) {
    console.error("[track] D1 write error:", err);
    return jsonResponse(500, errorEnvelope(ErrorCode.INTERNAL_ERROR, "Failed to record event"));
  }
}
