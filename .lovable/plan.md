# Add Batch Delete to Media Library

## Problem

When one or more assets are selected in the media library, there is no way to delete them as a batch. The toolbar only shows "Push to users" when `selectedIds.size > 0`. The existing `removeAsset` mutation only deletes a single asset from the detail sheet (one server call at a time). Pressing Delete on the keyboard also does nothing.

## Fix

### 1. Toolbar button (`MediaHub.tsx`, top action row)
Next to "Push to users", render when `selectedIds.size > 0`:

```
<Button variant="destructive" onClick={confirmAndBatchDelete}>
  <Trash2 /> Delete ({selectedIds.size})
</Button>
```

### 2. Batch delete handler
Add a `batchDelete` mutation that:
- Confirms with `window.confirm("Delete N file(s)? This cannot be undone.")`
- Calls the existing `deleteAsset` server function once per id via `Promise.allSettled` (server fn already exists; no backend change)
- Shows a single toast: success count + failure count
- On completion: clears `selectedIds`, closes the detail sheet if the open asset was deleted, and invalidates the assets query

### 3. Keyboard shortcut
Add a `useEffect` keydown listener on the MediaHub root: when `Delete` or `Backspace` is pressed, no input/textarea is focused, the detail sheet is closed, and `selectedIds.size > 0`, trigger the same `confirmAndBatchDelete`.

### 4. Selection UX polish (small)
- After batch delete completes, also clear `dropTargetKey` and `isDragging` for safety.
- Disable the batch delete button while the mutation is pending and show a spinner.

## Out of scope
- No new server function (we reuse `deleteAsset`). If performance becomes an issue later, we can add a `deleteAssets` bulk server fn — not needed now.
- No changes to selection model, drag-and-drop, collections, or RLS.
