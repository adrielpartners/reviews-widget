# Reviews Widget

A lightweight, Cloudflare-native embeddable Google Reviews widget.

**Runtime:** `https://reviews.marketinghero.net`

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build the widget browser script
npm run build:widget

# 3. Set up local secrets
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your Google Places API key

# 4. Run locally
npm run dev
```

Visit `examples/test-all-modes.html` in a browser to test all display modes.

## Deployment

```bash
# 1. Build widget
npm run build:widget

# 2. Create KV namespace
wrangler kv:namespace create REVIEWS_KV
# Paste the IDs into wrangler.toml

# 3. Set secrets
wrangler secret put GOOGLE_PLACES_API_KEY
wrangler secret put ADMIN_REFRESH_TOKEN

# 4. Deploy
npm run deploy

# 5. Configure route in Cloudflare dashboard:
#    reviews.marketinghero.net/* -> reviews-widget worker
```

## Required Cloudflare Resources

| Resource | Binding/Name | Purpose |
|---|---|---|
| KV Namespace | `REVIEWS_KV` | Review cache + place registry |
| Secret | `GOOGLE_PLACES_API_KEY` | Google Places API auth |
| Secret | `ADMIN_REFRESH_TOKEN` | Manual refresh endpoint auth |
| Cron Trigger | `0 8 * * *` | Daily refresh at 08:00 UTC |
| Route | `reviews.marketinghero.net/*` | Worker route |

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Health check |
| GET | `/api/reviews?placeId=...` | None | Cached review data (KV only) |
| GET | `/widget.js` | None | Embeddable widget script |
| POST | `/api/admin/refresh-place` | Bearer | Manual refresh |

## Embed Code

```html
<script
  src="https://reviews.marketinghero.net/widget.js"
  data-place-id="YOUR_GOOGLE_PLACE_ID"
  data-mode="inline"
  data-layout="grid"
  data-theme="modern"
  data-max-reviews="3"
  data-cta-text="See all reviews"
  data-cta-url="https://google.com/maps">
</script>
```

## Configuration Attributes

| Attribute | Default | Description |
|---|---|---|
| `data-place-id` | *(required)* | Google Place ID |
| `data-mode` | `inline` | `inline` or `flyout` |
| `data-layout` | `grid` | `grid` or `carousel` |
| `data-theme` | `default` | `default`, `modern`, `professional`, `pastel` |
| `data-position` | `bottom-right` | Flyout position: `bottom-right`, `bottom-center`, `bottom-left` |
| `data-max-reviews` | `3` | Max reviews shown (1–50) |
| `data-cta-text` | — | CTA button text |
| `data-cta-url` | — | CTA button URL (http/https only) |
| `data-mount` | — | Custom mount selector (`#id` or `.class`) |
| `data-custom-class` | — | Additional class on widget root |

## Display Modes

### Inline Grid
Reviews displayed in a responsive grid at the script insertion point.

### Inline Carousel
Reviews in a single-card carousel with arrow controls, dots, auto-rotation (5s), keyboard nav, pause on hover/tab-hidden. Respects `prefers-reduced-motion`.

### Flyout
Fixed-position floating widget. Shows summary bar (rating + count) that expands into a review panel on click. Supports personalization cookie, auto-rotation, keyboard nav.

## Themes

Four built-in themes using CSS custom properties:
- **default** — Clean white background
- **modern** — Dark slate background
- **professional** — Light gray, subtle styling
- **pastel** — Warm cream background

Override any token via `.rw-root { --rw-color-bg: #your-color; }` or use `data-custom-class`.

## KV Key Patterns

| Key | Purpose | TTL |
|---|---|---|
| `REVIEWS:<placeId>` | Normalized review cache | 24h |
| `PLACE:<placeId>` | Per-place metadata | — |
| `PLACES:ACTIVE` | Global active registry | — |
| `REFRESH_LOG:<placeId>` | Last refresh status | 7d |

## Manual Refresh

```bash
curl -X POST https://reviews.marketinghero.net/api/admin/refresh-place \
  -H "Authorization: Bearer <ADMIN_REFRESH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"placeId": "YOUR_PLACE_ID"}'
```

## Architecture

See `/docs` — especially [ARCHITECTURE.md](docs/reviews-widget_ARCHITECTURE.md) and [IMPLEMENTATION_PLAN.md](docs/reviews-widget_IMPLEMENTATION_PLAN.md).

## Repository Structure

```
reviews-widget/
  assets/            # Built widget.js + widget.css
  docs/              # Architecture, rules, plans
  examples/          # Test HTML pages
  scripts/           # Build scripts
  src/
    generated/       # Auto-generated (build output)
    lib/             # Shared Worker utilities
    providers/       # Google Places API adapter
    routes/          # Worker route handlers
    services/        # Business logic
    storage/         # KV access layer
    types/           # Shared TypeScript types
    widget/          # Browser-side widget JS (vanilla)
    worker.ts        # Worker entrypoint
```

## Known Limitations (v1)

- No admin dashboard — places managed via KV/Wrangler
- Single Google Places API key (platform-owned)
- No real-time refresh — reviews cached for up to 24h
- Manual refresh requires bearer token
- No billing or user accounts

## SaaS Path

Future versions may add:
- Customer dashboard
- Per-client API keys
- Google Business Profile OAuth
- Billing/subscriptions
- Widget analytics
- Multi-source review aggregation

## License

Proprietary — Adriel Partners / Marketing Hero
