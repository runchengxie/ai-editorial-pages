# AI Editorial Pages

[简体中文](README.zh-CN.md)

Read the [daily AI brief](https://runchengxie.github.io/ai-editorial-pages/) or subscribe to [RSS](https://runchengxie.github.io/ai-editorial-pages/feed.xml). This repository owns the bilingual static reader, historical editions and website deployment. The separate [ai-editorial engine](https://github.com/runchengxie/ai-editorial) owns sources, collection and selection.

The site consumes public daily JSON; it never imports engine code, queries the workbench database or calls a model. The current brief contains automatically selected original titles and links, with source dates and collection status. It is not human-reviewed or a model-written newsletter.

See [setup and publication](docs/operations.md), [the data contract](docs/contract.md) and [repository boundaries](AGENTS.md). Node.js 24 is required; generated output stays outside this repository.

```sh
npm ci
npm test
npm run typecheck
npm run build -- --fixture --out /tmp/ai-editorial-pages-preview
```

Run `npm run test:browser` after installing Playwright Chromium. CI covers contract, type and browser checks before main can publish. Source code is MIT-licensed; article content belongs to its publishers. See [LICENSE](LICENSE) and [attribution](NOTICE).
