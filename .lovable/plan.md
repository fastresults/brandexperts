# Fix plan for broken complete-package downloads

## What’s actually failing
The download UI is wired up, but the app currently has a server parse error in `src/routes/api/brief-chat.ts`. Because that route is part of the running app, the preview server is failing before or during normal page/server-function handling, which can make the export actions appear broken even though the button handlers exist.

## Root cause found
- The preview server logs show a `SyntaxError: Missing semicolon. (99:81)` and SSR `500` failures.
- The failing area is `src/routes/api/brief-chat.ts`, inside the large template string used for the strategist system prompt.
- That file contains embedded backticks and interpolation-heavy prompt text, so one malformed character/escape in that prompt is enough to break the whole server bundle.
- When the server bundle is in that bad state, the complete-package export requests cannot reliably complete.

## Plan
1. Repair the syntax break in `src/routes/api/brief-chat.ts` so the preview server parses and runs again.
2. Re-test the complete-package actions from the finished brief screen:
   - download Markdown
   - download plain text
   - download Word
   - download PDF
   - copy Markdown
   - copy plain text
3. If any export still fails after the parse fix, inspect that specific export path:
   - client dropdown handler in `src/routes/_authenticated/dashboard.brief.tsx`
   - server export fns in `src/lib/brand-brief.functions.ts`
   - format builders in `src/lib/complete-package-formats.ts`
4. Apply only the minimal follow-up fix needed for the remaining failing format(s), then verify the success path with fresh logs.

## Expected outcome
- The preview stops throwing server parse errors.
- The export menu works again.
- If a specific format still has a runtime problem, it will be isolated and fixed without changing the package contents or UI scope.

## Technical notes
- Most likely first fix target: the long `const system = \`...\`` prompt block in `src/routes/api/brief-chat.ts`.
- The download buttons in `dashboard.brief.tsx` already call the correct server functions and blob download helpers, so this does not currently look like a button wiring problem first.
- No backend schema changes are needed for this fix.