# 消费端数据契约

[English](contract.md)

每次构建都需要信源链接版 v1 数据和文章库 v2 release。首页展示最新日报文章。v1 继续提供按日期归档的链接页和公开 JSON。v2 的校验与 release 细节参见[文章阅读与发布](magazine.zh-CN.md)。

## 信源链接版 v1

[editions v1 标准](https://github.com/runchengxie/ai-editorial/blob/main/docs/daily-brief-v1.md)由引擎维护。消费端独立校验现有公开端点 `https://runchengxie.github.io/ai-editorial/editions.json`，不下载引擎源码。

数据包含 1至30 期简报，每期有规范 UTC 生成时间、上海日期、七天筛选窗口、信源状态和 1至8 条公开链接。每条链接包含原标题、HTTP(S) 地址、发布时间、信源 ID 与名称，以及投研、开发或综合分类。未知字段在渲染和输出 JSON 前移除。

消费端校验信源身份与状态、至少 50% 的信源可用率、期刊日期和链接唯一性、每个信源最多两条、七天发布时间窗口、有效 UTC 日期，以及最新一期不超过 48 小时。无效、未来、过期、过大或不可用的输入会使构建失败，保留当前部署。下载限制为两百万字节、30 秒及固定 HTTPS 端点，不接受跳转。

## 构建来源记录

`build.json` 的 `contractVersion: 2` 表示同时消费两种数据的阅读网站构建，`sourceContractVersion: 1` 表示信源链接数据版本。`source`、`dataSha256` 和 `generatedAt` 标识规范化后的 v1 输入。`magazineSource`、`magazineSha256`、`producerRevision` 和 `magazineGeneratedAt` 分别记录 v2 release 端点、校验过的附件字节摘要、清单中的引擎提交和最新日报文章生成时间。`rendererRevision`、`builtAt` 和 `preview` 记录网页提交、构建时间与样例标记。

v1 端点没有引擎提交字段。v2 清单中的提交只对应文章附件。跨仓库评测另行记录联合验证的引擎与网页提交。样例及本地文件构建使用明确标记代替已验证的 release 来源，文章摘要为 `fixture` 或 `local-file`，对应引擎提交为 `fixture` 或 `local`。不要把这些标记当作哈希，也不要发布样例。引擎的破坏性变更需要新端点及协调后的消费端支持，不能悄悄改变现有结构的含义。

保留的网站产物和评测记录放在 DATA_ROOT/ai-editorial-pages/。原始信源输入与状态仍由引擎的数据约定管理。本地 `--input` 文件可用于复现评测。生产工作流始终读取固定公开来源。样例产物只用于测试，不得部署。
