---
layout: ../../layouts/ArticleLayout.astro
title: "My Intel Arc Pro B70 inference setup, with the numbers"
description: "Patched vLLM, AutoRound INT4, a 47 tok/s run at 115K prior tokens, quality checks, and why MTP stayed off."
date: 2026-07-25
topic: "Local inference"
ogImage: "/images/notes/b70-workhorse/og.png"
ogImageAlt: "Intel Arc Pro B70 benchmark result: 3,377 prompt tokens per second and 47.03 generation tokens per second at 115,404 prior tokens"
---

I have rebuilt the software on this B70 enough times that a working API response is only the first check. A model can load and answer a prompt while an important kernel is running on an unexpected path.

My current serving path is patched vLLM on XPU with AutoRound INT4 weights. I use Qwen3.6-27B for daily work and occasionally switch to Ornith-1.0-35B. For the benchmark in this report, Qwen3.6-35B-A3B processed a 115,404-token prefix at 3,377 prompt tokens per second and generated at 47.03 tokens per second. That was one request, one measured run, 2,048 new prompt tokens, 512 generated tokens, native KV, and MTP off. Ornith reached 47.83 generation tokens per second under the same workload.

This article records the machine, patches, settings, raw rows, and quality checks behind those numbers.

## The machine

| Part | Measured setup |
| --- | --- |
| GPU | Intel Arc Pro B70 (Battlemage G31) |
| Memory | 32,656 MiB reported by PyTorch XPU |
| Software | Ubuntu Linux, `xe` driver, Level Zero runtime |
| XPU | One device, 256 compute units |

The [public device check](/data/b70-workhorse/device-evidence.txt) contains only the fields needed to confirm B70 execution through PyTorch XPU.

## The software I ended up with

My earlier B70 setup leaned on llama.cpp's SYCL backend. It is still useful, especially when I want to try a GGUF quickly. The current vLLM path gives me faster prompt processing on the models I run every day.

I keep separate patched vLLM builds for the dense and MoE models. The dense path uses Intel's XPU support plus the workspace fix described below. The MoE path also carries model support and graph-safe Xe2 kernels.

The MoE path needed two changes beyond model support.

First, DPC++ 2025.3 rejected `sycl_ext_oneapi_work_group_scratch_memory` while capturing an XPU graph. I changed the Xe2 paged-decode and multi-query chunk-prefill launches to pass dynamic shared memory through a local accessor. The full change is in [xe2-graph-capture.patch](/data/b70-workhorse/xe2-graph-capture.patch).

Second, TurboQuant could grow its continuation-prefill dequantization workspace after graph capture. The runtime now reserves the largest K/V workspace before vLLM locks graph memory. The small patcher is available as [turboquant-workspace-patch.py](/data/b70-workhorse/turboquant-workspace-patch.py).

The 35B benchmark server starts with the equivalent of:

```text
python -m vllm.entrypoints.openai.api_server \
  --model "$MODEL" \
  --served-model-name local-model \
  --max-model-len 131072 \
  --max-num-seqs 1 \
  --max-num-batched-tokens 8192 \
  --gpu-memory-utilization 0.90 \
  --kv-cache-dtype auto \
  --compilation-config \
    '{"cudagraph_mode":"FULL_DECODE_ONLY","cudagraph_capture_sizes":[1,2]}'
```

The scheduler batch ceiling is 8,192 tokens. Context length is configured separately at 131,072. In a Gemma 8K pair, raising the scheduler ceiling from 4,096 to 8,192 changed prompt processing from 2,802.90 to 2,862.46 tokens per second. Decode stayed close at 45.64 and 45.43 tokens per second. Each cell was one run.

The AutoRound checkpoints use symmetric 4-bit weights, group size 128, and `auto_round:auto_gptq` packing. Their metadata keeps selected gates and layers at higher precision. Gemma's QAT W4A16 checkpoint uses symmetric 4-bit group-32 weights through compressed-tensors. Native KV cache remained enabled for the main results.

## How I measured it

My benchmark harness launched each server and sent the same workload shape.

The long-context command used these settings:

```text
--pp 2048
--tg 512
--depth 115404
--runs 1
--warmup-runs 0
--exact-tg
--latency-mode generation
--no-cache
```

Here, `depth` is the existing prefix before the 2,048-token measured prompt. It is not the final fill. The headline request ended at 117,964 tokens, about 90% of the configured 131,072-token window.

Before the measured request, the client sent a short user warmup, a system-and-probe warmup, a fixed coherence check, and a latency probe. `--warmup-runs 0` means it did not run a second full 115K workload as warmup.

Every throughput cell below is a single-run observation. There is no standard deviation or confidence interval for these rows. I use them to compare configurations on this machine, then rerun a cell when a result changes a decision.

vLLM and llama.cpp had their own batch settings. vLLM used an 8,192-token scheduler ceiling. llama.cpp used batch and microbatch sizes of 4,096. The runtime, scheduler, kernels, and weight format change together, so the table compares complete serving paths.

## The 115K-token run

<figure>
  <img src="/images/notes/b70-workhorse/long-context-throughput.svg" alt="Six single-run long-context results. Qwen 35B-A3B AutoRound reached 3,377 prompt and 47.03 generation tokens per second; its Q4_K_S GGUF row reached 528 and 42.63. Ornith AutoRound reached 3,313 and 47.83; GGUF reached 526 and 42.69. Qwen 27B AutoRound reached 1,025 and 21.73; GGUF reached 130 and 10.69." width="1200" height="720" loading="lazy" decoding="async" />
  <figcaption>131,072 context, 115,404 prior tokens, PP2048, TG512, concurrency 1. Each cell is one measured run.</figcaption>
</figure>

| Model | Serving path | Weight file | Prompt tok/s | Generation tok/s |
| --- | --- | --- | --- | --- |
| Qwen3.6-27B | vLLM, AutoRound | 17.69 GiB | 1,024.544 | 21.728 |
| Qwen3.6-27B | llama.cpp, Q4_K_S | 15.01 GiB | 130.362 | 10.686 |
| Qwen3.6-35B-A3B | vLLM, AutoRound | 20.02 GiB | 3,377.134 | 47.031 |
| Qwen3.6-35B-A3B | llama.cpp, Q4_K_S | 19.92 GiB | 528.035 | 42.634 |
| Ornith-1.0-35B | vLLM, AutoRound | 19.05 GiB | 3,312.759 | 47.827 |
| Ornith-1.0-35B | llama.cpp, Q4_K_S | 19.46 GiB | 526.091 | 42.690 |

The Qwen 35B files are close in size, which makes that pair useful. The vLLM path generated about 10% faster and processed the long prompt about 6.4 times faster in these two runs. The result includes all of the runtime differences listed above.

For the Qwen 35B AutoRound row, time to first response was 34.9 seconds and the timed benchmark phase took 50.8 seconds. The prompt and generation rates describe different phases of the request.

## Memory at startup

vLLM prints model allocation and available KV memory after profiling. These are separate reported buckets, and runtime overhead sits outside the chart.

<figure>
  <img src="/images/notes/b70-workhorse/startup-memory.svg" alt="vLLM startup memory. Qwen 27B AutoRound loaded in 17.75 GiB with 9.04 GiB available for KV. Qwen 35B-A3B used 19.60 and 5.69. Ornith 35B used 19.06 and 6.23. Gemma 12B AutoRound used 7.63 and 19.13. Gemma 12B BF16 used 22.73 and 7.58." width="1200" height="720" loading="lazy" decoding="async" />
  <figcaption>The BF16 Gemma row used 0.98 GPU memory utilization. The other rows used 0.90.</figcaption>
</figure>

| Model | Model load | Available KV | KV capacity | GPU memory setting |
| --- | --- | --- | --- | --- |
| Qwen3.6-27B AutoRound | 17.75 GiB | 9.04 GiB | 144,079 tokens | 0.90 |
| Qwen3.6-35B-A3B AutoRound | 19.60 GiB | 5.69 GiB | 289,626 tokens | 0.90 |
| Ornith-1.0-35B AutoRound | 19.06 GiB | 6.23 GiB | 317,109 tokens | 0.90 |
| Gemma 4 12B AutoRound | 7.63 GiB | 19.13 GiB | 700,098 tokens | 0.90 |
| Gemma 4 12B BF16 | 22.73 GiB | 7.58 GiB | 205,455 tokens | 0.98 |

The 12B AutoRound checkpoint leaves much more room for cache and concurrent requests. The BF16 row was a fit probe at 0.98, not a current serving setting. I now cap the Intel profiles at 0.90 to keep practical cache and runtime headroom.

## Gemma at shorter and deeper contexts

I used Gemma 4 12B to compare BF16, AutoRound, and the QAT W4A16 checkpoint in the same vLLM environment.

<figure>
  <img src="/images/notes/b70-workhorse/gemma-4k-throughput.svg" alt="Gemma 4 12B single-run throughput at 4K context. BF16 reached 4,420 prompt and 21.26 generation tokens per second. AutoRound reached 3,364 and 51.86. QAT W4A16 reached 628 and 19.27." width="1200" height="720" loading="lazy" decoding="async" />
  <figcaption>Depth 1,126, PP2048, TG512, concurrency 1. W4A16 quality was not measured in the paired suite.</figcaption>
</figure>

AutoRound's 51.86 generation tokens per second is useful for interactive work. BF16 processed the prompt faster but generated at 21.26 tokens per second. The W4A16 checkpoint reached 19.27 generation tokens per second and only 628 prompt tokens per second on this path.

Long prefixes reduce decode speed for both Gemma checkpoints:

<figure>
  <img src="/images/notes/b70-workhorse/gemma-depth.svg" alt="Gemma generation throughput by prefix depth. AutoRound measured 51.86 tokens per second at depth 1,126, 45.43 at 4,812, and 16.75 at 115,404. BF16 measured 21.26, 20.08, and 11.38." width="1200" height="720" loading="lazy" decoding="async" />
  <figcaption>The depth axis is logarithmic. Every point is one run at concurrency 1.</figcaption>
</figure>

At 115,404 prior tokens, AutoRound still generated at 16.75 tokens per second. BF16 reached 11.38. Both rows fit completely on the B70.

For several shorter requests, aggregate throughput rises with concurrency:

<figure>
  <img src="/images/notes/b70-workhorse/gemma-concurrency.svg" alt="Gemma aggregate generation throughput at 8K context. AutoRound measured 45.43 tokens per second at concurrency 1, 73.46 at concurrency 2, and 109.56 at concurrency 4. BF16 measured 20.08 at concurrency 1 and 64.85 at concurrency 4." width="1200" height="720" loading="lazy" decoding="async" />
  <figcaption>Depth 4,812 with PP2048 and TG512 per request. Values are aggregate tokens per second.</figcaption>
</figure>

The 109.56 figure is aggregate generation throughput across four requests. It should not be read as the speed of each request.

## I rebuilt the MTP path before rejecting it

Multi-token prediction uses a draft head to propose extra tokens, then asks the target model to verify them. It can help only when accepted tokens repay the extra draft and verification work.

My first Qwen3.6-35B-A3B MTP run failed coherence before timing. That was not enough evidence to blame MTP. The checkpoint's external AutoRound metadata described the target layers but omitted `mtp.layers`, so I built two controls: a BF16 MTP overlay and a corrected INT4 derivative whose metadata also covers the draft layer.

With compilation enabled and XPU graph replay disabled, both variants passed all six deterministic coherence cases. On the corrected INT4 checkpoint, MTP off and MTP 1 also returned the same mean NLL, `2.100549`, and perplexity, `8.170654`, over the same 209 teacher-forced tokens.

Turning target graph replay back on corrupted output again. I reproduced that boundary with the BF16 and corrected INT4 drafts, an eager draft against a graphed target, `PIECEWISE` graph mode, an alternate attention backend, and n-gram speculation. An input-copy setting failed during startup. This is a result for this patched XPU stack, not a claim about every graph implementation. On this stack, speculative decoding plus target graph replay is unsafe.

I timed the coherent graph-disabled profiles separately. Both used the corrected 35B checkpoint, native KV, concurrency 1, a 2,048-token new prompt, an exact 512-token completion, fixed greedy controls, one discarded warmup, and three measured runs per depth. These are median generation rates:

| Configured prior target | MTP off tok/s | MTP 1 tok/s | MTP 1 / off | Draft acceptance |
| ---: | ---: | ---: | ---: | ---: |
| 4,096 | 26.962 | 34.774 | 1.290× | 63.4% |
| 32,768 | 27.188 | 25.120 | 0.924× | 72.4% |
| 65,536 | 27.281 | 15.473 | 0.567× | 65.4% |
| 81,920 | 27.215 | 13.039 | 0.479× | 64.3% |
| 115,404 | 27.077 | 11.501 | 0.425× | 90.0% |

At the deepest configured target, the new prompt and chat template brought the actual measurement prompt to 117,455 tokens. The request ended at 117,967 filled tokens after the 512-token completion.

MTP 1 helped at 4K, lost by 32K, and was 57.5% slower at the 115K target despite 90% draft acceptance. Acceptance alone did not pay for the longer speculative round.

The control for that table is the graph-disabled MTP-off profile at 27.08 tok/s. It is not interchangeable with the graph-enabled, non-speculative 47.03 tok/s result above. Subtracting 11.50 from 47.03 would mix execution modes. In a separate single-run llama.cpp SYCL check at the same 115,404-token workload, embedded MTP 1 also reduced Qwen 35B generation from 42.63 to 38.25 tok/s.

I then tested [a dense 27B AutoRound MTP checkpoint](https://huggingface.co/lyf/Qwen3.6-27B-heretic-v2-mtp-int4-AutoRound) whose embedded metadata already covers both the target and draft layers. Compilation stayed on, graph replay stayed off, and MTP depths one through four used the same prompts and controls. Every profile passed 6/6 coherence cases. Three repeated 209-token likelihood checks had overlapping ranges, including a `0.003322` mean-NLL spread in MTP off itself.

| MTP depth | 4K tok/s | 4K acceptance | 32K tok/s | 32K acceptance |
| ---: | ---: | ---: | ---: | ---: |
| Off | 27.006 | n/a | 24.838 | n/a |
| 1 | 7.177 | 69.6% | 5.726 | 66.2% |
| 2 | 8.510 | 52.7% | 6.661 | 48.5% |
| 3 | 9.341 | 43.5% | 7.880 | 43.6% |
| 4 | 9.206 | 33.2% | 7.227 | 32.1% |

The 4K and 32K targets produced actual measurement prompts of 6,146 and 34,819 tokens after the new prompt and chat template. They ended at 6,658 and 35,331 filled tokens. MTP 3 was the best speculative profile, but reached only 34.6% and 31.7% of the matched MTP-off rate.

The loss came from iteration cost. At 4K, a normal decode step took about 37.0 ms. An MTP-3 round took 247.6 ms and returned 2.31 output tokens on average. The round cost 6.69 times a baseline step, while three draft tokens can return at most four output tokens. Even perfect acceptance could not break even in this implementation. The checkpoint uses a full 5,120-wide dense draft layer and a large BF16 vocabulary head, followed by target verification and hybrid-attention state work. Safe graph-disabled execution also leaves those launches separate.

Capacity also ruled out a 115K dense test. I report cold starts because warm compilation artifacts changed earlier capacity estimates. With MTP 4 and native KV, `gpu_memory_utilization` settings of 0.80, 0.85, and 0.90 produced 26,869, 36,372, and 46,202 KV-cache tokens. The 90% setting leaves room for the 32K comparison but cannot support a filled 115K MTP-4 run. That setting controls allocation capacity, not GPU compute utilization.

Full 512-token output hashes differed across speculative profiles, but MTP off itself produced three different hashes at each depth. I do not attribute every long-generation difference to MTP, and the short checks do not establish broad quality or parity with the upstream checkpoint. They establish enough coherence to make the negative throughput result useful.

I kept MTP disabled. The reduced [MTP investigation record](/data/b70-workhorse/rejected-mtp-result.json) contains the graph failure matrix, matched medians, repeated quality checks, and capacity sweep without host-specific commands or build identifiers.

## Faster B70 posts measure different workloads

The 47.03 tok/s row is not a claim that the B70 tops out at 47. It is a single-request serving result after 115,404 prior tokens. Several faster public numbers describe different work:

| Public result | Conditions reported by its author |
| --- | --- |
| [About 130 tok/s](https://www.reddit.com/r/LocalLLM/comments/1uupa39/intel_arc_pro_b70_32gb_battlemage_with/) | Qwen3.6-35B-A3B UD-Q4_K_XL, llama.cpp Vulkan, embedded MTP, F16 KV, one coding prompt, 600 generated tokens at temperature 0.6, and a three-run median. The author labels the number shallow-context, says generation at 30K and beyond is roughly half, and treats 262K as capacity. |
| [About 75 tok/s at 120K; 213 tok/s at concurrency 4](https://www.reddit.com/r/LocalLLM/comments/1ut5wjf/intel_arc_b70_qwen_36_35b_a3b_int4_autoround_mtp/) | vLLM, AutoRound INT4, FP16 KV, and MTP. The 75 figure is the author's napkin-math projection from a context curve, not a published measured 120K row. The 213 figure is aggregate throughput across four requests at about 120K combined context. Draft depth, generation length, controls, and run aggregation are not reported. |
| [70.54 ± 0.12 tok/s](https://www.reddit.com/r/LocalLLaMA/comments/1tukrtf/qwen_3635ba3b_with_977_tks_prompt_processing_and/) | Qwen3.6-35B-A3B Q4_K_M, llama.cpp SYCL, Q8 KV, and a `tg128` llama-bench row, with no speculative configuration shown. The 262K figure is configured capacity; the filled decode depth for the speed row is not reported. |
| [130.90 ± 13.08 tok/s at concurrency 32](https://www.reddit.com/r/LocalLLaMA/comments/1siar7y/intel_arc_pro_b70_32gb_performance_on_qwen3527bq4/) | Qwen3.5-27B AutoRound, vLLM without a speculative configuration, a 4,096-token server limit, and aggregate `tg512` throughput. The same table reports 5.22 tok/s per request at concurrency 32 and 13.43 tok/s at concurrency 1. |

I think all of these observations can be real. None matches the checkpoint, backend, weight format, MTP mode, KV type, filled context, generation length, concurrency, controls, and run aggregation used for my 47.03 row. The closest deep-context claim is still an extrapolation with MTP enabled, while 213 tok/s is a batching result. A ranking needs a shared model and harness, not a conversion between these numbers.

## KV compression stayed off too

I tested compressed KV because the memory savings looked attractive. Qwen3.6-27B already fits the 115K workload with native KV, and the tested compressed modes were slower:

| KV mode | Prompt tok/s | Generation tok/s |
| --- | ---: | ---: |
| Native | 1,024.544 | 21.728 |
| TurboQuant K4/V4 | 1,026.517 | 11.071 |
| TurboQuant K8/V4 | 1,034.029 | 7.501 |

Those are single-run cells on the same long-context shape. They test performance, not cache-compression quality. I kept native KV for the serving profiles in this article.

## What INT4 changed in the quality run

I also needed a quality check before choosing a default. I ran a paired suite on Gemma 4 12B BF16 and AutoRound INT4 using the same runtime settings, tokenizer, explicit chat template, and datasets.

The fixed-target scores are conditional assistant-target perplexity. They score known assistant continuations after the chat template. They are different from raw base-model perplexity.

| Target set | Cases | Tokens | BF16 | AutoRound | AutoRound / BF16 |
| --- | --- | --- | --- | --- | --- |
| WikiText-2 prose | 16 | 11,074 | 66.2308 | 73.3801 | 1.1079× |
| HumanEval canonical code | 64 | 3,968 | 3.7503 | 3.4881 | 0.9301× |

AutoRound lost ground on held-out prose. It scored slightly better on these fixed HumanEval code targets. This HumanEval measurement is token likelihood over canonical completions; it is not a code execution pass rate.

I also sampled 24 sequences in each direction and rescored 4,608 tokens per direction:

| Direction | KL nats/token | 95% bootstrap interval |
| --- | --- | --- |
| BF16 to AutoRound | 0.11911 | `[0.09952, 0.14005]` |
| AutoRound to BF16 | 0.11862 | `[0.08967, 0.14864]` |

<figure>
  <img src="/images/notes/b70-workhorse/gemma-quality.svg" alt="Paired Gemma quality results. AutoRound's conditional perplexity ratio was 1.108 on WikiText-2 and 0.930 on HumanEval code. Forward KL was 0.119 nats per token with a 95 percent interval from 0.100 to 0.140. Reverse KL was 0.119 with an interval from 0.090 to 0.149." width="1200" height="720" loading="lazy" decoding="async" />
  <figcaption>The perplexity ratios use BF16 as 1.0. The KL estimates use rendered and retokenized samples.</figcaption>
</figure>

Both models also passed the same 18 deterministic needle cases from 4K through 126K tokens. That small matrix found no retrieval separation. It does not set an upper bound on retrieval failures.

I keep BF16 as the teacher and fidelity reference. The prose regression and the two KL estimates show that AutoRound changed the distribution and lost information that BF16 retained. The HumanEval result keeps me from turning that into a claim that every task gets worse.

The Monte Carlo KL calculation omits the stop-token decision because returned text was rendered and tokenized again. The estimate comes from finite samples over those rendered sequences. Exact full-vocabulary KL at aligned hidden states was outside this run.

The [numeric summary](/data/b70-workhorse/quality-summary.json) and [quality run details](/data/b70-workhorse/quality-provenance.json) are in the public bundle. I did not record a revision for the evaluator script, so this evaluation cannot be recreated byte for byte. The public record keeps the shared controls, sampling settings, evaluation shape, and limitations.

I keep the QAT W4A16 checkpoint for a future accuracy-sensitive comparison, but I have not run this paired suite against it. Its 4K throughput cell is published above. I will leave its quality position open until the matching evaluation is done.

## Where GGUF still fits

I still reach for llama.cpp and GGUF when I want a one-file demo, a quick model swap, or a simple SYCL server. The 35B Q4_K_S files also decoded reasonably well in the long-context table.

Q4_K_S is too aggressive for me to use its similar file size as evidence of equal quality. I prefer Q5 or higher for coding work. A Qwen3.6-27B Q5_K_XL fit check estimated 18,563 MiB for model VRAM and 23,569 MiB total at 131K with Q8 KV, batch 2,048, and microbatch 512. The only speed check I found for that file was a shallow 1,101-token gate at about 8.6 generation tokens per second. There is no matched 115K quality and throughput run, so I left Q5_K_XL out of the comparison chart. The reduced record is in [gguf-q5-evidence.json](/data/b70-workhorse/gguf-q5-evidence.json).

I still need to rerun both paths with matched context, cache format, scheduler limits, output checks, and the same quality suite. I have not run those matching tests yet.

## How I check that the GPU ran it

An HTTP 200 and a stream of tokens do not prove XPU execution. For the Qwen 35B result, the evidence chain is:

1. The system device query identifies an Arc Pro B70 using the `xe` driver.
2. PyTorch sees one Level Zero XPU with 32,656 MiB.
3. vLLM initializes with `device_config=xpu`.
4. The server selects its XPU Flash Attention backend.
5. The server reports 19.6 GiB for model loading and 5.69 GiB available for the XPU KV cache.
6. The client passes its coherence check and records the exact 115K workload.

The reduced startup record and measured result are in [qwen35-runtime-evidence.txt](/data/b70-workhorse/qwen35-runtime-evidence.txt).

## What I run now

For daily work, I use Qwen3.6-27B with the patched dense vLLM build and AutoRound INT4 weights. I occasionally switch to Ornith-1.0-35B on the patched MoE build. MTP stays disabled for both. The Qwen3.6-35B-A3B checkpoint in this report was a benchmark target, not the model I keep in production.

Gemma 4 12B remains a quality and throughput comparison in this report. BF16 is the fidelity reference, and W4A16 remains an evaluation target until it has a paired quality result.

GGUF remains my easy demo and experimentation path. I choose Q5 or higher when output quality matters, as long as the context and batch profile still fit.

The public bundle includes [all 19 selected result rows](/data/b70-workhorse/selected-results.jsonl), the reduced [quality summary](/data/b70-workhorse/quality-summary.json), the [MTP investigation](/data/b70-workhorse/rejected-mtp-result.json), [measurement details](/data/b70-workhorse/measurements.json), and a short [README](/data/b70-workhorse/README.md). The [chart generator source](/data/b70-workhorse/generate-b70-figures.mjs) is published with them.
