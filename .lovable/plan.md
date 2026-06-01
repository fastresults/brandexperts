## Fix

The selected headline ("Walk out with a brand that ships without you.") uses the `text-gradient-brand` utility — the same orange→magenta gradient applied to every accent headline phrase across `/register`, `/schedule`, `HomeSelection`, `ArtOfThePossible`, etc. That is the on-brand accent treatment, not a solid blue.

The home hero currently uses a solid color (`text-hero-blue`), which is inconsistent with the rest of the site.

## Change

In `src/routes/index.tsx` (line 143), swap the accent span on "Personal Branding Operating System":

- From: `<span className="text-hero-blue">Personal Branding Operating System</span>`
- To:   `<span className="text-gradient-brand">Personal Branding Operating System</span>`

## Cleanup

Remove the now-unused `--hero-blue` / `--color-hero-blue` token additions from `src/styles.css` (the three lines I added previously) so we don't leave dead tokens behind.

## Out of scope

No changes to the `text-gradient-brand` utility itself, no other hero copy, no header colors.
