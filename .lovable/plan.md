# Multi-format export for the complete package

## What changes for the user

The single "Copy complete package" button becomes a **dropdown menu** anchored to a "Export complete package" button in the same spot on the finished brief header. The menu is split into two groups:

**Copy to clipboard**
- Markdown (the current behavior — full formatted .md text)
- Plain text (markdown stripped, safe to paste into any input/textarea/email field)

**Download**
- Markdown (`.md`)
- Plain text (`.txt`)
- Word (`.docx`)
- PDF (`.pdf`)

Each option shows a tiny spinner while building, and toasts on success/failure. The Copy options keep the existing "Clipboard blocked → fall back to download" safety net.

Scope: every format contains the **same complete package** the current button already produces — final brief + enriched profile + raw resume/LinkedIn + uploaded docs manifest + Q&A ledger + workshop alignment + metadata. No new data sources.

## How it's built

### 1. Source of truth stays the same
`buildCompletePackageMarkdown` in `src/lib/complete-package.ts` remains the canonical assembler. Every format is derived from its markdown output so the content never diverges across formats.

### 2. New format converters (`src/lib/complete-package-formats.ts`, new)
Pure functions, no I/O:
- `markdownToPlainText(md)` — strips headings (`#`), bold/italic markers, list bullets, link syntax (`[text](url)` → `text (url)`), table pipes, code fences. Preserves paragraph spacing. Hand-rolled regex pass (small, no dependency).
- Helper used by both client (for copy/download txt) and server (for docx/pdf body text).

### 3. Server-side binary builders
Two new `createServerFn` endpoints in `src/lib/brand-brief.functions.ts` that reuse the existing `exportCompletePackage` data-gathering, then convert. Both return `{ base64, filename, mimeType }` so the client can trigger a download.

- **`exportCompletePackageDocx`** — uses the `docx` npm package (pure JS, Worker-compatible per server-runtime rules). Parses the assembled markdown into Paragraphs (Heading 1/2/3, bullets, paragraphs, tables for the documents manifest). Returns a `.docx` buffer base64-encoded.
- **`exportCompletePackagePdf`** — uses `pdf-lib` (pure JS, Worker-compatible). Renders the plain-text form of the package with simple typography: Helvetica-Bold for headings detected by line prefix (`# `, `## `, `### `), Helvetica for body, page-break on overflow, page numbers in the footer. Returns a `.pdf` buffer base64-encoded.

Both run under `requireSupabaseAuth` (same auth posture as `exportCompletePackage`). New npm deps: `docx`, `pdf-lib`. Installed via `bun add` in build mode.

### 4. UI changes (`src/routes/_authenticated/dashboard.brief.tsx`, `FinishedView`)
- Remove the standalone "Copy complete package" button.
- Replace with a shadcn `DropdownMenu` triggered by an "Export complete package" button (same primary-tinted styling, `Package` icon, `ChevronDown` indicator).
- Menu uses `DropdownMenuLabel` + `DropdownMenuGroup` for "Copy" and "Download" sections, `DropdownMenuSeparator` between them.
- Per-item handlers:
  - **Copy → Markdown**: existing `copyCompletePackage` logic (clipboard → fallback download).
  - **Copy → Plain text**: fetch package, run `markdownToPlainText`, write to clipboard with same fallback.
  - **Download → Markdown**: fetch package, Blob download as `.md` (existing fallback path, promoted to a first-class action).
  - **Download → Plain text**: fetch package, convert, Blob download as `.txt`.
  - **Download → Word**: call `exportCompletePackageDocx`, decode base64, Blob download as `.docx`.
  - **Download → PDF**: call `exportCompletePackagePdf`, decode base64, Blob download as `.pdf`.
- Single `busyFormat` state (`'copy-md' | 'copy-txt' | 'dl-md' | 'dl-txt' | 'dl-docx' | 'dl-pdf' | null`) drives spinners on the active item; the trigger button shows a spinner while any export is in flight.
- Filenames: `brand-brief-complete-YYYY-MM-DD.{md|txt|docx|pdf}`.

### 5. Untouched
- `Copy markdown` and `Download .md` (the brief-only buttons next to the new menu) stay exactly as they are — they're brief-only, not the complete package.
- Server function `exportCompletePackage` and `buildCompletePackageMarkdown` stay byte-identical; new endpoints reuse them internally.
- No schema changes, no new tables.

## Out of scope
- Rich PDF styling (cover pages, themed colors, embedded brand assets). The PDF is a clean typographic dump of the same content; if you want a designed PDF later, say the word.
- Per-section export (e.g. "just the Q&A as Word"). The menu always exports the full package.
- Email-the-package or share-link actions.
