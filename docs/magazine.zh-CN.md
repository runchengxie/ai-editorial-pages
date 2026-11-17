# 文章阅读与发布

[English](magazine.md)

网站展示带来源引用的每日文章和完整周报，包含一览、分组编号正文、拾遗、掠影、前瞻和来源目录。独立的[引擎](https://github.com/runchengxie/ai-editorial/blob/main/docs/magazine.zh-CN.md)负责收集材料，通过本机已登录的 Codex 生成正文，读者打开网页不会触发模型调用。

版式参考指定文章，采用窄栏白底、15px正文与30px行高、22px居中栏目标题、20px编号新闻标题、深蓝强调色、细分隔线、克制的技术名词底色和较疏的段落间距。不复制参考文章的截图与图片。显示前会转义文本，独立检查标识、网址和引用关系。

## 数据与部署

`src/magazine/fetch.ts` 只读取引擎固定的公开 release `magazine-current`，其描述指向按哈希命名的不可变 JSON。网页校验清单、文件地址、SHA-256、来源引用、ISO时间、实际日报/周报范围及新鲜度。日报收录24至72小时，周报为北京时间完整周一至周日；最新日报不得超过72小时，最新周报不得超过15天。前瞻日期须在引擎侧有明确来源，保留具体日期与计划性质。

既有 v1 接口继续作为标题链接归档，本网站仍校验并输出这份数据，供原 JSON 使用者读取。文章正文使用独立的 v2 格式，文件为 `magazine.json`。`build.json` 记录两个数据版本、原链接数据摘要、刊物文件哈希、已检查的引擎提交、网页提交和生成时间。未知字段会被移除，不显示原文正文、私有引用片段、凭据或内部备注。

每期有独立中英页面，首页展示最新日报，`weekly.en.html` 与 `weekly.zh-CN.html` 展示最新周报。RSS 按刊物订阅，不再逐条重复原始链接。每期可下载带内联样式的完整 HTML，方便编辑复用；导出中保留来源和自动整理、未经人工审核的标识。

## 本地检查

```sh
npm ci --no-audit --no-fund
npm test
npm run typecheck
npm run test:browser
npm run build -- --fixture --out /tmp/ai-editorial-magazine-preview
# 用仓库外文件复现引擎与网页的联合评测：
npm run build -- --input <v1-editions-json> --magazine-input <v2-library-json> --out <external-output-dir>
```

样例为虚构测试资料，不能发布。生产构建固定读取公开端点，要求日报与周报均有效；输入不可用、格式错误、过期或哈希不符时停止部署，保留旧站。原定北京时间08:37网页任务和 main 检查成功触发保持不变；本机引擎发布新刊物后也会触发网页更新。正文生成依赖用户电脑和 Codex 登录，电脑离线时静态网站仍保持在线。GitHub 定时任务维护见[运维说明](operations.zh-CN.md)。
