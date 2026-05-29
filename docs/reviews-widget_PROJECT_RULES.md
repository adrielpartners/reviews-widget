# PROJECT_RULES.md

Version: 1.0  
Project: Marketing Hero Reviews Widget  
Repository: `reviews-widget`  
System Type: Cloudflare-hosted embeddable widget platform  
Last Updated: 2026-05-29

---

# Purpose

This file defines repository-specific rules for AI agents and developers working on Marketing Hero Reviews Widget.

This is not the architecture document. This file tells agents how to work inside this repo without turning a lightweight embeddable widget into a premature SaaS dashboard, leaking API keys, or creating brittle client-site code.

Before making substantial changes, read:

1. `CODING_CONSTITUTION.md`
2. `AGENTS.md`
3. `ARCHITECTURE.md`
4. `DECISIONS.md`
5. `PROJECT_RULES.md`
6. `IMPLEMENTATION_PLAN.md`

---

# 1. Repository Role

This repo contains the Marketing Hero Reviews Widget runtime.

The repo owns:

- Cloudflare Worker runtime
- widget JavaScript
- widget styles/assets
- public reviews API
- Google Places refresh logic
- Cloudflare KV storage access
- scheduled refresh handler
- admin-protected manual refresh endpoint
- theme system
- display modes
- deployment config

The repo does not own in v1:

- customer dashboard
- user accounts
- billing
- client self-service onboarding
- WordPress plugin behavior
- Google OAuth
- Google Business Profile API integration
- per-client API key management
- durable relational database

---

# 2. Absolute Rules

AI agents must follow these rules:

1. Do not put Google API keys in embed code.
2. Do not put admin refresh tokens in URLs.
3. Do not expose secrets to browser JavaScript.
4. Do not call Google Places API during normal public widget page views.
5. Do not add an admin dashboard in v1 unless explicitly approved.
6. Do not add accounts, billing, or SaaS database tables in v1 unless explicitly approved.
7. Do not add dependencies casually.
8. Do not require WordPress for the widget to work.
9. Do not hardcode client-specific display behavior into the widget.
10. Do not scatter raw KV key construction throughout the codebase.
11. Do not let display modes create separate visual systems.
12. Do not allow widget CSS to pollute the host page.
13. Do not use unsafe HTML injection for review text or client-provided values.
14. Do not expose raw Google provider errors to public widget users.
15. Do not claim deployment, tests, or refresh behavior works unless verified.

---

# 3. Architectural Flow

Use this public widget flow:

```text
Client Website
→ widget.js
→ Widget Config Parser
→ Widget Renderer
→ Reviews API Client
→ Worker API
→ KV Storage
```

Use this refresh flow:

```text
Scheduled Trigger / Manual Admin Endpoint
→ Auth Check for Manual Refresh
→ Refresh Service
→ Google Places Provider
→ Normalization Service
→ KV Storage
```

## Public Request Rule

Public widget requests read from KV only.

They must not call Google directly.

## Refresh Rule

Google Places API calls happen only in:

- scheduled refresh
- admin-protected manual refresh
- explicitly approved maintenance scripts

---

# 4. File and Folder Rules

Preferred structure:

```text
reviews-widget/
  assets/
    widget.css
  src/
    worker.ts
    routes/
      health.ts
      reviews.ts
      widget.ts
      admin-refresh.ts
    services/
      review-service.ts
      refresh-service.ts
      place-registry-service.ts
      normalization-service.ts
      theme-service.ts
    providers/
      google-places-provider.ts
      types.ts
    storage/
      kv-keys.ts
      review-cache-store.ts
      place-registry-store.ts
      refresh-log-store.ts
    widget/
      index.ts
      config.ts
      api-client.ts
      render.ts
      modes/
        flyout.ts
        inline-grid.ts
        inline-carousel.ts
      components/
        review-card.ts
        modal.ts
        cta-button.ts
      themes/
        tokens.ts
        default.ts
        modern.ts
        professional.ts
        pastel.ts
      utils/
        dom.ts
        cookies.ts
        visibility.ts
    types/
      reviews.ts
      widget-config.ts
      api.ts
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

## Placement Rules

- Worker routing belongs in `src/routes/` or the Worker entrypoint if still simple.
- Business behavior belongs in `src/services/`.
- Google-specific API code belongs in `src/providers/`.
- KV access belongs in `src/storage/`.
- Browser widget code belongs in `src/widget/`.
- Shared types belong in `src/types/`.
- Theme definitions belong in `src/widget/themes/`.
- Display-mode renderers belong in `src/widget/modes/`.

Avoid vague folders such as:

```text
misc
stuff
temp
old
new
random
```

Avoid broad `utils` unless the folder is tightly scoped under a domain such as `src/widget/utils/`.

---

# 5. Cloudflare Rules

## Runtime

This project runs on Cloudflare Workers in v1.

## KV Binding

Recommended binding:

```text
REVIEWS_KV
```

Do not rename bindings casually. If changed, update:

- `wrangler.toml`
- `ARCHITECTURE.md`
- `README.md`
- implementation references

## Required Secrets

```text
GOOGLE_PLACES_API_KEY
ADMIN_REFRESH_TOKEN
```

Rules:

- secrets must be configured through Cloudflare/Wrangler
- secrets must never be committed
- secrets must never be returned to clients
- secrets must never appear in examples except as placeholders

## Scheduled Trigger

Reviews refresh every 24 hours.

The cron expression should be documented in `wrangler.toml` and README.

---

# 6. API Rules

## Expected Public Endpoints

```text
GET /widget.js
GET /api/reviews
GET /api/health
```

## Expected Admin Endpoint

```text
POST /api/admin/refresh-place
```

Do not add new endpoints without a clear reason.

## Response Shape

Use consistent JSON envelopes.

Success:

```json
{
  "ok": true,
  "data": {}
}
```

Failure:

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-safe message."
  }
}
```

Do not return:

- stack traces
- raw Google API errors
- secrets
- internal implementation details
- full Authorization headers

---

# 7. Public Reviews Endpoint Rules

Endpoint:

```text
GET /api/reviews?placeId=<place_id>
```

Rules:

- validate `placeId`
- read from KV only
- do not call Google
- return normalized review data
- return safe unavailable state when cache is missing
- do not expose raw provider fields unless intentionally normalized

Public reviews data may include:

- place ID
- business name
- average rating
- review count
- review list
- fetched timestamp
- source label

---

# 8. Manual Refresh Rules

Endpoint:

```text
POST /api/admin/refresh-place
Authorization: Bearer <ADMIN_REFRESH_TOKEN>
```

Rules:

- require POST
- require Authorization header
- use bearer token, not query string token
- validate token before doing any refresh work
- validate place ID
- fetch Google data only after authorization succeeds
- normalize before storage
- write to KV
- return structured response
- never log the token

---

# 9. Scheduled Refresh Rules

Scheduled refresh should:

- run every 24 hours
- load active places from registry
- skip inactive places
- refresh each active place from Google Places API
- normalize responses
- write review cache to KV
- log failures safely
- continue refreshing other places if one place fails
- avoid unbounded retries

Scheduled refresh should not:

- require a browser request
- depend on WordPress
- expose results publicly except through cached review endpoint
- fail the entire run because one place fails

---

# 10. Google Places Provider Rules

Google Places API code must live behind a provider adapter.

Rules:

- keep Google-specific response handling out of widget rendering
- keep Google-specific response handling out of route handlers
- load API key from secret only
- never send API key to browser
- normalize provider errors
- do not expose raw provider errors to public API
- do not store raw provider response as the widget-facing contract

Future Google Business Profile API integration must be added as a new provider/integration path, not mixed directly into widget UI code.

---

# 11. Storage and Data Rules

## KV Key Ownership

KV key construction should live in one module.

Recommended:

```text
src/storage/kv-keys.ts
```

Do not scatter strings such as `REVIEWS:${placeId}` throughout the codebase.

## Candidate Key Patterns

```text
REVIEWS:<placeId>
PLACE:<placeId>
PLACES:ACTIVE
REFRESH_LOG:<placeId>
```

Final patterns must be documented once implemented.

## Data Shape Rules

Review cache data must be normalized before storage.

Include:

- schema version
- source
- place ID
- business name
- average rating
- total review count
- reviews array
- fetched timestamp

Do not make the widget depend on raw Google response shape.

---

# 12. Widget Configuration Rules

v1 configuration lives in script `data-*` attributes.

Candidate attributes:

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

Rules:

- parse config in one module
- provide safe defaults
- validate known enum values
- clamp max review count to a reasonable limit
- validate CTA URLs
- ignore unknown attributes safely
- never treat embed configuration as trusted input

---

# 13. Widget Display Rules

Supported v1 modes:

- flyout
- inline grid
- inline carousel

## Flyout Requirements

- bottom-right, bottom-center, bottom-left positions
- rotates every 5 seconds
- fade transitions
- pause on hover
- pause when tab hidden
- optional CTA button
- Read More modal
- personalization cookie

## Inline Grid Requirements

- render where script is placed by default
- support custom mount selector
- configurable max reviews
- optional CTA
- responsive layout

## Inline Carousel Requirements

- render where script is placed by default
- support custom mount selector
- auto-rotate
- left/right arrows
- configurable max reviews
- optional CTA
- accessible controls

---

# 14. Theme and CSS Rules

Built-in themes:

```text
default
modern
professional
pastel
```

Rules:

- use shared theme tokens
- use CSS custom properties
- scope CSS to widget root
- do not pollute host page styles
- avoid external fonts
- avoid broad global selectors
- avoid hardcoded one-off colors in components
- support custom overrides through classes and variables

The widget should remain visually clean, trustworthy, lightweight, and professional.

---

# 15. Security Rules

Treat all external input as untrusted.

Validate:

- query parameters
- request body
- script data attributes
- place IDs
- CTA URLs
- mount selectors
- admin authorization headers
- provider responses

Never expose:

- Google Places API key
- admin refresh token
- Cloudflare secrets
- raw Authorization headers
- stack traces
- raw provider error dumps

Never commit:

- `.dev.vars` with real secrets
- API keys
- admin tokens
- private client data

---

# 16. Accessibility Rules

The widget must consider:

- keyboard access
- visible focus states
- semantic buttons
- ARIA labels where useful
- modal close behavior
- escape key support for modal close
- carousel controls that can be used without a mouse
- readable contrast
- reduced motion preference where practical

Do not sacrifice accessibility for visual polish.

---

# 17. Performance Rules

The widget should be fast and lightweight.

Rules:

- no frontend framework in v1
- no dependencies unless clearly justified
- no Google API call on page view
- public request path reads KV only
- avoid external fonts
- avoid unnecessary images
- avoid heavy runtime work
- keep script size small
- avoid layout thrashing
- fail gracefully without breaking host page

---

# 18. Error Handling Rules

Recommended error codes:

```text
INVALID_PLACE_ID
REVIEWS_NOT_FOUND
REVIEWS_CACHE_EMPTY
GOOGLE_API_FAILED
GOOGLE_RESPONSE_INVALID
REFRESH_FAILED
UNAUTHORIZED
METHOD_NOT_ALLOWED
INVALID_PAYLOAD
KV_READ_FAILED
KV_WRITE_FAILED
INTERNAL_ERROR
```

Rules:

- public errors should be user-safe
- admin errors may be more specific but still safe
- provider failures should be logged safely
- widget should render a fallback instead of crashing
- missing reviews should not break the host page

---

# 19. Logging Rules

Log:

- scheduled refresh started/completed
- place refresh success/failure
- manual refresh success/failure
- Google provider failure
- KV read/write failure
- invalid admin authorization attempt without token value

Do not log:

- Google API key
- admin refresh token
- full Authorization header
- sensitive customer secrets
- raw provider responses unless explicitly safe and needed in development

---

# 20. Dependency Rules

Do not add dependencies casually.

Before adding a dependency, confirm:

- browser/Worker platform cannot reasonably solve the problem
- dependency is maintained
- dependency works in Cloudflare Worker/browser context as needed
- dependency does not bloat the widget
- dependency does not complicate deployment
- dependency does not create a second architecture

Prefer plain TypeScript/JavaScript for v1.

If a dependency is added, explain why in the work summary and document meaningful architectural impact in `DECISIONS.md`.

---

# 21. Testing and Verification Rules

Use the smallest relevant verification available.

Recommended verification targets:

- config parsing
- response envelope helpers
- KV key helpers
- review normalization
- place registry parsing
- public reviews endpoint
- manual refresh auth
- Google provider error normalization
- widget config parser
- display mode rendering
- modal behavior
- carousel behavior

Manual smoke tests:

- load widget on static HTML page
- test flyout
- test inline grid
- test inline carousel
- test CTA
- test Read More modal
- test mobile viewport
- test missing reviews response
- test manual refresh endpoint

Do not claim tests passed if they were not run.

---

# 22. Git and Agent Workflow

Before work:

```bash
git status
```

If there are existing user changes, do not overwrite them.

Preferred workflow:

```bash
git pull
git checkout -b feature/short-description
# make changes
git status
# run checks
git add .
git commit -m "Short clear message"
git push
```

Do not use destructive commands such as:

```bash
git reset --hard
git clean -fd
git checkout -- .
```

unless explicitly instructed.

---

# 23. Documentation Update Rules

Update documentation when changing:

- endpoint paths
- response shapes
- KV key patterns
- place registry format
- Google API strategy
- refresh cadence
- manual refresh behavior
- widget embed attributes
- display modes
- theme system
- deployment bindings
- required secrets
- future SaaS direction

Update:

- `ARCHITECTURE.md` for current system facts
- `DECISIONS.md` for major choices
- `PROJECT_RULES.md` for repo-specific rules
- `IMPLEMENTATION_PLAN.md` when build phases change
- `README.md` for usage/setup instructions

---

# 24. Definition of Done

A task is done when:

- the change matches the request
- code is in the correct layer
- public widget behavior remains lightweight
- secrets are not exposed
- public requests do not call Google
- external input is validated
- errors use safe response shapes
- CSS remains scoped to the widget
- accessibility is considered where relevant
- relevant checks were run or honestly reported
- docs were updated if architecture or rules changed

---

# 25. Agent Work Summary Format

At the end of a coding task, summarize:

```text
Summary:
- Changed ...
- Added ...
- Updated ...

Verification:
- Ran ...
- Not run: ... because ...

Docs:
- Updated ...
- Not updated because ...

Notes:
- Assumptions ...
- Risks ...
- Follow-up ...
```

Mention important files changed.

Mention whether API, storage, refresh, widget rendering, security, deployment, or documentation behavior was affected.

---

# Final Rule

Keep the Reviews Widget focused.

v1 is a fast, embeddable, Cloudflare-hosted review widget for client sites. It is not yet a customer dashboard, billing platform, account system, or full SaaS app.

Build the durable foundation, but do not build the future before it is needed.
