# Why dragging desktop images onto "Backgrounds" does nothing

`MediaHub.tsx` has two completely separate drop paths:

1. **Internal drags** (existing asset cards → folder/collection chips in the sidebar). `dropOnCollection` / `dropOnFolder` parse a JSON `DragPayload` written by `handleDragStart`. If that JSON isn't present, they silently return.
2. **OS file drops** (files from your desktop → upload). Only the **empty-state** card (`assets.length === 0`) actually reads `e.dataTransfer.files` and calls `handleFiles(...)`. Nothing else does.

So when you drag images from your desktop onto the "Backgrounds" collection chip in the sidebar:
- `dropOnCollection` runs → `readPayload(e)` returns `null` (no internal JSON) → early return.
- No upload code path is reached. No toast, no error, no network request — silent no-op.

The empty-state drop zone only appears when the current view has zero assets, so as soon as Backgrounds (or the master library) has anything in it, even the working drop target disappears.

## Fix

Make every drop target detect OS files (`e.dataTransfer.files.length > 0`) and upload them, in addition to handling internal asset moves.

### Changes (all in `src/components/media/MediaHub.tsx`)

1. **Sidebar collection chips** — `dropOnCollection(e, collectionId)`:
   - If `e.dataTransfer.files.length > 0`: call `handleFiles(files)` to upload into the current scope/folder, then add each new asset to the target collection (reuse `toggleCollectionFn` with `action: "add"`).
   - Else fall through to existing internal-move logic.
   - Refactor `handleFiles` to return the created asset IDs so we can attach them to the collection.

2. **Sidebar folder chips** — `dropOnFolder(e, targetFolderId)`:
   - If `e.dataTransfer.files.length > 0`: upload directly into `targetFolderId` (temporarily override the `folderId` arg passed to the upload function, or accept an optional `folderIdOverride` on `handleFiles`).
   - Else existing internal-move logic.

3. **Main asset grid area** — wrap the grid/list container (not just the empty state) in an `onDragOver` / `onDrop` handler that uploads files into the currently selected folder. Keep visual affordance subtle (e.g. dashed outline when `isDragging` over the panel and files are present).

4. **dragover hints** — accept the drop when `e.dataTransfer.types.includes("Files")` so the cursor shows the copy icon and the drop actually fires. Browsers reject drops by default unless `dragover` calls `preventDefault()`, which the sidebar handlers already do — good.

5. **Toast feedback** — on file drops to a collection: "Uploaded N file(s) to {collection name}". On folder drops: existing upload toasts are enough.

### Out of scope

- No backend changes; existing `enqueueUpload` / `finalizeUpload` / `toggleAssetInCollection` server fns cover everything.
- No change to the upload pipeline, RLS, or storage buckets.
- No visual redesign of the sidebar — only the drop behavior.

### Risk

Low. All changes are additive in event handlers; the existing internal drag-and-drop path is preserved because we branch on `e.dataTransfer.files.length`.
