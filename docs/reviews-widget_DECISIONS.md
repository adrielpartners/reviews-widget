# DECISIONS.md

Version: 1.0  
Project: Marketing Hero Reviews Widget  
Repository: `reviews-widget`  
Last Updated: 2026-05-29

---

# Purpose

This file records major architectural and product decisions for Marketing Hero Reviews Widget.

Use this file to prevent future developers or AI agents from relitigating settled choices or accidentally turning the lightweight widget into a premature SaaS platform.

Each decision should include:

- decision
- rationale
- tradeoffs
- date adopted
- reversibility

---

# Decision 001: Use a Cloudflare-native architecture for v1

## Decision

Use Cloudflare Workers, Cloudflare KV, Cloudflare scheduled triggers, and Cloudflare secrets for v1.

## Rationale

The project is an embeddable widget runtime that benefits from global edge delivery, simple deployment, low operational overhead, and fast public reads.

Cloudflare Workers are a good fit for serving widget assets, API responses, and scheduled refresh tasks from one small runtime.

## Tradeoffs

- The project intentionally depends on Cloudflare platform features in v1.
- KV behavior, bindings, secrets, and scheduled triggers are platform-specific.
- The project deviates from the default VPS/PostgreSQL application stack.

## Date Adopted

2026-05-29

## Reversibility

Moderate. The logic can be migrated later if provider and storage access remain isolated behind adapters and services.

---

# Decision 002: Product runtime lives at reviews.marketinghero.net

## Decision

The widget runtime should be served from:

```text
https://reviews.marketinghero.net
```

Marketing pages may remain at:

```text
https://marketinghero.net
```

## Rationale

Using a dedicated subdomain separates product/runtime behavior from the marketing site and matches the existing pattern of using tool-specific subdomains.

## Tradeoffs

- Requires Cloudflare route/subdomain configuration.
- Runtime and marketing site must be managed separately.

## Date Adopted

2026-05-29

## Reversibility

Easy. The runtime domain can change later, but embed codes would need to be updated.

---

# Decision 003: Build a vanilla JavaScript embeddable widget

## Decision

The public widget should be vanilla JavaScript with no framework dependency in v1.

## Rationale

The widget must be lightweight, portable, and safe to embed on many different websites. A framework would add unnecessary bundle size and integration complexity.

## Tradeoffs

- More manual DOM rendering code.
- More discipline required around component structure and accessibility.
- Fewer framework conveniences.

## Date Adopted

2026-05-29

## Reversibility

Moderate. A future build system could generate vanilla output from a framework or component compiler, but v1 should stay simple.

---

# Decision 004: Multi-tenant from day one using Google Place IDs

## Decision

The system must support multiple businesses/locations from day one.

The primary tenant/business identifier in v1 is the Google Place ID.

## Rationale

The widget is intended for multiple client sites and business profile pages. Building around a single hardcoded place would create immediate rework.

## Tradeoffs

- Requires active place registry or equivalent lookup.
- Requires careful cache key design.
- Requires scheduled refresh to iterate through multiple places.

## Date Adopted

2026-05-29

## Reversibility

Should not be reversed. Future SaaS may add account IDs, client IDs, and widget IDs, but Place ID remains an important data key.

---

# Decision 005: Configure v1 widgets through script data attributes

## Decision

v1 widget configuration lives in the embed code using `data-*` attributes.

Example pattern:

```html
<script
  src="https://reviews.marketinghero.net/widget.js"
  data-place-id="..."
  data-mode="inline"
  data-layout="grid"
  data-theme="modern"
  data-max-reviews="6"
  data-cta-text="Read more reviews"
  data-cta-url="https://example.com/reviews">
</script>
```

## Rationale

This allows each site or ACF field to define its own display behavior without a dashboard, account system, or database-backed widget profile.

## Tradeoffs

- Configuration changes require editing embed code.
- No centralized UI for non-technical users in v1.
- Reusing complex configurations may be repetitive.

## Date Adopted

2026-05-29

## Reversibility

Easy. Future SaaS can add saved widget profiles and use a shorter embed code, while still supporting data attributes.

---

# Decision 006: No admin UI in v1

## Decision

Do not build an admin dashboard or customer-facing UI in v1.

## Rationale

The immediate need is to serve client sites controlled by Adriel Partners / Marketing Hero. Manual setup through KV, Wrangler, and embed code is acceptable at this stage.

Avoiding an admin UI keeps v1 focused and reduces authentication, authorization, database, and design complexity.

## Tradeoffs

- Setup is more technical.
- Clients cannot self-manage widgets.
- Manual processes are required to add or update places.

## Date Adopted

2026-05-29

## Reversibility

Easy. An internal admin UI can be added later as v2.

---

# Decision 007: Use scheduled refresh instead of live Google calls on page view

## Decision

Normal public widget requests must read cached review data from KV only.

They must not call Google Places API during the visitor page-view request.

Reviews are refreshed by scheduled Worker jobs and manual admin refresh.

## Rationale

This keeps the widget fast, avoids visitor-facing Google latency, prevents quota spikes, and makes API cost more predictable.

Reviews do not need to be real-time for this use case.

## Tradeoffs

- Review data may be up to 24 hours old.
- A missing cache requires manual or scheduled refresh rather than automatic visitor-triggered fetching.
- Requires active place registry and scheduled job logic.

## Date Adopted

2026-05-29

## Reversibility

Moderate. Cache-on-demand could be added later, but live Google calls on every page view should remain avoided.

---

# Decision 008: Refresh active places every 24 hours

## Decision

The scheduled refresh job should run every 24 hours and refresh all active registered places.

## Rationale

Daily refresh is fresh enough for public reviews while keeping Google API usage and costs controlled.

## Tradeoffs

- Reviews may not reflect same-day changes until the next refresh.
- Large numbers of places may eventually require batching, rate limiting, or queueing.

## Date Adopted

2026-05-29

## Reversibility

Easy. Refresh cadence can be adjusted later.

---

# Decision 009: Include admin-protected manual refresh in v1

## Decision

v1 should include a manual refresh endpoint protected by a bearer token.

Expected pattern:

```text
POST /api/admin/refresh-place
Authorization: Bearer <ADMIN_REFRESH_TOKEN>
```

## Rationale

Manual refresh allows Adriel Partners to update a place immediately after adding a client, fixing data, or testing without waiting for the daily scheduled job.

## Tradeoffs

- Adds an admin-protected endpoint.
- Requires secure token storage and careful logging.
- Must avoid putting tokens in URLs.

## Date Adopted

2026-05-29

## Reversibility

Easy. The endpoint can later be replaced or supplemented by an admin UI.

---

# Decision 010: v1 uses one platform-owned Google Places API key

## Decision

v1 uses a single Google Places API key owned by Marketing Hero / Adriel Partners and stored as a Cloudflare Worker secret.

The key must never be exposed in embed code or browser JavaScript.

## Rationale

This is simplest for the initial internal/client-site use case and avoids building account-level secret management before it is needed.

## Tradeoffs

- Marketing Hero / Adriel Partners bears the API cost in v1.
- Usage across clients is centralized.
- Per-client cost ownership is not available yet.

## Date Adopted

2026-05-29

## Reversibility

Easy to moderate. Future versions can add per-client API keys, but this requires secure storage and likely a dashboard or config process.

---

# Decision 011: Client API keys are a v2 SaaS-path feature

## Decision

Support for clients adding their own Google Places API key should be documented as a v2 feature, not built into v1.

Client API keys must never be stored in public embed code.

## Rationale

Customer-provided keys require secure server-side storage, account/client records, validation, and probably a dashboard or secure internal admin UI.

Adding that in v1 would create unnecessary complexity.

## Tradeoffs

- v1 platform owner pays Google API usage.
- Some future migration work will be needed when per-client keys are introduced.

## Date Adopted

2026-05-29

## Reversibility

This is an additive future feature.

---

# Decision 012: Use KV for review cache and active place registry in v1

## Decision

Use Cloudflare KV to store normalized review data and active place registry information in v1.

## Rationale

KV is well-suited for fast read-heavy public widget data and simple configuration records.

## Tradeoffs

- KV is not a relational database.
- Complex queries, accounts, billing, and secure customer secret management should not be forced into KV.
- KV eventual consistency must be considered.

## Date Adopted

2026-05-29

## Reversibility

Moderate. Future SaaS can use D1 or PostgreSQL as source of truth while keeping KV as the public cache.

---

# Decision 013: Normalize Google responses before storage

## Decision

Do not store raw Google responses as the widget-facing data contract.

Fetch from Google, normalize into a stable internal schema, and store that normalized result in KV.

## Rationale

The widget should not depend on provider-specific response shapes. Normalization makes future provider changes and additional review sources easier.

## Tradeoffs

- Requires normalization code and schema versioning.
- Some raw provider fields may be discarded unless intentionally preserved.

## Date Adopted

2026-05-29

## Reversibility

Should not be reversed. Raw responses may be logged or stored for debugging only if safe and explicitly approved, but widget-facing data should remain normalized.

---

# Decision 014: Keep the public API tiny

## Decision

v1 public API should remain minimal.

Expected endpoints:

```text
GET /api/health
GET /api/reviews
GET /widget.js
```

Admin endpoint:

```text
POST /api/admin/refresh-place
```

## Rationale

A small API is easier to secure, test, document, and maintain.

## Tradeoffs

- Less convenience for advanced management in v1.
- Operational tasks may require Wrangler, KV editing, or manual scripts.

## Date Adopted

2026-05-29

## Reversibility

Easy. Add endpoints when justified.

---

# Decision 015: Support flyout, inline grid, and inline carousel display modes

## Decision

v1 should support:

- flyout widget
- inline grid
- inline carousel

## Rationale

These modes cover the main website use cases: persistent trust signal, page-embedded review section, and compact interactive display.

## Tradeoffs

- More UI logic than a single display mode.
- Shared theme and component architecture is required to avoid duplication.

## Date Adopted

2026-05-29

## Reversibility

Easy. Modes can be added, removed, or refined over time.

---

# Decision 016: Use shared theme tokens across all display modes

## Decision

All widget modes must use a shared theme system and CSS custom properties.

Built-in themes:

```text
default
modern
professional
pastel
```

## Rationale

Shared theme tokens keep the widget visually consistent and prevent every display mode from inventing its own styling.

## Tradeoffs

- Requires up-front discipline in CSS structure.
- Some mode-specific styling is still necessary.

## Date Adopted

2026-05-29

## Reversibility

Should not be reversed. Theme values may evolve, but the shared theme principle should stay.

---

# Decision 017: Keep the repository single-purpose and single-runtime in v1

## Decision

Use one repository for the widget, Worker, assets, and deployment configuration.

Current repository:

```text
reviews-widget/
```

## Rationale

The project is small enough that splitting repos would add overhead. A single repo keeps Worker code, widget code, and Cloudflare deployment config together.

## Tradeoffs

- Requires clear folder boundaries inside one repo.
- Build steps must keep browser widget and Worker runtime responsibilities separate.

## Date Adopted

2026-05-29

## Reversibility

Easy. A future SaaS dashboard or separate backend could be split later.

---

# Decision 018: Document SaaS path but do not build SaaS prematurely

## Decision

The build docs should document a future SaaS path while keeping v1 focused on internal/client-site use.

## Rationale

Future SaaS is plausible, especially for customer-managed API keys, dashboards, billing, and widget profiles. But building those now would slow down the immediate client-service use case.

## Tradeoffs

- Some future refactoring may be needed.
- Agents must distinguish between documented future path and current v1 scope.

## Date Adopted

2026-05-29

## Reversibility

Not applicable. This is a planning boundary.

---

# Maintenance Rule

Update this file when:

- runtime platform changes
- storage approach changes
- API endpoints change
- refresh strategy changes
- Google API ownership changes
- per-client API key support is added
- dashboard/admin UI is added
- widget configuration model changes
- display modes or themes meaningfully change
- SaaS path changes

Do not let major decisions live only in chat history.
