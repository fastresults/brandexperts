#!/bin/bash
cd "/Users/adamanderson/Documents/Dev Stack/EvoveMyBrand"
rm -f .git/index.lock
git config user.email "fastresults@gmail.com"
git config user.name "Adam Anderson"
git add -A
git commit -m "fix(deploy): netlify.toml publish=dist, remove manual redirects/functions blocks

- publish dir changed from dist/client → dist (Netlify auto-detects dist/nitro.json)
- removed manual [[redirects]] and [functions] blocks (Netlify wires these up
  automatically when it finds dist/nitro.json — manual blocks conflict with SSR routing)
- vite.config.ts already has nitro: { preset: 'netlify' } (confirmed correct)

copy(revamp): bold/direct/conversion-first copy across all pages

Hero: You are already the expert. This afternoon makes you the name.
Eyebrow: Stop being the best-kept secret in your category.
Banner: Three hours. Everything ships before you walk out the door.
Schedule: Walk in unknown. Walk out the name.
Register: Walk in respected. Walk out known.
Facilitator: Adam Anderson has made 50 founders the name in their category. You are next.
FacilitatorCTA: You have built the credibility. Now build the reach.
FacilitatorStats: 50+ founders stat
CTA: Claim your seat everywhere (replaces Lock in)
public/_redirects: cleared SPA fallback (was breaking Nitro SSR routing)"
git push origin main
echo "Done — check Netlify deploy log for: [nitro] Generated public dist/client"
echo "Should NOT see: Not adding Nitro fallback to _redirects"
