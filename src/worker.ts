// src/worker.ts — Reviews Widget Cloudflare Worker
// Handles routing for public API, widget asset, admin refresh, and scheduled events.

import type { Env } from "./types/env";
import { jsonResponse, successEnvelope, errorEnvelope } from "./lib/envelopes";
import { ErrorCode } from "./types/errors";
import { handleHealth } from "./routes/health";
import { handleReviews } from "./routes/reviews";
import { handleWidget } from "./routes/widget";
import { handleAdminRefresh } from "./routes/admin-refresh";
import { handleSetup } from "./routes/setup";
import { handleTrack } from "./routes/track";
import { handleConfig } from "./routes/config";
import { handleAdminListPlaces, handleAdminUpdateConfig, handleAdminAddPlace } from "./routes/admin-places";
import { handleAdminDashboard } from "./routes/admin-dashboard";
import { handleAdminStats } from "./routes/admin-stats";
import { refreshPlace } from "./services/refresh-service";
import { getActivePlaces } from "./storage/place-registry-store";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // === Public endpoints ===

    if (url.pathname === "/api/health") {
      return handleHealth();
    }

    if (url.pathname === "/api/reviews") {
      return handleReviews(request, env.REVIEWS_KV);
    }

    if (url.pathname === "/widget.js") {
      return handleWidget();
    }

    if (url.pathname === "/setup") {
      return handleSetup();
    }

    if (url.pathname === "/api/config") {
      return handleConfig(request, env.REVIEWS_KV);
    }

    if (url.pathname === "/api/track") {
      return handleTrack(request, env);
    }

    // === Admin-only endpoints ===

    if (url.pathname === "/api/admin/refresh-place") {
      return handleAdminRefresh(request, env);
    }

    if (url.pathname === "/admin/dashboard") {
      return handleAdminDashboard(request, env);
    }

    if (url.pathname === "/api/admin/stats") {
      return handleAdminStats(request, env);
    }

    if (url.pathname === "/api/admin/places") {
      if (request.method === "GET") {
        return handleAdminListPlaces(request, env);
      }
      if (request.method === "POST") {
        return handleAdminAddPlace(request, env);
      }
      return jsonResponse(405, errorEnvelope(ErrorCode.METHOD_NOT_ALLOWED, "Method not allowed"));
    }

    // PUT /api/admin/places/:placeId/config
    const configMatch = url.pathname.match(/^\/api\/admin\/places\/([^/]+)\/config$/);
    if (configMatch) {
      return handleAdminUpdateConfig(request, env, configMatch[1]);
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