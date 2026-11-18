# Setup and publication

[简体中文](operations.zh-CN.md)

Use Node.js 24.22.2 or later. This standalone repository has only TypeScript and browser-test development dependencies. There is no database, server, model key, collector or runtime PAT.

```sh
npm ci --no-audit --no-fund
npm test
npm run typecheck
npx playwright install chromium
npm run test:browser
npm run build -- --fixture --out /tmp/ai-editorial-pages-preview
# Read and validate the real public producer data:
npm run build -- --out /tmp/ai-editorial-pages-live
```

The output directory must resolve outside the repository, including through symlinks. Retained output belongs under DATA_ROOT/ai-editorial-pages/; temporary previews may use a task directory under /tmp. Do not deploy `--fixture` output. `--input <external-json-file>` supports reproducible contract evaluations.

## Production

GitHub Pages uses Actions as its publishing source. The `Publish website` workflow is manual-only while evaluation is paused: no cron and no successful-check trigger. Run `gh workflow run pages.yml --repo runchengxie/ai-editorial-pages --ref main` only when publication is intended. A deliberate engine publication also dispatches this manual workflow. Code checks alone never publish. Every entry point verifies a successful push `Check` for the exact renderer revision. The temporary GitHub token is limited to reading checks and deploying this repository's Pages artifact. All source data is read over public HTTPS; no cross-repository secret is needed.

The workflow validates data before building. Failed fetches, malformed inputs and latest data over 48 hours old stop deployment, preserving the previous website. A delayed producer may cause the reader to reuse the latest valid edition until its next run; inspect the source generation time displayed on the page. Publication time is not a promise of human review or fact verification. Original article titles stay in their source language; English is the interface default, and an explicit Chinese switch persists the choice.

Keep automatic refreshes paused. The engine documents [manual inspection, generation, publication and explicit later timer activation](https://github.com/runchengxie/ai-editorial/blob/main/docs/magazine.md#manual-evaluation-automation-paused). Restoring a cloud schedule requires a deliberate reviewed change. After a long pause, refresh producer data first; freshness checks must not be bypassed.

## Repository split

The repository split is complete. The producer owns public data and legacy-address redirects; this repository owns the reader and its RSS feed. For future coordinated changes, merge the provider before its consumers and validate the revisions together before publication. Never publish from an unmerged engine branch or temporary worktree. When publishing intentionally, verify both sites, RSS, archive navigation and source timestamps. The legacy RSS publishes a migration notice linking the new feed; subscribers should update their URL.

Article generation uses the separate local worker and v2 release contract described in [magazine publication](magazine.md). The engine owns collection/selection/data history; this repository owns HTML/CSS, localization, RSS and reader deployment. Reader changes no longer appear in the engine's Git history. There is no third deployment repository and no generated-data commit stream.
