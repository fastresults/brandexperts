# Fix: "Copy complete package" should actually copy

## Root cause

The button label promises a clipboard copy ("Copy complete package") but my handler calls `Blob` + `<a download>`, which silently saves a file to the user's Downloads folder. Nothing lands on the clipboard, so pasting yields old contents — looks broken.

The server fn `exportCompletePackage` is correct and already returns the full assembled markdown. The bug is purely in the client handler.

## Fix

In `src/routes/_authenticated/dashboard.brief.tsx`, `FinishedView.downloadCompletePackage`:

1. Rename to `copyCompletePackage`.
2. After awaiting `exportPackage()`, call `navigator.clipboard.writeText(pkg)` instead of triggering a download.
3. Toast: "Complete package copied — paste anywhere" with the byte count (e.g. "Copied 42 KB to clipboard") so the user has visible confirmation.
4. Add a `Check` icon flash for ~2s after success (matches the "Copy markdown" UX pattern already in this view).
5. Keep the loading spinner while the server fn runs (the assembly + fetch can take a moment for users with long resumes).
6. Fallback: if `navigator.clipboard.writeText` rejects (permissions, insecure context, or payload too large for the browser's clipboard), fall back to the existing Blob download path and toast: "Clipboard blocked — downloaded the package as a file instead." This guarantees the user always gets the data.

No changes to the server function, no schema changes, no new files.

## Files touched

- `src/routes/_authenticated/dashboard.brief.tsx` — rewrite the one handler + button label/icon/state.

## Out of scope

- Adding a separate "Download complete package" button. If you want both copy and download as distinct actions, say the word and I'll add the second button — but the current request is to make the existing button match its label.
