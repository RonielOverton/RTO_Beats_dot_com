# RTO Beats App Status

Last updated: 2026-03-29

## Project Snapshot
- Framework: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- CMS: Sanity v5 (schema authoring + `@sanity/client` for data fetching)
- Design: dark premium theme — Bebas Neue headings, Manrope body, amber/cyan accent palette
- Build: ✅ 15/15 pages, zero errors

---

## Architecture

```
app/
  page.tsx                  — Homepage (Hero, Bio, FeaturedWork, CTA, YouTube)
  albums/
    page.tsx                — Albums index — Sanity-driven, SanityAlbumCard grid
    [slug]/page.tsx         — Album detail — Sanity-driven, full layout
  store/
    page.tsx                — Store index — local catalog data
    [slug]/page.tsx         — Store item detail — local catalog data
  cart/page.tsx             — Cart page
  api/
    youtube/route.ts        — YouTube feed (API key or RSS fallback)

components/site/
  albums/
    AlbumCard.tsx           — Reusable card with explicit flat props
    SanityAlbumCard.tsx     — Thin adapter: SanityAlbumListItem → AlbumCard
  Header.tsx / Footer.tsx
  Hero.tsx / BioSection.tsx / CtaSection.tsx
  FeaturedWorkSection.tsx   — Still reads from local lib/catalog.ts
  YoutubeSection.tsx        — Client component, fetches /api/youtube

sanity/
  schemaTypes/
    documents/album.ts      — Album document type (4 field groups)
    objects/
      track.ts / credit.ts / streamingLinks.ts
  lib/
    client.ts               — sanityFetch helper (conditional on isSanityConfigured)
    queries.ts              — allAlbumsQuery, allAlbumSlugsQuery, albumBySlugQuery
    types.ts                — SanityAlbumListItem, SanityAlbumDetail + sub-types
  env.ts                    — Env var reading, isSanityConfigured, assertSanityEnv

data/
  albums.ts                 — ⏳ Legacy local album data (FeaturedWorkSection still reads this)
  store.ts / site.ts        — Local store and site config data

lib/
  catalog.ts                — Local query helpers (getAlbumBySlug etc.) — partially still in use
  seo.ts / utils.ts
```

---

## Current Features

### Homepage
- Hero with Spotlight visual effect
- Bio section
- FeaturedWorkSection (reads local `data/albums.ts` — not yet Sanity-driven)
- CTA section
- YoutubeSection — fetches `/api/youtube` on mount, renders 3 latest video cards

### YouTube API (`/api/youtube`)
- Uses `YOUTUBE_API_KEY` if set
- Falls back to RSS scraping from YouTube channel feed
- Falls back to local static cards

### Albums (`/albums` + `/albums/[slug]`)
- **Index page**: fully Sanity-driven — `allAlbumsQuery`, renders `SanityAlbumCard` grid
- **Detail page**: fully Sanity-driven — `albumBySlugQuery` by slug, renders full layout:
  - Cover image + hero metadata
  - Release date + status badge (Released / Upcoming / Draft)
  - Genre tags, featured artists
  - Full description
  - Tracklist with track numbers, featuring credits, durations
  - Streaming links (Spotify, Apple Music, YouTube, SoundCloud, Bandcamp)
  - Credits grid (name + role)
  - Gallery image grid
  - Bandcamp embed player (if `bandcampEmbedCode` set in Sanity)
- Both pages guard on `isSanityConfigured` and render a setup banner if env vars are absent
- `generateStaticParams` pulls slugs from Sanity when configured
- `generateMetadata` outputs title, description, canonical, OpenGraph image
- JSON-LD `MusicAlbum` schema via `StructuredData`

### Store (`/store` + `/store/[slug]`)
- Still reads from local `data/store.ts` — Sanity not yet wired

### Cart
- CartProvider with React context + localStorage persistence

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes (for Sanity) | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes (for Sanity) | Dataset name (default: `production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Yes (for Sanity) | API version (default: `2026-03-29`) |
| `SANITY_API_READ_TOKEN` | Optional | For draft/private content |
| `SANITY_API_WRITE_TOKEN` | Optional | Required for local import scripts that create/update Sanity docs |
| `YOUTUBE_API_KEY` | Optional | Improves YouTube feed reliability |

Copy `.env.example` → `.env.local` and fill in `NEXT_PUBLIC_SANITY_PROJECT_ID` to enable live Sanity data.

---

## Pending Work

- [x] **FeaturedAlbumsSection** — Sanity-powered, replaces local `FeaturedWorkSection` on homepage
- [ ] **Store pages** — wire `/store` and `/store/[slug]` to Sanity product queries (schema foundation now added)
- [ ] **Sanity Studio** — set up Studio UI at `/studio` route or standalone
- [ ] **ESLint** — install as dev dependency (recurring build warning)
- [ ] **`.env.local`** — populate with actual Sanity project ID from sanity.io dashboard

---

## Change Log

### 2026-03-29 — Store now surfaces Sanity albums for purchase flow
- Updated `app/store/page.tsx` to merge Sanity albums into the store catalog so imported albums are listed in `/store`
- Updated `app/store/[slug]/page.tsx` to resolve slug pages from either local products or Sanity albums
- Added `lib/store-mappers.ts` to map Sanity album docs into the existing `StoreItem` shape
- Updated `sanity/lib/queries/albums.ts` to include `bandcampUrl` in album list projections used by the store
- Updated `types/content.ts` to allow `out-of-stock` in store item stock status union
- Added purchase UX for Sanity album entries: product detail now shows **Buy on Bandcamp** when an external checkout URL exists
- Why: imported albums were visible on album pages but not purchasable from the store experience

### 2026-03-29 — Bandcamp album importer command
- Added `scripts/import-bandcamp-albums.mjs` to import existing Bandcamp album pages into Sanity `album` documents
- Added npm script `import:bandcamp` in `package.json`
- Importer maps title, slug, cover image (uploads to Sanity assets), release date, description, genre, tracks, and Bandcamp link fields
- Added `--dry-run` and `--update` flags for safer workflows
- Updated `README.md` with usage instructions and required env vars
- Why: lets you bootstrap older releases from Bandcamp without manually filling every Studio field

### 2026-03-29 — Sanity env validation hardening
- Updated `sanity/env.ts` to validate `NEXT_PUBLIC_SANITY_PROJECT_ID` format (`a-z`, `0-9`, `-` only)
- Added `invalidSanityEnvVars` tracking and included it in `isSanityConfigured`
- `assertSanityEnv()` now throws a clear error for invalid project IDs, not just missing vars
- Prevents Next.js runtime 500s when placeholder IDs like `your_project_id_here` are present; app now falls back gracefully to setup states

### 2026-03-29 — Local Studio env setup
- Updated `.env.local` with required Sanity variables:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION`
  - `SANITY_API_READ_TOKEN`
- Existing local variables for Stripe/YouTube/Admin were preserved
- Next step: replace placeholder project ID with real Sanity project ID and restart Studio

### 2026-03-29 — Album system production refactor
- Refactored repeated album UI logic into shared utilities: `components/site/albums/album-utils.ts`
  - shared status badge metadata
  - shared date formatter with invalid-date fallback
  - shared fallback image + blur placeholder constants
  - shared portable-text paragraph extraction and album summary helper
- Extracted album detail presentation out of the route into `components/site/albums/AlbumDetailView.tsx` for cleaner page/data separation
- Extracted setup/empty states into `components/site/albums/AlbumStates.tsx`
- Improved naming consistency in album types:
  - added `SanityAlbumBase`
  - added `SanityStreamingPlatform`
  - reused these through `SanityAlbumListItem` and `SanityAlbumDetail`
- Improved maintainability of album GROQ queries in `sanity/lib/queries/albums.ts`
  - split into `albumBaseFields`, `albumDetailFields`, and shared ordering constant
- Accessibility improvements:
  - added explicit `aria-label`s for album card links, back navigation, and streaming links
  - used list semantics for genre chips on the detail page
  - preserved focus-visible states on interactive elements
- Image handling improvements:
  - centralized fallback image and blur placeholder values
  - added blur placeholders to album detail hero and gallery images
  - centralized alt text fallback logic
- SEO improvements for album pages:
  - added canonical + Open Graph data to `/albums`
  - expanded album detail metadata with Twitter cards and `robots.noindex` for draft albums
- Build verified after refactor: Next.js build passes (15/15 pages)

### 2026-03-29 — Album UX polish
- Added loading states for album routes:
  - `app/albums/loading.tsx`
  - `app/albums/[slug]/loading.tsx`
- Added reusable `components/site/albums/AlbumCardSkeleton.tsx` for a polished index-page skeleton grid
- Added route-specific invalid slug experience with `app/albums/[slug]/not-found.tsx`
- Upgraded `app/albums/page.tsx` empty/setup states with clearer copy and a more polished layout
- Improved `app/albums/[slug]/page.tsx` graceful fallbacks:
  - cover and gallery image fallbacks retained
  - missing rich description now falls back to short description or a safe default
  - optional sections remain hidden cleanly when data is absent
- Fixed album rich-text handling by typing and rendering portable text paragraphs from Sanity instead of treating `fullDescription` like a plain string
- Added shared portable-text types to `sanity/lib/types/shared.ts` and exported them through the type barrels

### 2026-03-29 — Future-ready store architecture foundation
- Refactored Sanity data layer into domain modules while keeping backward compatibility:
  - Added `sanity/lib/queries/albums.ts`, `sanity/lib/queries/products.ts`, `sanity/lib/queries/fragments.ts`, `sanity/lib/queries/index.ts`
  - Added `sanity/lib/types/albums.ts`, `sanity/lib/types/products.ts`, `sanity/lib/types/shared.ts`, `sanity/lib/types/index.ts`
  - Kept `sanity/lib/queries.ts` and `sanity/lib/types.ts` as compatibility barrels so existing imports continue to work
- Expanded `sanity/lib/index.ts` exports for both albums and products
- Added future store schema foundation:
  - `sanity/schemaTypes/documents/product.ts` (supports merch, beats, plugins, digital products)
  - `sanity/schemaTypes/objects/productPrice.ts`
  - `sanity/schemaTypes/objects/checkoutLinks.ts`
  - Registered new schema types in `sanity/schemaTypes/documents/index.ts`, `sanity/schemaTypes/objects/index.ts`, and `sanity/schemaTypes/index.ts`
- Build verified after refactor: Next.js build passes (15/15 pages)

### 2026-03-29 — GROQ query refactor
### 2026-03-29 — Sanity Studio album editing UX improvements
- Upgraded `sanity/schemaTypes/documents/album.ts` for easier single-person editing workflows
- Added document-level `initialValue` defaults: `status: draft`, `featured: false`, `releaseDate: today`
- Strengthened field guidance with richer descriptions across editorial/music/links/media groups
- Kept slug auto-generation from title and added explicit `slugify` normalization for cleaner URLs
- Added/expanded validation: shortDescription length guidance, genre uniqueness, featuredArtists uniqueness, Bandcamp embed source check
- Improved image accessibility support by enforcing/encouraging alt text on cover and gallery images
- Expanded Studio sorting options: newest, oldest, featured-first, title A-Z
- Enhanced Studio preview subtitle to include status, year, and featured flag
- Improved reusable object schemas:
  - `track.ts`: better descriptions + strict `mm:ss` validation
  - `credit.ts`: clearer field guidance + default role
  - `streamingLinks.ts`: per-platform helper descriptions + object description

### 2026-03-29 — FeaturedAlbumsSection
- Created `components/site/FeaturedAlbumsSection.tsx` — async server component, Sanity-driven
- Fetches `featuredAlbumsQuery` with `{ limit: 6 }`, renders `SanityAlbumCard` grid (1→2→3 cols)
- Section hides entirely when no featured albums exist (`return null`)
- Ambient amber radial gradient background for cinematic feel
- "View all albums →" link with animated arrow icon
- Updated `app/page.tsx` to use `FeaturedAlbumsSection` in place of `FeaturedWorkSection`
- `FeaturedWorkSection.tsx` retained for future store drops section
- Rewrote `sanity/lib/queries.ts` with section comments and shared field fragments
- Extracted `coverImageFields` and `albumListFields` fragments — DRY across queries
- Added `featuredAlbumsQuery` (NEW) — filters `featured == true`, accepts `$limit` param, returns list shape for `SanityAlbumCard`
- Improved `albumBySlugQuery` gallery alt: `coalesce(alt, "Gallery image")` instead of nullable
- All 4 queries: `allAlbumSlugsQuery`, `allAlbumsQuery`, `albumBySlugQuery`, `featuredAlbumsQuery`

### 2026-03-29
- Rewrote `/albums/[slug]` detail page — now fully Sanity-driven via `albumBySlugQuery`
- Added `SanityAlbumDetail` type + sub-types (`SanityTrack`, `SanityCredit`, `SanityStreamingLinks`, `SanityGalleryImage`) to `sanity/lib/types.ts`
- Added `allAlbumSlugsQuery` to `sanity/lib/queries.ts` for `generateStaticParams`
- Created `components/site/albums/AlbumCard.tsx` — reusable card with explicit flat props, status badge, hover glow, blur placeholder, arrow CTA
- Refactored `SanityAlbumCard.tsx` to a thin adapter over `AlbumCard`
- Detail page sections: hero, tracklist, credits grid, photo gallery, Bandcamp embed — all optional/gracefully hidden when data absent
- SEO: `generateMetadata` with OG image, JSON-LD `MusicAlbum` schema

### 2026-03-27 – 2026-03-28
- Built albums index page (`/albums`) — Sanity-driven with `allAlbumsQuery`
- Created `SanityAlbumCard` component with premium dark design and status badges
- Added `cdn.sanity.io` to `next.config.ts` `remotePatterns`
- Set up Sanity frontend client (`@sanity/client` + `groq`) — `.env.example`, `sanity/env.ts`, `sanity/lib/client.ts`, `sanity/lib/queries.ts`
- Resolved build crash when Sanity env vars absent: `isSanityConfigured` guard, conditional `createClient`
- Sanity schema: `album` document + `track`, `credit`, `streamingLinks` object types
- Pushed 53 files to GitHub (`hero` branch) — remote: `https://github.com/RonielOverton/RTO_Beats_dot_com.git`

### 2026-03-25 – 2026-03-26
- Full architectural refactor: typed content models, data catalogs (`data/albums.ts`, `data/store.ts`)
- Dynamic routes: `/albums/[slug]`, `/store/[slug]` with `generateStaticParams`
- Cart system: `CartProvider` + localStorage persistence
- Added `YoutubeSection` component — fetches `/api/youtube`, renders 3 latest video cards
- Removed `BandcampAPI` route; YouTube API route preserved
- Header, Footer, Hero, Bio, FeaturedWork, CTA sections created as modular components
- SEO utilities: `buildAlbumJsonLd`, `buildProductJsonLd`, `StructuredData` component

### 2026-03-23
- Restored app to pre-webstore implementation
- Re-enabled Bandcamp API flow and YouTube API flow
- Rewired homepage to use Bandcamp discography and YouTube feed
- Changed primary font color to gold (`#f5c46b`)

---

## Update Policy
Update this file on each implementation step. Add one entry under **Change Log** with: what changed, which files, and why.

