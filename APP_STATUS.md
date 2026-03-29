# RTO Beats App Status

Last updated: 2026-03-23

## Project Snapshot
- Framework: Next.js (App Router) + TypeScript + Tailwind CSS
- Current mode: Bandcamp + YouTube content site (no webstore backend)
- Main page: `app/page.tsx`
- Visual style: dark themed hero + discography cards + YouTube section

## Current Features
- Bandcamp discography fetch via API route:
  - `GET /api/bandcamp`
  - Scrapes `https://rtobeats.bandcamp.com/music`
  - Falls back to static releases if Bandcamp scraping fails
- YouTube feed fetch via API route:
  - `GET /api/youtube`
  - Uses YouTube Data API key if available
  - Falls back to RSS parsing, then local fallback cards
- Homepage sections:
  - Hero with spotlight visuals and Bandcamp embed player
  - Discography cards sourced from `/api/bandcamp`
  - YouTube cards sourced from `/api/youtube`

## Key Files
- `app/page.tsx` — full landing page UI and client-side data fetching
- `app/api/bandcamp/route.ts` — Bandcamp scraper API
- `app/api/youtube/route.ts` — YouTube API/RSS fallback route
- `next.config.ts` — remote image host config for Bandcamp and YouTube thumbnails

## Environment Notes
- Optional: `YOUTUBE_API_KEY` for improved YouTube fetch reliability
- Dev run:
  - `npm run dev`
- Lint:
  - `npm run lint`

## Known Notes
- Bandcamp scraping depends on Bandcamp HTML structure and can break if Bandcamp changes markup.
- Some image links from external services may become unavailable over time.

## Next Implementation Queue
- [ ] Add sections/features requested next
- [ ] Stabilize release ordering and featured release selection
- [ ] Improve error/loading states in UI

## Change Log
### 2026-03-23
- Restored app to pre-webstore implementation.
- Re-enabled Bandcamp API flow and YouTube API flow.
- Rewired homepage to use Bandcamp discography and YouTube feed again.
- Changed primary font color from white (`text-slate-100`/`text-slate-50`) to gold (`#f5c46b`) across `app/page.tsx`.

---

## Update Policy
This file is intended to be updated on each implementation step. Add one bullet under **Change Log** with:
- What changed
- Which file(s) changed
- Why it changed
