# Consumed data contract

The canonical [editions v1 contract](https://github.com/runchengxie/ai-editorial/blob/main/docs/daily-brief-v1.md) is owned by the producer. This consumer independently validates the existing public `https://runchengxie.github.io/ai-editorial/editions.json` endpoint and never downloads source code from that repository.

Accepted data contains 1–30 dated editions, each with a canonical UTC generation timestamp, Shanghai date, seven-day selection window, source status list and 1–8 public entries. Entries contain original title, HTTP(S) URL, publication time, source ID/name and finance/development/general audience. Unknown fields are removed before rendering or publishing JSON.

The consumer enforces source identity/status, at least 50% source health, unique edition dates and URLs, two entries per source, a seven-day publication window, valid UTC dates and a latest edition at most 48 hours old. Invalid, future, stale, overlarge or unavailable inputs fail the build and leave the current deployment unchanged. Downloads are limited to two million bytes, 30 seconds and the fixed HTTPS endpoint without redirects.

`build.json` records contract version, source URL, normalized public payload SHA-256, source generation timestamp, renderer revision and build timestamp. These identify the data rendered; the producer's public endpoint has no source revision field. Cross-repository evaluations separately record the actual provider and consumer revisions tested together. A breaking producer change requires a new endpoint and coordinated consumer support; never silently reinterpret the current shape.

Retained site outputs and evaluation records belong under DATA_ROOT/ai-editorial-pages/. Original source input/state remains under the producer's data contract. A local `--input` file may be used for reproducible evaluation; production workflows always use the fixed public source. Fixture output is test-only and is never deployed.
