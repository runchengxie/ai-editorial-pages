# 运行与发布

[English](operations.md)

使用 Node.js 24.22.2 或以上版本。本仓库独立运行，只有 TypeScript 和浏览器测试开发依赖，不需要数据库、常驻服务器、模型密钥、采集器或运行时 PAT。

```sh
npm ci --no-audit --no-fund
npm test
npm run typecheck
npx playwright install chromium
npm run test:browser
npm run build -- --fixture --out /tmp/ai-editorial-pages-preview
# 读取并校验实际公开的引擎数据：
npm run build -- --out /tmp/ai-editorial-pages-live
```

输出目录必须位于仓库之外，包括符号链接解析后的目录。本地留存产物放在 DATA_ROOT/ai-editorial-pages/，临时预览可用 /tmp 下的任务目录。不要发布 `--fixture` 样例。`--input <外部 JSON 文件>` 可用于复现数据契约评测。

## 生产发布

GitHub Pages 使用 Actions 发布源。探索阶段 `Publish website` 只允许手动运行，不按时钟或源码检查成功自动发布。需要发布时再执行 `gh workflow run pages.yml --repo runchengxie/ai-editorial-pages --ref main`。引擎明确发布刊物时也会触发这一手动工作流。所有入口都核对当前网页提交的 push 检查已经成功。临时 GitHub 令牌只用于读取本仓库检查和部署 Pages；源数据走公开 HTTPS，不需要跨仓库密钥。

构建前先校验数据。读取失败、格式错误或最新数据超过 48 小时时停止部署，保留旧站。引擎延迟时，网站可能继续使用最近一份有效数据，直到下次任务执行；请查看网页上的源数据生成时间。发布时间不代表人工审核或事实核验。文章标题保持原文，界面默认英文，可明确切换中文并记住选择。

自动刷新保持暂停。引擎提供[手动检查、生成、发布和以后恢复定时任务的步骤](https://github.com/runchengxie/ai-editorial/blob/main/docs/magazine.zh-CN.md#手动探索自动化暂停)。恢复云端定时需明确修改并评审代码。长期暂停后先刷新源数据，不能绕过新鲜度检查。

## 仓库拆分

先合并引擎的数据发布改造，但在新网站可用之前保持旧站和 JSON 部署不变。新网页全程可以读取已有的生产 v1 数据。新站可用后，手动运行引擎的 `Daily Data` 发布 JSON 和旧地址跳转，再运行一次新网页发布。验证两个站点、RSS、历史导航和源数据时间。不要从未合并的引擎分支或临时 worktree 发布。旧 RSS 会提供迁移通知，订阅者应更新到新地址。

文章生成使用独立本机任务及 v2 release 数据，参见[刊物发布](magazine.zh-CN.md)。引擎负责采集、筛选和数据历史；本仓库负责 HTML/CSS、多语言、RSS 和阅读网站部署。网页改动不再进入引擎的 Git 历史。没有第三个部署仓库，也不会每天向源码分支提交生成数据。
