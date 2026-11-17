# AI Editorial Pages

This repository owns the static reading website, localization, RSS rendering and Pages deployment. The ai-editorial repository owns collection, source configuration and daily JSON production. Do not import or check out engine code to build this site.

Use Node.js 24. Keep public data behind the versioned contract validator; never render arbitrary downloaded JSON. A failed or stale input must stop deployment and preserve the previous site. Only checked main revisions may deploy. Keep generated output outside the repository, under DATA_ROOT/ai-editorial-pages/ for retained local results or a task temporary directory.

Run npm ci, npm test, npm run typecheck, npm run test:browser, and a fixture build before integration. Browser tests need Playwright Chromium. Test the producer/consumer revisions together when changing the contract. English is the default; keep Chinese translations aligned and use locale catalogs for UI text. Preserve the MIT attribution in LICENSE for code derived from AIHOT and ai-editorial.
