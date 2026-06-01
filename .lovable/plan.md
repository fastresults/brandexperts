# Plan

## What I’ll fix
1. **Make login failures visible in-page**
   - Replace toast-only auth feedback on `/login` with inline error/success states so a bad password, missing email, or network/auth failure is always visible.
   - Keep the submit/loading states deterministic so the user can tell whether the action is running, failed, or succeeded.

2. **Fix the forgot-password flow end to end**
   - Update the **Forgot?** action so it gives visible feedback even before any email is sent.
   - Ensure the reset email uses the correct return URL and that `/reset-password` properly handles recovery sessions instead of only showing a password form.
   - Add explicit states for: missing recovery token, expired/invalid reset link, success after password change.

3. **Tighten auth transition behavior after sign-in**
   - Review the current `use-auth` session listener and the `/login` redirect logic together so a successful sign-in reliably moves the user forward instead of appearing stuck on the login page.
   - Keep this scoped to the login flow only.

4. **Verify in the right environment**
   - Test both **preview** and the **published site**.
   - If preview auth is still blocked by the platform proxy, I’ll keep the app-side fixes and clearly separate that from any preview-only limitation.

## Files likely involved
- `src/routes/login.tsx`
- `src/routes/reset-password.tsx`
- `src/hooks/use-auth.tsx`
- `src/routes/__root.tsx` or the app shell if global feedback UI needs wiring

## Technical notes
- The hosted backend looks healthy.
- Current auth screens rely heavily on `toast.*`, which can make failures look like “nothing happened” if that feedback is not rendered or is too easy to miss.
- The current reset-password page does not appear to validate the recovery state from the reset link before allowing password update.

## Validation
- Confirm bad credentials show a visible error.
- Confirm **Forgot?** with no email shows a visible prompt.
- Confirm **Forgot?** with an email triggers the reset flow and shows a visible success state.
- Confirm opening a reset link lands on a working reset screen.
- Confirm successful sign-in redirects correctly for a normal member account.