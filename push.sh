#!/bin/bash
# Run this once to push all changes to GitHub, then delete it.
cd "/Users/adamanderson/Documents/Dev Stack/EvoveMyBrand"
rm -f .git/index.lock
git config user.email "fastresults@gmail.com"
git config user.name "Adam Anderson"
git add -A
git commit -m "GenZ UI/UX + copy overhaul + fix Netlify SSR deployment

- styles.css: real gradient text-gradient-brand, glass/glow/animation utilities
- Header: active nav gradient underline, glow CTA, GenZ nav labels (join/who)
- All 6 pages: GenZ copy psychology rewrite
- 7 facilitator components: GenZ voice overhaul
- Footer: gradient accent, GenZ tagline
- netlify.toml (root): fixes 404 - NITRO_PRESET=netlify, publish=.output/public
- CLAUDE.md: project memory file"
git push origin main
echo "Done. You can delete push.sh now."
