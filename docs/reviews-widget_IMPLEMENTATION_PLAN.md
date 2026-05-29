# IMPLEMENTATION_PLAN.md

Version: 1.0  
Project: Marketing Hero Reviews Widget  
Repository: `reviews-widget`  
System Type: Cloudflare-hosted embeddable widget platform  
Last Updated: 2026-05-29

---

# Purpose

This file turns the Reviews Widget architecture into an ordered build plan.

Use this as the working roadmap for AI agents and developers. It is not permanent doctrine. Update it as work is completed, priorities change, or implementation details become clearer.

Before working on any phase, read:

1. `AGENTS.md`
2. `CODING_CONSTITUTION.md`
3. `ARCHITECTURE.md`
4. `DECISIONS.md`
5. `PROJECT_RULES.md`
6. `IMPLEMENTATION_PLAN.md`

Do not apply WordPress-native plugin rules to this repo. This is not a WordPress plugin.

---

# Agent Instructions

When using this plan:

1. Work on one phase or one step at a time.
2. Inspect the repo before editing.
3. Preserve the lightweight widget boundary.
4. Do not add a dashboard unless explicitly asked.
5. Do not add accounts, billing, or a database in v1 unless explicitly approved.
6. Do not put Google API keys or admin tokens in embed code.
7. Mark checklist items complete only after implementation and verification.
8. If the code conflicts with the docs, stop and report the conflict.
9. If a step requires a new decision, ask or document the assumption.
10. End each task with changed files, verification notes, risks, and next step.

Suggested prompt:

```text
You are working in the reviews-widget repo.

Read:
- AGENTS.md
- CODING_CONSTITUTION.md
- ARCHITECTURE.md
- DECISIONS.md
- PROJECT_RULES.md
- IMPLEMENTATION_PLAN.md

Task:
Work on Phase __, Step __ from IMPLEMENTATION_PLAN.md.

Rules:
- Do not skip ahead.
- Do not change unrelated files.
- Preserve the Cloudflare widget architecture.
- Do not add an admin dashboard, accounts, billing, or a durable database in v1.
- Keep the public widget dependency-light.
- Update the checklist only for completed work.
- Run the smallest relevant verification available.
- Summarize changed files, verification, assumptions, risks, and next step.
```

---

# Build Strategy

Build in this order:

1. Establish repo baseline.
2. Normalize Cloudflare Worker structure.
3. Define types, response envelopes, and config.
4. Implement health endpoint.
5. Implement KV key/storage layer.
6. Implement place registry.
7. Implement Google Places provider adapter.
8. Implement normalization service.
9. Implement scheduled refresh.
10. Implement manual refresh endpoint.
11. Implement public reviews endpoint.
12. Build widget configuration parser.
13. Build shared theme system.
14. Build review card and shared components.
15. Build inline grid.
16. Build inline carousel.
17. Build flyout mode.
18. Add CTA, modal, cookie, and interaction polish.
19. Harden accessibility, performance, and errors.
20. Finalize deployment docs and handoff.

---

# Phase 0: Repository Baseline

Goal: Understand the current repo and avoid accidental overwrite.

## Checklist

- [ ] Run `git status`.
- [ ] Review current file structure.
- [ ] Confirm repository name is `reviews-widget`.
- [ ] Identify whether source is currently JavaScript or TypeScript.
- [ ] Identify current build tooling, if any.
- [ ] Identify current `wrangler.toml` configuration.
- [ ] Identify existing Worker entrypoint.
- [ ] Identify existing asset serving behavior.
- [ ] Identify existing KV bindings, if any.
- [ ] Identify any existing widget code.
- [ ] Identify any existing Google API code.
- [ ] Summarize the baseline before editing.

## Verification

- [ ] Repo state is known.
- [ ] No user changes were overwritten.
- [ ] Current app/Worker can be run or current failure is documented.

---

# Phase 1: Normalize Project Structure

Goal: Establish a clear folder structure without adding unnecessary behavior.

## Target Structure

```text
reviews-widget/
  assets/
  src/
    worker.ts
    routes/
    services/
    providers/
    storage/
    widget/
    types/
    tests/
  wrangler.toml
  README.md
  AGENTS.md
  CODING_CONSTITUTION.md
  ARCHITECTURE.md
  DECISIONS.md
  IMPLEMENTATION_PLAN.md
  PROJECT_RULES.md
```

## Checklist

- [ ] Ensure Worker entrypoint exists.
- [ ] Create `src/routes/` if route handling is non-trivial.
- [ ] Create `src/services/` for business behavior.
- [ ] Create `src/providers/` for Google Places provider code.
- [ ] Create `src/storage/` for KV key and read/write logic.
- [ ] Create `src/widget/` for browser widget code.
- [ ] Create `src/types/` for shared types if using TypeScript.
- [ ] Keep behavior minimal.
- [ ] Avoid vague folders such as `misc`, `stuff`, or broad `utils`.

## Verification

- [ ] Worker still starts locally.
- [ ] No public behavior changed unless intentionally documented.
- [ ] Basic syntax/build check passes.

---

# Phase 2: Configuration, Environment, and Response Envelopes

Goal: Centralize config and standard API response shapes.

## Recommended Cloudflare Bindings

```text
REVIEWS_KV
```

## Required Secrets

```text
GOOGLE_PLACES_API_KEY
ADMIN_REFRESH_TOKEN
```

## Optional Environment Values

```text
LOG_LEVEL
ALLOWED_ORIGINS
REFRESH_BATCH_SIZE
```

## Checklist

- [ ] Define environment/binding types if using TypeScript.
- [ ] Centralize config access.
- [ ] Add response envelope helpers.
- [ ] Add error envelope helpers.
- [ ] Add safe error code constants.
- [ ] Ensure secrets are never returned to clients.
- [ ] Add or update `.dev.vars.example` if appropriate.
- [ ] Update README with required local config placeholders.

## Verification

- [ ] Worker starts with local config.
- [ ] Missing required secret behavior is clear for code paths that need it.
- [ ] Error responses use consistent shape.

---

# Phase 3: Health Endpoint

Goal: Add a simple health check before more complex behavior.

## Endpoint

```text
GET /api/health
```

## Checklist

- [ ] Implement health route.
- [ ] Return consistent success envelope.
- [ ] Include basic runtime status only.
- [ ] Do not expose secrets, account data, or provider details.

## Verification

- [ ] `GET /api/health` returns `ok: true`.
- [ ] Endpoint works locally through Wrangler.

---

# Phase 4: KV Storage Layer

Goal: Isolate KV key construction and storage operations.

## Candidate Key Patterns

```text
REVIEWS:<placeId>
PLACE:<placeId>
PLACES:ACTIVE
REFRESH_LOG:<placeId>
```

Final names should be chosen and documented before broad usage.

## Checklist

- [ ] Create KV key helper module.
- [ ] Create review cache store.
- [ ] Create place registry store.
- [ ] Create refresh log/status store if needed.
- [ ] Add JSON parse/stringify safety.
- [ ] Normalize missing-key behavior.
- [ ] Avoid raw KV key construction outside storage layer.

## Verification

- [ ] Can read missing review cache safely.
- [ ] Can write/read test review cache locally.
- [ ] Bad JSON does not crash public endpoint without a safe error.

---

# Phase 5: Place Registry

Goal: Support multi-tenant active places from day one.

## Registry Purpose

The scheduled refresh job needs to know which places are active.

## Candidate Registry Shape

```json
{
  "places": [
    {
      "placeId": "...",
      "businessName": "...",
      "active": true,
      "source": "google_places"
    }
  ]
}
```

## Checklist

- [ ] Define active place registry schema.
- [ ] Add registry read function.
- [ ] Add helper to get active places only.
- [ ] Add validation/normalization for registry records.
- [ ] Decide whether manual refresh can refresh unregistered place IDs.
- [ ] Document how to add a place manually in v1.

## Verification

- [ ] Active places can be read from KV.
- [ ] Inactive places are skipped by scheduled refresh.
- [ ] Invalid registry records are handled safely.

---

# Phase 6: Google Places Provider Adapter

Goal: Isolate all Google Places API behavior behind one provider module.

## Checklist

- [ ] Create `google-places-provider` module.
- [ ] Load API key from Worker secret.
- [ ] Build Google request URL safely.
- [ ] Use `fetch` with clear error handling.
- [ ] Validate Google response status.
- [ ] Return provider result or normalized provider error.
- [ ] Do not log API key.
- [ ] Do not expose raw Google errors to public widget requests.
- [ ] Add timeout strategy if practical within Worker constraints.

## Verification

- [ ] Valid place can be fetched in local/test environment.
- [ ] Invalid API key fails safely.
- [ ] Invalid place ID fails safely.
- [ ] Provider errors are normalized.

---

# Phase 7: Review Normalization Service

Goal: Convert Google responses into stable widget-facing data.

## Normalized Data Shape

Candidate:

```json
{
  "schemaVersion": 1,
  "source": "google_places",
  "placeId": "...",
  "businessName": "...",
  "rating": 4.9,
  "reviewCount": 127,
  "reviews": [],
  "fetchedAt": "2026-05-29T00:00:00Z"
}
```

## Checklist

- [ ] Define normalized review cache type/schema.
- [ ] Normalize business name.
- [ ] Normalize average rating.
- [ ] Normalize total review count.
- [ ] Normalize review list.
- [ ] Preserve useful public fields only.
- [ ] Add schema version.
- [ ] Add fetched timestamp.
- [ ] Reject or fail safely on invalid provider response.

## Verification

- [ ] Sample Google response normalizes correctly.
- [ ] Missing reviews array is handled safely.
- [ ] Missing rating or count behavior is defined.
- [ ] Widget-facing schema does not expose raw provider internals.

---

# Phase 8: Scheduled Refresh

Goal: Refresh all active registered places every 24 hours.

## Checklist

- [ ] Add scheduled handler in Worker entrypoint.
- [ ] Load active places from registry.
- [ ] Refresh each active place.
- [ ] Normalize provider response.
- [ ] Write review cache to KV.
- [ ] Write refresh status/log if implemented.
- [ ] Continue processing if one place fails.
- [ ] Add bounded retry for transient provider failures if practical.
- [ ] Avoid unbounded loops.
- [ ] Configure cron in `wrangler.toml`.

## Suggested Cron

```text
0 8 * * *
```

This runs daily at 08:00 UTC unless changed.

## Verification

- [ ] Scheduled handler can be invoked locally or through Wrangler test method.
- [ ] Active places are refreshed.
- [ ] Failed place does not stop all other places.
- [ ] KV cache updates with normalized data.
- [ ] Logs do not expose secrets.

---

# Phase 9: Manual Refresh Endpoint

Goal: Allow admin-triggered refresh without waiting for cron.

## Endpoint

```text
POST /api/admin/refresh-place
Authorization: Bearer <ADMIN_REFRESH_TOKEN>
```

## Checklist

- [ ] Add route for manual refresh.
- [ ] Require POST.
- [ ] Verify Authorization header.
- [ ] Compare token safely.
- [ ] Reject missing/invalid token.
- [ ] Validate request body.
- [ ] Validate place ID.
- [ ] Refresh Google data.
- [ ] Normalize and write KV cache.
- [ ] Return consistent response envelope.
- [ ] Do not put token in URL.
- [ ] Do not log token.

## Verification

- [ ] Missing token returns unauthorized.
- [ ] Invalid token returns unauthorized.
- [ ] Valid token refreshes place.
- [ ] Invalid place ID fails safely.
- [ ] KV cache updates after refresh.

---

# Phase 10: Public Reviews Endpoint

Goal: Serve cached normalized review data to the widget.

## Endpoint

```text
GET /api/reviews?placeId=<place_id>
```

## Checklist

- [ ] Add public reviews route.
- [ ] Validate place ID query parameter.
- [ ] Read normalized review cache from KV.
- [ ] Return success envelope when data exists.
- [ ] Return safe error envelope when data is missing.
- [ ] Do not call Google from this route.
- [ ] Add cache headers if appropriate.
- [ ] Consider CORS behavior for client sites.

## Verification

- [ ] Valid cached place returns review data.
- [ ] Missing place returns safe unavailable response.
- [ ] Invalid place ID is rejected.
- [ ] Route does not require admin token.
- [ ] Route does not call Google.

---

# Phase 11: Widget Script Entrypoint

Goal: Serve and initialize the embeddable widget.

## Script Pattern

```html
<script
  src="https://reviews.marketinghero.net/widget.js"
  data-place-id="..."
  data-mode="inline"
  data-layout="grid"
  data-theme="modern">
</script>
```

## Checklist

- [ ] Serve `GET /widget.js` or route static asset correctly.
- [ ] Locate the current script tag.
- [ ] Parse `data-*` attributes.
- [ ] Apply defaults for missing optional values.
- [ ] Create mount element when needed.
- [ ] Support render where script is placed.
- [ ] Support custom mount selector.
- [ ] Fetch `/api/reviews` for configured place ID.
- [ ] Render safe fallback when data is unavailable.

## Verification

- [ ] Widget loads on a static HTML test page.
- [ ] Widget reads `data-place-id`.
- [ ] Widget fetches review data from Worker endpoint.
- [ ] Missing config fails gracefully.

---

# Phase 12: Widget Configuration Parser

Goal: Normalize all embed options in one place.

## Candidate Attributes

```text
data-place-id
data-mode
data-layout
data-theme
data-position
data-max-reviews
data-cta-text
data-cta-url
data-mount
data-custom-class
```

## Checklist

- [ ] Define supported attributes.
- [ ] Normalize mode values.
- [ ] Normalize layout values.
- [ ] Normalize theme values.
- [ ] Normalize flyout position.
- [ ] Normalize max review count with safe default.
- [ ] Validate CTA URL.
- [ ] Validate mount selector behavior.
- [ ] Ignore unknown attributes safely.
- [ ] Document the embed options in README.

## Verification

- [ ] Valid attributes produce expected config.
- [ ] Invalid attributes fall back safely.
- [ ] Max reviews cannot be abused with unreasonable values.
- [ ] CTA URL handling is safe.

---

# Phase 13: Shared Theme System

Goal: Establish consistent visual styling across modes.

## Built-In Themes

```text
default
modern
professional
pastel
```

## Checklist

- [ ] Define base CSS variables.
- [ ] Define theme token maps.
- [ ] Apply theme class to widget root.
- [ ] Avoid hardcoded one-off colors in components.
- [ ] Include spacing, radius, border, shadow, typography, and motion tokens.
- [ ] Support custom CSS overrides through predictable classes and variables.
- [ ] Avoid external fonts.

## Verification

- [ ] Each theme renders distinctly.
- [ ] All display modes use the same tokens.
- [ ] Custom CSS variables can override key values.

---

# Phase 14: Shared Components

Goal: Build reusable widget UI pieces before display modes.

## Components

- review card
- star rating
- CTA button
- modal
- carousel controls
- empty/error state

## Checklist

- [ ] Build review card renderer.
- [ ] Build rating display.
- [ ] Build CTA button renderer.
- [ ] Build Read More modal.
- [ ] Build empty state renderer.
- [ ] Ensure components use theme classes/tokens.
- [ ] Escape/sanitize dynamic text correctly.
- [ ] Avoid unsafe HTML injection.

## Verification

- [ ] Review text renders safely.
- [ ] Long reviews do not break layout.
- [ ] CTA renders only when configured.
- [ ] Modal opens/closes by click and keyboard.

---

# Phase 15: Inline Grid Mode

Goal: Render reviews inline in a responsive grid.

## Checklist

- [ ] Add inline grid renderer.
- [ ] Use max review count.
- [ ] Support optional CTA.
- [ ] Support responsive layout.
- [ ] Use shared review card.
- [ ] Use shared theme tokens.
- [ ] Render where script is placed by default.
- [ ] Support custom mount selector.

## Verification

- [ ] Grid renders on desktop.
- [ ] Grid renders on mobile.
- [ ] Max reviews works.
- [ ] Optional CTA works.

---

# Phase 16: Inline Carousel Mode

Goal: Render reviews inline as a carousel.

## Checklist

- [ ] Add carousel renderer.
- [ ] Support auto-rotation.
- [ ] Add left/right controls.
- [ ] Pause on hover if practical.
- [ ] Respect reduced motion where practical.
- [ ] Support max review count.
- [ ] Support optional CTA.
- [ ] Ensure keyboard-accessible controls.

## Verification

- [ ] Carousel advances automatically.
- [ ] Controls work.
- [ ] Keyboard interaction works.
- [ ] Mobile layout works.

---

# Phase 17: Flyout Mode

Goal: Render rotating flyout review widget.

## Required Behavior

- bottom-right, bottom-center, bottom-left positions
- rotates every 5 seconds
- fade transitions
- pause on hover
- pause when tab hidden
- optional CTA button
- Read More modal
- personalization cookie

## Checklist

- [ ] Add flyout renderer.
- [ ] Support position config.
- [ ] Add 5-second rotation.
- [ ] Add fade transition.
- [ ] Pause on hover.
- [ ] Pause when document hidden.
- [ ] Add personalization cookie behavior.
- [ ] Add optional CTA.
- [ ] Use shared modal for Read More.
- [ ] Ensure mobile behavior is acceptable.

## Verification

- [ ] Flyout renders in configured position.
- [ ] Rotation works.
- [ ] Hover pause works.
- [ ] Hidden tab pause works.
- [ ] Cookie behavior works as designed.
- [ ] Read More modal works.

---

# Phase 18: Embed Testing and Example Pages

Goal: Make it easy to test real embed scenarios.

## Checklist

- [ ] Add local/static example HTML page.
- [ ] Add examples for flyout, grid, and carousel.
- [ ] Add example with CTA.
- [ ] Add example with custom mount selector.
- [ ] Add README embed snippets.
- [ ] Add ACF-style full embed code example.

## Verification

- [ ] Examples work locally.
- [ ] Examples work against deployed Worker preview if available.
- [ ] Copy/paste embed snippets are correct.

---

# Phase 19: Accessibility, Performance, and Resilience Hardening

Goal: Make the widget production-safe.

## Checklist

- [ ] Keyboard test modal and carousel controls.
- [ ] Add ARIA labels where useful.
- [ ] Ensure focus states are visible.
- [ ] Ensure modal traps or manages focus reasonably.
- [ ] Respect reduced motion where practical.
- [ ] Review color contrast.
- [ ] Ensure script failure does not break host page.
- [ ] Ensure missing reviews shows safe fallback.
- [ ] Ensure CSS is scoped to widget root.
- [ ] Check mobile layout.
- [ ] Check script size.

## Verification

- [ ] Manual browser smoke test passes.
- [ ] Mobile viewport test passes.
- [ ] No obvious console errors.
- [ ] Host page styling is not polluted.

---

# Phase 20: Deployment Readiness

Goal: Prepare Cloudflare deployment.

## Checklist

- [ ] Configure `wrangler.toml` for `reviews.marketinghero.net`.
- [ ] Configure KV namespace binding.
- [ ] Configure scheduled trigger.
- [ ] Set `GOOGLE_PLACES_API_KEY` secret.
- [ ] Set `ADMIN_REFRESH_TOKEN` secret.
- [ ] Confirm Worker route.
- [ ] Confirm `/widget.js` loads from production domain.
- [ ] Confirm `/api/health` works.
- [ ] Confirm manual refresh works.
- [ ] Confirm public reviews endpoint works.
- [ ] Confirm widget works on test page.

## Verification

- [ ] `wrangler deploy` succeeds.
- [ ] Health endpoint responds in production.
- [ ] Manual refresh writes KV data.
- [ ] Widget renders on external test page.
- [ ] Logs do not expose secrets.

---

# Phase 21: Documentation and Handoff

Goal: Make the repo understandable to future agents and developers.

## Checklist

- [ ] Update `README.md`.
- [ ] Document local development.
- [ ] Document Cloudflare setup.
- [ ] Document required secrets.
- [ ] Document KV key patterns.
- [ ] Document place registry format.
- [ ] Document embed options.
- [ ] Document display modes.
- [ ] Document themes.
- [ ] Document manual refresh endpoint.
- [ ] Document scheduled refresh behavior.
- [ ] Document known limitations.
- [ ] Document SaaS future path.
- [ ] Update `ARCHITECTURE.md` if implementation differs.
- [ ] Update `DECISIONS.md` if new decisions were made.
- [ ] Update `PROJECT_RULES.md` if repo rules changed.

---

# Progress Tracker

- [x] Phase 0: Repository Baseline
- [x] Phase 1: Normalize Project Structure
- [x] Phase 2: Configuration, Environment, and Response Envelopes
- [x] Phase 3: Health Endpoint
- [x] Phase 4: KV Storage Layer
- [x] Phase 5: Place Registry
- [x] Phase 6: Google Places Provider Adapter
- [x] Phase 7: Review Normalization Service
- [x] Phase 8: Scheduled Refresh
- [x] Phase 9: Manual Refresh Endpoint
- [x] Phase 10: Public Reviews Endpoint
- [x] Phase 11: Widget Script Entrypoint
- [x] Phase 12: Widget Configuration Parser
- [x] Phase 13: Shared Theme System
- [x] Phase 14: Shared Components
- [x] Phase 15: Inline Grid Mode
- [x] Phase 16: Inline Carousel Mode
- [x] Phase 17: Flyout Mode
- [x] Phase 18: Embed Testing and Example Pages
- [x] Phase 19: Accessibility, Performance, and Resilience Hardening
- [x] Phase 20: Deployment Readiness
- [x] Phase 21: Documentation and Handoff

## Next Recommended Step

Deploy to production:
1. Create KV namespace: `wrangler kv:namespace create REVIEWS_KV`
2. Set secrets: `wrangler secret put GOOGLE_PLACES_API_KEY` + `wrangler secret put ADMIN_REFRESH_TOKEN`
3. Configure route: `reviews.marketinghero.net/*`
4. Deploy: `npm run deploy`
5. Add first place to KV registry and test manual refresh

---

## Next Recommended Step

Start with deployment (see above). All phases complete! 🎉

---

# Maintenance Rule

Update this implementation plan when a phase is completed, skipped, expanded, or reordered.

Do not let the checklist drift away from reality.
