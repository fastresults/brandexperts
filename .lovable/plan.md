# Workshop materials don't open in new tab — root cause + durable fix

## Forensic trace

1. **UI** (`src/routes/_authenticated/dashboard.materials.tsx`) — "Open in new tab" is a clean `<a href="/materials/...pdf" target="_blank" rel="noreferrer">`. No JS handler, no router interception. The markup is correct.
2. **Files exist** — `public/materials/executive-brand-intensive-workbook.pdf` (34 KB) and `executive-brand-intensive-run-sheet.pdf` (42 KB) are both present in `public/`.
3. **Production custom domain** (`brandexperts.org`) — `curl` returns `200 application/pdf`. Works.
4. **Preview URL** (`id-preview--*.lovable.app`, where the user is testing) — `curl` returns:
   ```
   HTTP/2 302
   location: https://lovable.dev/auth-bridge?...&return_url=...workbook.pdf
   ```
   The Lovable **preview environment wraps every request — including static assets from `public/` — in an auth bridge**. When the user clicks "Open in new tab", the new tab opens the auth-bridge URL, not the PDF. Depending on session state / popup handling the result is a blank tab, a login screen, or a failed redirect loop. The Download button has the same problem but browsers often surface the redirect differently, so it may appear to "work" occasionally.

This is an environmental constraint, not a code bug — but the fix is straightforward: stop relying on `public/` for these PDFs.

## Durable fix: host the PDFs on Lovable Assets

Lovable Assets are served from `/__l5e/assets-v1/...` on a CDN that is **not** behind the preview auth wall. Same URL works identically in preview, published, and custom-domain environments — no 302, no login round-trip.

### Steps

1. **Upload both PDFs to the asset CDN** (sandbox CLI, reads existing files from `public/materials/`):
   ```bash
   mkdir -p src/assets
   lovable-assets create \
     --file public/materials/executive-brand-intensive-workbook.pdf \
     > src/assets/executive-brand-intensive-workbook.pdf.asset.json
   lovable-assets create \
     --file public/materials/executive-brand-intensive-run-sheet.pdf \
     > src/assets/executive-brand-intensive-run-sheet.pdf.asset.json
   ```

2. **Update `src/routes/_authenticated/dashboard.materials.tsx`** to import the asset pointers and use `asset.url` as the `href`:
   ```ts
   import workbookAsset from "@/assets/executive-brand-intensive-workbook.pdf.asset.json";
   import runSheetAsset from "@/assets/executive-brand-intensive-run-sheet.pdf.asset.json";
   ```
   Replace each `href: "/materials/..."` with the corresponding `asset.url`. Keep the `download={filename}` attribute and the `target="_blank" rel="noreferrer"` on the open-in-new-tab anchor — both still work because CDN responses include `Content-Type: application/pdf`.

3. **Delete the originals** from the repo so they don't ship in the Worker bundle:
   ```bash
   rm public/materials/executive-brand-intensive-workbook.pdf
   rm public/materials/executive-brand-intensive-run-sheet.pdf
   rmdir public/materials
   ```

4. **Verify** in the preview: click "Open in new tab" for each card → PDF renders inline in the browser. Click "Download" → file saves with correct filename.

## Why not other approaches

- **Inline `<iframe>` viewer** — the iframe src would still hit the preview auth wall as a top-level-style navigation and could fail or flash a login redirect; doesn't solve the root cause.
- **Server route under `/api/public/materials/*`** — would work but adds an unnecessary handler and bundles the PDFs into the Worker. CDN is the right home for static binaries.
- **"It works in production"** — true, but the user (and any reviewer) tests in preview. Asset CDN makes preview and production behave identically.

## Files touched

- `src/routes/_authenticated/dashboard.materials.tsx` — swap `href` values to asset URLs.
- `src/assets/executive-brand-intensive-workbook.pdf.asset.json` — new pointer.
- `src/assets/executive-brand-intensive-run-sheet.pdf.asset.json` — new pointer.
- `public/materials/` — deleted.
