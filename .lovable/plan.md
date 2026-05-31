# Random Hero Background from "Backgrounds" Collection

## Goal
On every visit to `/`, the hero section background is a random image pulled from the master media library's "Backgrounds" collection.

## Approach

### 1. New public server function — `getRandomHeroBackground`
Add to `src/lib/media.functions.ts`. **No auth middleware** (the hero is public).

- Look up the master-scope collection named `Backgrounds` (case-insensitive) in `media_collections`.
- Join `media_collection_items` → `media_assets` filtered to `scope='master'`, `upload_status='ready'`, and `mime_type LIKE 'image/%'`.
- Pick one row at random in SQL (`ORDER BY random() LIMIT 1`) via `supabaseAdmin`.
- Create a 1-hour signed URL from the asset's `storage_bucket` / `storage_path`.
- Return `{ url, width, height, assetId } | { url: null }` (null when collection missing or empty so the client falls back).

Returning a single random pick (vs. a full list) keeps payload tiny, avoids leaking the whole library, and stays serializer-friendly.

### 2. Wire into the Hero
In `src/routes/index.tsx` (`Hero()` function ~line 112) and the parallel `src/components/home/HomeSelection.tsx` (`Hero()` ~line 52):

- Import `useServerFn` + `useQuery` and the new server fn.
- `const { data } = useQuery({ queryKey: ['heroBg', mountKey], queryFn: () => getRandomHeroBgFn(), staleTime: 0, gcTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: false })` where `mountKey = useMemo(() => Math.random(), [])` so each fresh mount gets a new random image even if the query cache survived.
- `const bgUrl = data?.url ?? heroBg` (keep existing local `heroBg` import as the fallback for first paint / empty collection / fetch error).
- Apply via the existing `style={{ backgroundImage: \`url(${bgUrl})\` }}` — no markup changes.
- Optional polish: a tiny fade-in (`transition-opacity`, `opacity-0` → `opacity-100` once `data?.url` resolves) so the swap is not jarring. Keep the existing dark overlay untouched.

### 3. No DB migration, no RLS changes
The function uses `supabaseAdmin` so it bypasses RLS — safe because it only returns a single ephemeral signed URL for an asset the admin already curated into the public "Backgrounds" collection.

## Edge cases handled
- No "Backgrounds" collection → return `{ url: null }`, hero falls back to bundled `heroBg`.
- Empty collection → same fallback.
- Signed URL error → caught, fallback.
- Server fn error → React Query error swallowed, fallback applies.

## Out of scope
- Preloading the next random image, image optimization/resize, no CMS UI for picking weights — the collection itself is the curation surface.
- No changes to MediaHub, auth, or storage policies.
