## Goal

Eliminate the black flash before the hero image appears, and make repeat visits feel instant by caching the signed URLs in the browser.

## Approach

Stop fetching one random URL on every mount. Instead, fetch the **full list of background URLs once**, cache it in `sessionStorage`, warm the browser image cache, and pick a random one synchronously on every mount.

## Changes

### 1. New server function — `getHeroBackgroundList`
`src/lib/media.functions.ts`

- Public (no auth), same Backgrounds-collection query as `getRandomHeroBackground`.
- Returns `{ urls: string[], expiresAt: number }` — array of 1-hour signed URLs, plus an `expiresAt` epoch (now + 55 minutes) so the client knows when to refetch.
- Keep the existing `getRandomHeroBackground` for now (delete in a later pass if unused).

### 2. New client helper — `src/lib/hero-bg-cache.ts`
- `loadCachedList()`: read `sessionStorage["heroBgList"]`, return it if `expiresAt > Date.now()`, otherwise `null`.
- `saveCachedList(list)`: write to `sessionStorage`.
- `warmImages(urls)`: for each URL, `const img = new Image(); img.src = url;` so the browser fetches and caches every background in the background.
- `pickRandom(urls)`: pure helper.
- All wrapped in `typeof window !== "undefined"` guards so SSR is safe.

### 3. Hero components — `src/routes/index.tsx` and `src/components/home/HomeSelection.tsx`

Replace the current `useQuery` + `useServerFn(getRandomHeroBackground)` block with:

```ts
const fetchList = useServerFn(getHeroBackgroundList);
const { data: list } = useQuery({
  queryKey: ["heroBgList"],
  queryFn: async () => {
    const cached = loadCachedList();
    if (cached) return cached;
    const fresh = await fetchList();
    saveCachedList(fresh);
    warmImages(fresh.urls);
    return fresh;
  },
  staleTime: 50 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});
const bgUrl = useMemo(
  () => (list?.urls.length ? pickRandom(list.urls) : null),
  [list],
);
```

- First visit in a session: one fetch, all images warmed in parallel; the picked one paints as fast as the network allows (the others are already on their way too).
- Every subsequent navigation within the session: synchronous read from `sessionStorage`, the chosen URL is already in HTTP cache → near-instant paint, no flash.
- The chosen image still rotates randomly per mount.

### 4. SSR-side priming (optional polish)
In the `/` route loader, call `context.queryClient.ensureQueryData({ queryKey: ["heroBgList"], queryFn: () => getHeroBackgroundList() })` so the very first server-rendered HTML ships with the URL list already in the React Query cache. The hero can then pick + render on the first paint with no client roundtrip.

### 5. Soft fade-in
Keep the current `transition-opacity duration-500` div. Add `opacity-0` until the chosen image's `onLoad` fires, then `opacity-100`. The hero section uses the site's normal background color underneath (matches the page) rather than solid black during the brief preload — no jarring flash.

## What this does NOT change

- The `Backgrounds` collection, the storage bucket, or any RLS / table.
- The overlay (still `bg-background/0`).
- The fact that `hero-bg.png` is no longer imported anywhere.

## Result

- First page load in a session: one network call, all backgrounds preloaded, hero fades in smoothly.
- Subsequent navigations/refreshes: instant — URL list is in `sessionStorage`, image bytes are in HTTP cache.
- Random rotation still happens on every mount.