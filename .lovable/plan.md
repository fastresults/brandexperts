## Add a warm guidance intro to the brand brief page

### What we're doing
Add a concise, polite, cordial, and positive guidance message at the very top of the brand brief page (right before the resume/LinkedIn import card). It should explain:
- **What** this is (your Brand Operating System brief)
- **Why** it matters (sets up your workshop experience)
- **How long** it takes (~10 minutes of conversation)
- **When** to do it (before your workshop session)

### Constraints
- **45 words or less**
- Warm, inviting tone — no pressure, no urgency
- Keep the existing page layout intact; just insert above the import card

### Implementation
1. In `src/routes/_authenticated/dashboard.brief.tsx`, add a small intro block above the `<BrandBriefImportCard />` containing the guidance copy.
2. Style it with existing semantic tokens (muted text, perhaps a subtle background or icon) so it feels integrated, not tacked-on.

### Files changed
- `src/routes/_authenticated/dashboard.brief.tsx`