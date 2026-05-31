## What's actually wrong

Three compounding problems explain why the user still sees solid black:

1. **The image isn't in the initial HTML.** The current code only fetches the URL list *after* React mounts on the client. So the browser parses the page, hydrates, runs a query, picks a URL, *then* starts downloading the image. The black gap is the entire critical path.
2. **The signed URLs serve the original, full-size images** — likely multi-MB PNGs from the `master-media` bucket. Even from cache, the first byte takes a while.
3. **The hero section background is `bg-background` (near-black in this theme).** While the image is downloading, that's what the user stares at.

Cached `sessionStorage` lists don't help the very first paint, and `new Image()` warming only runs *after* the first fetch — too late.

## The fix

### 1. SSR-pick the image in the route loader
`src/routes/index.tsx`

- Add a loader that calls `getHeroBackgroundList` via `queryClient.ensureQueryData` (50 min staleTime) and returns a single `heroBgUrl` chosen randomly at loader time.
- Loader runs on the server for the initial HTML and on the client for subsequent navigations. The URL is serialized into the page, so the `<img>` tag ships in the initial HTML — the browser starts downloading during HTML parse. No client roundtrip needed before the image starts loading.
- Random rotation still happens: the loader re-runs (and re-picks) on each navigation to `/`.

### 2. Preload link with high priority
Same route's `head()`:

```ts
head: ({ loaderData }) => ({
  links: loaderData?.heroBgUrl
    ? [{ rel: "preload", as: "image", href: loaderData.heroBgUrl, fetchpriority: "high" }]
    : [],
  meta: [...existing meta...],
})
```

This tells the browser to start downloading the hero image with the highest network priority, before stylesheets, before JS — the absolute first request after the HTML itself.

### 3. Shrink the image at the edge
`src/lib/media.functions.ts` — pass Supabase Storage image transforms to `createSignedUrl`:

```ts
.createSignedUrl(a.storage_path, 3600, {
  transform: { width: 1920, quality: 75, resize: "cover" },
})
```

A 5 MB PNG becomes a ~150–300 KB WebP. This alone roughly cuts the visible delay by 10–20×.

### 4. Soft fallback background, not black
In both Hero components, change the section's background from `bg-background` to a subtle brand gradient (`bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900` or a token-based equivalent). The user sees a soft dark tone for the brief moment before paint instead of an abrupt black rectangle.

### 5. Drop the opacity-0 → opacity-100 fade
With the image preloaded and in initial HTML, it's almost always painted on the first frame. The fade-in was actively making the gap *more* noticeable. Render the `<img>` at full opacity from the start.

### 6. Wire `HomeSelection` to the same loader data
Pass `heroBgUrl` from `HomePage` into `<HomeSelection initialBgUrl={...} />` so the selection-variant hero uses the same SSR-picked URL. No duplicate fetch, no duplicate randomness.

## Result

- Initial HTML contains both `<link rel="preload" ... fetchpriority="high">` and `<img src=...>`.
- The image is now ~200 KB WebP instead of multi-MB PNG.
- The browser starts the download as the *first* network request after the HTML, in parallel with JS.
- Background behind the loading image is a brand gradient, not black.
- Random rotation still happens on every visit to `/`.

## Out of scope

- No DB / RLS / bucket changes.
- No removal of the `getHeroBackgroundList` server function or the `sessionStorage` cache (the cache still helps client-side navigations).
- No image regeneration in the MediaHub.