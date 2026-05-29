// src/worker.ts — Reviews Widget Cloudflare Worker
// Handles routing for public API, widget asset, admin refresh, and scheduled events.

import type { Env } from "./types/env";
import { jsonResponse, successEnvelope, errorEnvelope } from "./lib/envelopes";
import { ErrorCode } from "./types/errors";
import { handleHealth } from "./routes/health";
import { handleReviews } from "./routes/reviews";
import { handleWidget } from "./routes/widget";
import { handleAdminRefresh } from "./routes/admin-refresh";
import { refreshPlace } from "./services/refresh-service";
import { getActivePlaces } from "./storage/place-registry-store";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return handleHealth();
    }

    if (url.pathname === "/api/reviews") {
      return handleReviews(request, env.REVIEWS_KV);
    }

    if (url.pathname === "/widget.js") {
      return handleWidget();
    }

    if (url.pathname === "/api/admin/refresh-place") {
      return handleAdminRefresh(request, env);
    }

    return jsonResponse(404, errorEnvelope(ErrorCode.NOT_FOUND, "Not found"));
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Refresh all active registered places (concurrent batches to avoid overwhelming the Google API)
    let activePlaces: { placeId: string }[];
    try {
      activePlaces = await getActivePlaces(env.REVIEWS_KV);
    } catch {
      console.error("[scheduled] Failed to load active place registry");
      return;
    }

    const CONCURRENCY_LIMIT = 3;
    for (let i = 0; i < activePlaces.length; i += CONCURRENCY_LIMIT) {
      const batch = activePlaces.slice(i, i + CONCURRENCY_LIMIT);
      await Promise.allSettled(
        batch.map(async (place) => {
          try {
            const result = await refreshPlace(env, place.placeId);
            if (result.ok) {
              console.info(`[scheduled] Refreshed ${place.placeId}: ${result.reviewCount} reviews`);
            } else {
              console.warn(`[scheduled] Failed ${place.placeId}: ${result.error}`);
            }
          } catch (err) {
            console.error(`[scheduled] Error refreshing ${place.placeId}: ${err}`);
          }
        })
      );
    }
  },
};
