// src/routes/health.ts

import { jsonResponse, successEnvelope } from "../lib/envelopes";

export function handleHealth(): Response {
  return jsonResponse(200, successEnvelope({ status: "healthy" }));
}
