# AI Editorial Pages

[English](README.md)

定时发布及检查成功后的自动发布已暂停。既有内容继续在线，保留[手动发布步骤](docs/operations.zh-CN.md)。

访问[每日 AI 简报](https://runchengxie.github.io/ai-editorial-pages/)，或订阅 [RSS](https://runchengxie.github.io/ai-editorial-pages/feed.xml)。本仓库负责中英双语静态网站、历史归档和网页部署。独立的 [ai-editorial 引擎](https://github.com/runchengxie/ai-editorial)负责信源、采集和筛选。

网站只读取公开日报 JSON，不导入引擎源码、不查询内部后台数据库，也不调用模型。网站包含由引擎本机 Codex 任务生成的文章式日报与长文周报，正文附来源引用，并支持归档和发布用 HTML 下载。内容自动整理，未经人工审核。

参见[文章阅读与发布](docs/magazine.zh-CN.md)。

参见[运行与发布](docs/operations.zh-CN.md)、[数据格式](docs/contract.zh-CN.md)及[仓库边界](AGENTS.md)。需要 Node.js 24，生成文件保存在仓库之外。

```sh
npm ci
npm test
npm run typecheck
npm run build -- --fixture --out /tmp/ai-editorial-pages-preview
```

安装 Playwright Chromium 后运行 `npm run test:browser`。CI 检查数据格式、类型和浏览器行为，main 检查通过后才能发布。源码采用 MIT 许可，文章内容属于原作者。参见 [LICENSE](LICENSE) 和[来源说明](NOTICE)。
