## Why the old image keeps flashing

In both `src/routes/index.tsx` and `src/components/home/HomeSelection.tsx` the Hero uses:

```ts
const bgUrl = data?.url ?? heroBg;
```

`heroBg` is the bundled `@/assets/hero-bg.png` import. Because the server function is fetched on mount (no SSR cache, `staleTime: 0`), `data` is `undefined` on the first render, so the browser paints `hero-bg.png` first — then swaps to the random signed URL when the query resolves. The PNG also gets bundled and preloaded by Vite as a static asset, adding download weight even when it's never the final image.

## Plan

1. **`src/routes/index.tsx`**
   - Remove `import heroBg from "@/assets/hero-bg.png"`.
   - Change `const bgUrl = data?.url ?? heroBg;` to use only the fetched URL.
   - Only render the background `<div>` when `data?.url` exists (no placeholder paint).
   - Keep the existing 500ms opacity transition so the image fades in once loaded.

2. **`src/components/home/HomeSelection.tsx`**
   - Same three changes as above.

3. **No deletion of `src/assets/hero-bg.png`** — leaving the file on disk is harmless and avoids breaking any other reference. Once the imports are removed, Vite won't bundle or preload it.

4. **Out of scope**: changing the server function, caching strategy, overlay, or any other section.

## Result

On every visit the hero area stays transparent (page background only) for the brief moment the signed URL is being fetched, then the random background fades in. The old `hero-bg.png` never loads or paints.