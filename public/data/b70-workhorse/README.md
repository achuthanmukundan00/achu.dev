# Intel Arc Pro B70 benchmark data

This directory contains the reduced public data used by the B70 article published on July 25, 2026.

## Files

- `measurements.json` records the device summary, method, quantization settings, and startup memory figures.
- `selected-results.jsonl` contains 19 passing benchmark rows with descriptive public IDs.
- `quality-summary.json` contains the aggregate Gemma 4 12B BF16 and AutoRound quality results.
- `quality-provenance.json` records the shared controls, evaluation shape, and limitations of that quality run.
- `rejected-mtp-result.json` records the corrected 35B and dense 27B MTP checks, the unsafe graph-replay boundary, matched throughput, and native-KV capacity.
- `gguf-q5-evidence.json` records the Q5_K_XL fit estimate and shallow gate that were excluded from the 115K chart.
- `device-evidence.txt` records the reduced device check used to confirm XPU execution.
- `qwen35-runtime-evidence.txt` records the public runtime settings and measured headline result.
- `xe2-graph-capture.patch` contains the paged-decode and chunk-prefill kernel change used by the MoE build.
- `turboquant-workspace-patch.py` contains the workspace reservation patch used by the vLLM builds.

The charts are generated from these files with `scripts/generate-b70-figures.mjs`. The exact [generator source](https://achumukundan.dev/data/b70-workhorse/generate-b70-figures.mjs) is served with the bundle.

```sh
node scripts/generate-b70-figures.mjs
```

## Measurement scope

The headline workload used a 131,072-token server context, 115,404 prior tokens, a 2,048-token prompt, 512 generated tokens, and concurrency 1. The harness ran short warmups, a coherence check, and a latency probe before recording one full workload run. The 19 rows in `selected-results.jsonl` are single-run observations.

The later MTP investigation is separate. Its matched throughput profiles use graph-disabled execution, native KV, concurrency 1, one discarded warmup, and three measured runs per depth. The file reports medians and keeps its quality and capacity limits explicit.

vLLM and llama.cpp used their own tested scheduler and batch settings. These rows compare the complete runtime and weight-format paths. They do not isolate quantization format, kernel implementation, or scheduler policy.

The main quality suite covers Gemma 4 12B BF16 and AutoRound INT4. It does not cover the W4A16 or GGUF checkpoints. The MTP file contains narrower same-checkpoint coherence and teacher-forced checks; those are not broad quality evaluations.

## Public-data boundary

The bundle omits hostnames, network details, PCI bus topology, exact host patch versions, command lines, container names and digests, private repository revisions, source-file hashes, local paths, raw logs, and run timestamps. None of those fields are needed to interpret the published measurements.
