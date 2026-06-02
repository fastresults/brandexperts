## Goal

On `/dashboard/companion`, give every one of the 15 deliverables its own inline upload dropzone. Files dropped or picked there upload directly into the attendee's Media Hub (`user-media` bucket, scope = `user`) and are tagged so they can be found later both on the deliverable card and in `/dashboard/media`.

## Current state

- `dashboard.companion.tsx` renders the 15 deliverables inside 6 collapsible blocks. Each deliverable today is just a check-toggle button stored in `localStorage` — no upload.
- The Media Hub already has a working upload pipeline via `createSignedUploadUrl` + `finalizeUpload` (see `src/lib/media.functions.ts`) and `MediaHub` on `/dashboard/media` reads via `listMedia`.
- `media_assets` rows support `tags: text[]`, and there is already an `updateAsset` server function that accepts `tags` — so we can stamp each upload with a deliverable tag without any DB migration.

## Plan

### 1. New small component: `DeliverableDropzone`

New file: `src/components/companion/DeliverableDropzone.tsx`.

Props:
```ts
{ deliverableKey: string; deliverableLabel: string; group: string }
```

Behavior:
- Renders a compact dashed drop area + hidden `<input type="file" multiple>` + "Upload" button + small list of files already uploaded for this deliverable.
- Uses `useAuth()` to get the current `user.id`.
- Drag-over / drop and click-to-pick both call one `uploadFiles(files)` helper.
- For each file:
  1. `createSignedUploadUrl({ scope: "user", ownerUserId: user.id, filename, mimeType, sizeBytes })`
  2. `PUT` the file bytes to `uploadUrl`
  3. `finalizeUpload({ assetId })`
  4. `updateAsset({ id: assetId, tags: ["deliverable:<key>", "block:<n>", group] })` to stamp the deliverable.
- 100 MB per-file cap (mirrors `MediaHub`), `toast.success` / `toast.error` per file.
- After upload, invalidate the query below and (optionally) auto-check the deliverable as "delivered".

### 2. Per-deliverable file list

In the same component, run a query keyed by deliverable:
```ts
useQuery({
  queryKey: ["companion-deliverable-files", deliverableKey, userId],
  queryFn: () => listMedia({ data: { scope: "user", ownerUserId: userId, search: null, mediaType: null } })
})
```
Filter the returned assets client-side to those whose `tags` include `deliverable:<key>`. Show: filename, size, "Open" (uses `getAssetSignedUrl`), "Remove" (uses `deleteAsset`). Keep the list to ~5 visible with "view all in Media Hub" link to `/dashboard/media`.

(Client-side filter is fine because `listMedia` already scopes by user — typical attendee will have well under the 1000-row Supabase default.)

### 3. Wire into `dashboard.companion.tsx`

Inside the existing `blockDeliverables.map(...)` render, below the current checkbox button, mount:
```tsx
<DeliverableDropzone
  deliverableKey={d.key}
  deliverableLabel={d.label}
  group={d.group}
/>
```
No changes to the block layout, header, pre-work section, or weekly cadence card.

### 4. Auto-tick on first upload (small UX win)

When the dropzone successfully uploads at least one file and the deliverable is not yet checked, call the existing `toggleDelivered(d.key)` (lift `delivered`/`toggleDelivered` access into the dropzone via a callback prop). Manual uncheck still works.

### 5. Out of scope

- No DB migration. `tags` already exists on `media_assets`, RLS already restricts to `auth.uid() = owner_user_id`, and `user-media` bucket is in place.
- No changes to the Media Hub UI itself — files uploaded from `companion` show up there automatically, filterable by the `deliverable:<key>` tag.
- No backend route changes; we reuse `createSignedUploadUrl`, `finalizeUpload`, `updateAsset`, `listMedia`, `getAssetSignedUrl`, `deleteAsset`.

## Technical notes

- Drop handler must call `e.preventDefault()` on both `dragover` and `drop`, and only react when `e.dataTransfer.types.includes("Files")`.
- All server fn calls go through `useServerFn(...)` so `attachSupabaseAuth` provides the bearer.
- Tag stamping happens after `finalizeUpload` (not in the insert) because `createSignedUploadUrl` doesn't accept `tags`; this keeps the change zero-migration. If we later want it atomic, we can extend `UploadInput` with an optional `tags` array — flagged but not in this plan.

## Files touched

- **new** `src/components/companion/DeliverableDropzone.tsx`
- **edit** `src/routes/_authenticated/dashboard.companion.tsx` (mount the dropzone under each deliverable; pass `toggleDelivered`)
