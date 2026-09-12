---
layout: ../../layouts/ArticleLayout.astro
title: "Ditching llm-scaler: Qwen3.8-27B on my B70"
description: "Patching vLLM with GPT-5.6 Sol's help got me to a local setup I love: Qwen3.8-27B, working MTP4, and measured decode gains through 131K total context."
date: 2026-07-25
updated: 2026-09-12
topic: "Local inference"
ogImage: "/images/notes/b70-workhorse/qwen38-og-20260820.png"
ogImageAlt: "Intel Arc Pro B70 with Qwen3.8-27B and MTP4: 51.02 generation tokens per second at 16,384 prompt tokens; setup as of August 20, 2026"
---

**This is my setup as of August 20, 2026.** I rewrote this article because the conclusion changed. The earlier measurements are still available, but they are no longer the story of what I run.

I love this setup now. The turning point was ditching llm-scaler as the basis of my serving setup and patching vLLM with GPT-5.6 Sol's help. The hardware was still the same Intel Arc Pro B70. What changed was the software I was willing to treat as fixed.

I ended up with **Qwen3.8-27B, GPTQ INT4 weights, a BF16 MTP draft, FP8 KV cache, and XPU graphs**. MTP4 stays on. The pinned stack passed repeated populated-context tests all the way to **130,560 prompt tokens plus 512 output tokens**, then became my production profile.

That is a much better ending than “I tried MTP and left it disabled.”

## Getting out of the packaged stack

llm-scaler was part of my earlier path into local inference. Eventually, I needed to work below that layer: the vLLM version, checkpoint packing, draft precision, graph behavior, and patches all mattered. Leaving that packaged stack behind let me change and pin those pieces directly.

GPT-5.6 Sol helped me work through the vLLM patching. I think that is an important part of this story: I did not just find a different model file and get lucky with a fast response. I used a coding model to help work on the serving software, then checked the result on the actual GPU.

The earlier failures were real. My Qwen3.6 AutoRound experiments had found both corrupted speculative output with graph replay and coherent-but-slow MTP without it. A later Qwen3.8 development-stack attempt also broke down under longer prompts. Those results described those combinations of software and weights. They were not a permanent verdict on the B70 or on MTP.

The successful endpoint was not all code I invented. I reproduced the pinned Qwen3.8 recipe in [SergiioB's Intel Arc Pro B70 inference cookbook](https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/tree/1378950ac875ab6962addd1ddaf44550d34c3103), including its checkpoint choice and two required runtime patches. That upstream work deserves credit. My result here is the working deployment and the repeated measurements on my machine.

## The stack that finally worked

| Piece | August 20 setup |
| --- | --- |
| GPU | One Intel Arc Pro B70; 32,656 MiB reported by PyTorch XPU |
| Host | Ubuntu 26.04 LTS, `xe` driver, 230 W GPU power cap |
| Model | [Qwen3.8-27B GPTQ INT4, symmetric group-128, with BF16 MTP tensors](https://huggingface.co/SergiioB/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16) |
| Runtime | Pinned vLLM XPU image; installed vLLM `0.27.2rc1.dev77+gac7509e2b.xpu` |
| Runtime patches | `patch_mtp_nightly.py`, then `patch_mtp_boundary.py` |
| Execution | FP16 target compute, BF16 draft, FP8 KV cache, XPU graphs |
| Speculation | MTP4: four proposed draft tokens per verification round |
| Production limits | 131,072 total tokens; one sequence; scheduler ceiling 8,192 |
| Production cache | Exact-prefix caching enabled after a separate functional canary |

The draft precision is explicit: `B70_MTP_BF16_DRAFT=1`. Graphs are enabled, not worked around by permanently turning them off. The checkpoint keeps the MTP tensors at 16-bit precision while the target weights use GPTQ INT4.

I keep this as a **pinned compatibility bundle**, not a bag of flags to scatter onto whichever nightly happens to be newest. The [public setup and measurement record](/data/b70-workhorse/qwen38-20260820-methodology.json) includes the image digest, model revision, patch hashes, upstream recipe, and benchmark controls.

The campaign validates that whole bundle. It does not isolate which individual patch, version, dtype, or setting fixed the previous failure. Ditching llm-scaler was the practical turning point for me; this is not a controlled benchmark claiming that removing a wrapper alone produces a particular speedup.

## MTP4 now earns its place

I wanted more than a shallow prompt that happened to look fast. The main comparison used exact populated prompts at four depths, one client request at a time, and exactly 512 output tokens per request. Each cell had a generic warmup, a full-output same-shape warmup, and **three measured runs** with distinct prompts. Prefix caching was disabled and every measured request recorded zero cache hits.

<figure>
  <img src="/images/notes/b70-workhorse/qwen38-decode-20260820.svg" alt="Qwen3.8-27B mean decode rates on one B70, with sample-standard-deviation error bars. At 16,384 prompt tokens, no speculation measured 31.09 tok/s and MTP4 51.02. At 32,768: 29.76 and 47.91. At 65,536: 27.50 and 40.72. At 130,560: 24.05 and 36.48." width="1200" height="720" loading="lazy" decoding="async" />
  <figcaption>Three measured runs per cell, 512 output tokens, concurrency 1, zero prefix-cache hits. Bars show mean decode rate; whiskers show ±1 sample standard deviation.</figcaption>
</figure>

| Actual prompt tokens | No speculation, tok/s | MTP4, tok/s | Decode speedup |
| ---: | ---: | ---: | ---: |
| 16,384 | 31.09 ± 0.01 | 51.02 ± 0.47 | 1.64× |
| 32,768 | 29.76 ± 0.00 | 47.91 ± 3.82 | 1.61× |
| 65,536 | 27.50 ± 0.01 | 40.72 ± 2.21 | 1.48× |
| 130,560 | 24.05 ± 0.01 | 36.48 ± 3.80 | 1.52× |

These are means ± sample standard deviations, not confidence intervals. Decode is measured after the first generated token using the client monotonic clock: the remaining 511 tokens divided by the post-first-token interval. The rounded `0.00` is a small nonzero deviation, not perfectly identical runs.

All **12 MTP4 measured completions** passed the recorded mechanical checks and output-coherence review, as did the 12 no-spec controls. The full-context MTP4 replicates were **32.11, 38.94, and 38.41 tok/s**. There was no recorded EngineCore failure, OOM, graph failure, speculative-state error, or GPU reset during this campaign.

The comparison is between the two pinned recipe configurations. No-spec used `gpu_memory_utilization=0.90`; MTP4 used `0.88`. The benchmark server allowed 64 sequences, but the client sent only one request at a time. The final production profile is stricter: one sequence, with prefix caching enabled. I have not relabeled the uncached lab matrix as a fresh benchmark of that cached production profile.

What matters to me is the change in conclusion: MTP4 was coherent through the tested context range and delivered **1.48–1.64× faster decode**. It was no longer a feature I had to leave off to trust the result.

## Faster decode is not the same as a faster whole request

The B70 still has to process the prompt. That matters a lot at the top of the context window.

<figure>
  <img src="/images/notes/b70-workhorse/qwen38-latency-20260820.svg" alt="Mean end-to-end request time for 512 output tokens, split into time to first token and the remaining generation interval. No-spec versus MTP4: 26.42 versus 20.36 seconds at 16,384 prompt tokens; 40.22 versus 34.55 at 32,768; 76.76 versus 73.02 at 65,536; 185.38 versus 185.71 at 130,560." width="1200" height="720" loading="lazy" decoding="async" />
  <figcaption>Same uncached requests as the decode chart. Prompt ingestion dominates the full-context result; each stacked bar is a mean, not a single representative run.</figcaption>
</figure>

At 16K, the 512-token request fell from **26.42 to 20.36 seconds** overall. At 32K it fell from **40.22 to 34.55 seconds**. Those are useful changes.

At 130,560 prompt tokens, MTP4 took about **171.59 seconds to the first token**, and the whole request took **185.71 seconds**, versus **185.38 seconds** without speculation. Decode was faster; the full request was effectively tied because the extra time before the first token consumed the gain.

The limit is **131,072 input plus output tokens**, not a promise to accept a 131,072-token prompt and then generate more. The tested boundary uses a 512-token output reserve. I see that maximum as room for a large ingestion or a long session, not as a low-latency turn.

## Turning a good run into the setup I use

The August 20 migration promoted the working stack to my request-driven serving profile. The backend starts when needed, shuts down after idle, and stays behind the manager rather than being exposed directly. The deployment record includes smoke checks, idle/restart checks, and an actual rollback-and-redeploy rehearsal.

Production startup reported **17.38 GiB for model loading**, **5.65 GiB available for KV**, and **140,530 tokens of KV capacity** with prefix caching enabled. Those are startup allocation observations, not a breakdown of every byte of device memory. I kept the configured sequence limit below that reported capacity.

Prefix caching matters because coding sessions repeat context. In the separate activation canary, an exact repeat of a **43,264-token chat prompt reused 39,936 tokens** and returned identical output token IDs. A 94-token repeat had zero hits, consistent with the cache block granularity. This was a functional check, not a cache-speed benchmark or a complete eviction, restart, and tool-call qualification campaign.

This August 20 profile is **text-only**, with tool calling configured through `qwen3_xml`. Vision is not enabled. I am also not claiming a new model-quality score: coherent benchmark completions are a necessary gate, not proof of coding-task success or full distributional equivalence.

Those boundaries do not change how I feel about using it. This is the local setup I love now: the same B70, with a serving stack I can inspect and pin, a model I want to use, and MTP4 doing useful work instead of sitting disabled.

## Evidence, credits, and the earlier chapter

The new public bundle contains:

- [All 24 reduced measured-run records](/data/b70-workhorse/qwen38-20260820-runs.jsonl), including timings, token counts, acceptance measurements, and original output hashes.
- [The eight-cell summary and recorded correctness outcome](/data/b70-workhorse/qwen38-20260820-results.json).
- [Setup, methodology, source hashes, and production differences](/data/b70-workhorse/qwen38-20260820-methodology.json).
- [Bundle notes and reproduction boundaries](/data/b70-workhorse/qwen38-20260820-README.md), plus the [chart generator](/data/b70-workhorse/generate-b70-qwen38-figures.mjs).

The recipe, checkpoint, and runtime patches are credited to the linked upstream cookbook and model repository. GPT-5.6 Sol helped me with the vLLM work. The throughput numbers are from the retained August 20 campaign, not new runs performed for this rewrite. The public reduction lets readers check the arithmetic; original prompts, completions, and private operational captures are not included, so it does not independently establish the recorded semantic review.

The [earlier version of this article](https://github.com/achuthanmukundan00/achu.dev/blob/d77952f54ae72e9c5dd29c913c487517f2728a54/src/pages/notes/intel-arc-pro-b70-inference-stack.md) and its [original evidence bundle](/data/b70-workhorse/README.md) remain available. That chapter covers Qwen3.6, AutoRound, Gemma, GGUF, and the MTP failures on those stacks. Its numbers have not been rewritten into Qwen3.8 results.

The lesson I took from it is not “MTP is bad” or “the B70 is slow.” It is that the serving stack was worth changing. Leaving llm-scaler behind and working through patched vLLM turned this from a collection of limitations into a machine I enjoy using.
