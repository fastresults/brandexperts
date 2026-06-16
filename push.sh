#!/bin/bash
cd "/Users/adamanderson/Documents/Dev Stack/EvoveMyBrand"
rm -f .git/index.lock
git config user.email "fastresults@gmail.com"
git config user.name "Adam Anderson"
git add -A
git commit -m "copy: perpetual Brand OS framing pass — 15 assets are the launch, not the end

Shift: 15 assets you leave with are day-one live content.
The Brand OS is the ongoing system that keeps generating in your voice every month after.
30 min/week. No team. No retainer. The system runs.

Files changed:
- index.tsx: hero sub, WhatYouLeaveWith eyebrow/H2/body
- schedule.tsx: sub, stat ribbon label
- register.tsx: sub, pricing header
- FacilitatorPillars.tsx: Pillar 3 + 4 title/desc
- ArtOfThePossible.tsx: body copy

Also includes from previous session:
- netlify.toml: publish=dist/client restored (tested config), node 22, timeout 30
- All bold copy revamp from prior session (facilitator, register, schedule, index, etc.)
- public/_redirects: cleared SPA fallback"
git push origin main
echo "Done. Check Netlify deploy log."
