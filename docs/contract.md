# Consumed data contract

[简体中文](contract.zh-CN.md)

Every build requires both the source-link editions v1 feed and the article library v2 release. The latest daily article is the home page; v1 remains available as dated link archives and public JSON. See [article reading and publication](magazine.md) for v2 validation and release details.

## Source-link editions v1

The canonical [editions v1 contract](https://github.com/runchengxie/ai-editorial/blob/main/docs/daily-brief-v1.md) is owned by the producer. This consumer independently validates the existing public `https://runchengxie.github.io/ai-editorial/editions.json` endpoint and never downloads source code from that repository.

Accepted data contains 1–30 dated editions, each with a canonical UTC generation timestamp, Shanghai date, seven-day selection window, source status list and 1–8 public entries. Entries contain original title, HTTP(S) URL, publication time, source ID/name and finance/development/general audience. Unknown fields are removed before rendering or publishing JSON.

The consumer enforces source identity/status, at least 50% source health, unique edition dates and URLs, two entries per source, a seven-day publication window, valid UTC dates and a latest edition at most 48 hours old. Invalid, future, stale, overlarge or unavailable inputs fail the build and leave the current deployment unchanged. Downloads are limited to two million bytes, 30 seconds and the fixed HTTPS endpoint without redirects.

## Build provenance

`build.json` uses `contractVersion: 2` for the combined reader build and `sourceContractVersion: 1` for the source-link feed. `source`, `dataSha256` and `generatedAt` identify the normalized v1 input. `magazineSource`, `magazineSha256`, `producerRevision` and `magazineGeneratedAt` identify the v2 release endpoint, verified asset bytes, producer revision from the manifest and latest daily article generation time. `rendererRevision`, `builtAt` and `preview` record the reader revision, build time and fixture status.

The v1 endpoint has no producer revision field; the v2 manifest revision applies to the magazine asset. Cross-repository evaluations separately record the actual provider and consumer revisions tested together. Fixture and local-file builds use explicit markers instead of verified release provenance (`fixture` or `local-file` for the magazine digest, `fixture` or `local` for its producer revision); never interpret those markers as hashes or deploy fixture output. A breaking producer change requires a new endpoint and coordinated consumer support; never silently reinterpret the current shape.

Retained site outputs and evaluation records belong under DATA_ROOT/ai-editorial-pages/. Original source input/state remains under the producer's data contract. A local `--input` file may be used for reproducible evaluation; production workflows always use the fixed public source. Fixture output is test-only and is never deployed.
