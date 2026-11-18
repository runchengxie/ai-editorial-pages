# Article reading and publication

[简体中文](magazine.zh-CN.md)

The website now displays source-linked daily articles and complete-week digests, with an overview, grouped numbered features, related updates, briefs, dated outlook and a source bibliography. The independent [engine](https://github.com/runchengxie/ai-editorial/blob/main/docs/magazine.md) gathers evidence and generates prose through its locally logged-in Codex worker. Reader requests never invoke a model.

The design follows the supplied article reference: a narrow white column,15px/30px body typography,22px centered section headings,20px numbered article headings, navy accents, fine separators, restrained technical-term highlights and generous paragraph spacing. Artwork/screenshots from that article are not copied. Public text is escaped; identifiers, URLs and references are independently validated before rendering.

## Data and deployment

`src/magazine/fetch.ts` reads only the fixed public engine release `magazine-current`. The release body points to an immutable hash-named JSON asset. The reader verifies the manifest shape, asset location, payload SHA-256, exact source references, ISO dates, truthful daily/weekly coverage and freshness. A daily may cover24–72hours; a weekly covers a complete Shanghai Monday–Sunday. Latest daily must be within72hours and latest weekly within15days. Planned outlook dates require producer-side source evidence and remain explicitly dated.

The engine's existing v1 feed remains a source-link archive. The reader still validates and exports that feed for its existing JSON consumers; article content is a separate v2 library at `magazine.json`. `build.json` records both contract versions, source-link digest, magazine asset digest, checked producer revision, reader revision and generation time. Unknown fields are stripped. Original bodies, quote anchors, credentials and private editorial notes are never rendered.

Each issue has dated English/Chinese pages. Root pages display the latest daily; `weekly.en.html` and `weekly.zh-CN.html` display the latest weekly. The RSS feed subscribes to editions rather than repeating every original source link. An issue provides a downloadable standalone HTML file with inline styles, suitable for editorial reuse. Source links and automatic/unreviewed labeling stay visible in the export.

## Local checks

```sh
npm ci --no-audit --no-fund
npm test
npm run typecheck
npm run test:browser
npm run build -- --fixture --out /tmp/ai-editorial-magazine-preview
# Reproduce a paired producer/reader evaluation with external files:
npm run build -- --input <v1-editions-json> --magazine-input <v2-library-json> --out <external-output-dir>
```

Fixtures are fictional and must never be published. Production builds always fetch the fixed public endpoints; they require both valid daily and weekly editions. A failed, unavailable, stale or mismatched input stops deployment and preserves the previous site. Reader schedules and successful-main publication triggers are removed while evaluation is paused. Explicit manual publication remains available; a deliberate engine publication dispatches the reader. Local generation depends on the user's machine/Codex login; the static site remains online when that machine is off. See [operations](operations.md) for GitHub schedule maintenance.

## Expanded article capacity

The independent v2 validator accepts up to12 features,25 briefs and60 source references; old issues remain compatible. These are bounds, not guaranteed publication counts. Topic filtering, event merging and one model call per issue belong to the producer. Deploy this reader before publishing expanded data. Offline fixtures now exercise6 daily features/12 briefs and12 weekly features/25 briefs for long-page, numbering and mobile checks; they must not be published as news.
