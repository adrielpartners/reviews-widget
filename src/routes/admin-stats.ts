// src/routes/admin-stats.ts
// GET /api/admin/stats — Returns aggregated analytics counts for all active places.
// Used by the admin dashboard SPA to populate card stats.

import { timingSafeEqual } from "../lib/envelopes";
import type { Env } from "../types/env";

export async function handleAdminStats(request: Request, env: Env): Promise<Response> {
  // Auth check
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }
  const token = auth.slice(7);
  if (!timingSafeEqual(token, env.ADMIN_REFRESH_TOKEN)) {
    return new Response(JSON.stringify({ ok: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  // Load registry
  const registry = await getRegistry(env.REVIEWS_KV);
  const now = Math.floor(Date.now() / 1000);
  const startOfWeek = weekStart(now);
  const startOfMonth = monthStart(now);

  const stats: Record<string, any> = {};

  for (const place of registry.places) {
    const pid = place.placeId;
    const [impAll, impWeek, impMonth, panelAll, ctaAll] = await Promise.all([
      count(env.EVENTS_DB, pid, "widget_impression", 0),
      count(env.EVENTS_DB, pid, "widget_impression", startOfWeek),
      count(env.EVENTS_DB, pid, "widget_impression", startOfMonth),
      count(env.EVENTS_DB, pid, "panel_open", 0),
      count(env.EVENTS_DB, pid, "cta_click", 0),
    ]);
    stats[pid] = {
      impressionsAllTime: impAll,
      impressionsWeek: impWeek,
      impressionsMonth: impMonth,
      panelOpens: panelAll,
      ctaClicks: ctaAll,
    };
  }

  return new Response(JSON.stringify({ ok: true, data: { stats } }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
  });
}

async function count(db: D1Database, placeId: string, event: string, since: number): Promise<number> {
  if (since > 0) {
    const r = await db.prepare(
      "SELECT COUNT(*) as c FROM events WHERE place_id = ? AND event = ? AND timestamp >= ?"
    ).bind(placeId, event, since).first<{ c: number }>();
    return r?.c ?? 0;
  }
  const r = await db.prepare(
    "SELECT COUNT(*) as c FROM events WHERE place_id = ? AND event = ?"
  ).bind(placeId, event).first<{ c: number }>();
  return r?.c ?? 0;
}

function weekStart(now: number): number {
  const d = new Date(now * 1000);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function monthStart(now: number): number {
  const d = new Date(now * 1000);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

async function getRegistry(kv: KVNamespace) {
  try {
    const raw = await kv.get("PLACES:ACTIVE", "json");
    if (raw && typeof raw === "object" && Array.isArray((raw as any).places)) return raw as any;
  } catch {}
  return { places: [] };
}