#!/usr/bin/env python3
"""Apply the graph-safe TurboQuant continuation-prefill workspace fix."""

import argparse
from pathlib import Path


TURBOQUANT_MARKER = """        self.max_num_kv_splits = (
            vllm_config.attention_config.tq_max_kv_splits_for_cuda_graph
        )

    def _flash_attn_varlen(
"""

IMPORT_MARKER = """from vllm.config.cache import CacheDType
"""

IMPORT_REPLACEMENT = """from vllm.config.cache import CacheDType
from vllm.logger import init_logger

logger = init_logger(__name__)
"""

TURBOQUANT_REPLACEMENT = """        self.max_num_kv_splits = (
            vllm_config.attention_config.tq_max_kv_splits_for_cuda_graph
        )

    def reserve_continuation_prefill_workspace(self, max_model_len: int) -> None:
        \"\"\"Reserve shared full-dequant buffers before graph workspace lock.\"\"\"
        if max_model_len <= _CONTINUATION_DECODE_THRESHOLD:
            return
        # TurboQuant supports KV block sizes through 256. Rounding to the
        # largest supported block size safely covers every runtime layout.
        alloc_len = math.ceil(max_model_len / 256) * 256
        buf_shape = (1, self.num_kv_heads, alloc_len, self.head_size)
        current_workspace_manager().get_simultaneous(
            (buf_shape, torch.float16),
            (buf_shape, torch.float16),
        )
        logger.info_once(
            \"Reserved TurboQuant continuation-prefill workspace for %d tokens\",
            alloc_len,
        )

    def _flash_attn_varlen(
"""

RUNNER_MARKER = """        # Trigger CUDA graph capture for specific shapes.
        # Capture the large shapes first so that the smaller shapes
        # can reuse the memory pool allocated for the large shapes.
        set_cudagraph_capturing_enabled(True)
"""

RUNNER_REPLACEMENT = """        # Reserve backend-specific maximum workspaces before graph capture.
        # Captured graphs may retain views into this shared allocation, so it
        # must reach its maximum size before capture and subsequent locking.
        for layer in self.compilation_config.static_forward_context.values():
            impl = getattr(layer, \"impl\", None)
            reserve = getattr(impl, \"reserve_continuation_prefill_workspace\", None)
            if reserve is not None:
                reserve(self.max_model_len)

        # Trigger CUDA graph capture for specific shapes.
        # Capture the large shapes first so that the smaller shapes
        # can reuse the memory pool allocated for the large shapes.
        set_cudagraph_capturing_enabled(True)
"""


def replace_once(path: Path, marker: str, replacement: str) -> None:
    source = path.read_text()
    if replacement in source:
        return
    count = source.count(marker)
    if count != 1:
        raise RuntimeError(f"expected one patch marker in {path}, found {count}")
    path.write_text(source.replace(marker, replacement, 1))


def patch_root(root: Path) -> None:
    package = root / "vllm"
    if not package.is_dir():
        return
    replace_once(
        package / "v1/attention/backends/turboquant_attn.py",
        IMPORT_MARKER,
        IMPORT_REPLACEMENT,
    )
    replace_once(
        package / "v1/attention/backends/turboquant_attn.py",
        TURBOQUANT_MARKER,
        TURBOQUANT_REPLACEMENT,
    )
    replace_once(
        package / "v1/worker/gpu_model_runner.py",
        RUNNER_MARKER,
        RUNNER_REPLACEMENT,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("roots", nargs="+", type=Path)
    args = parser.parse_args()
    patched = 0
    for root in args.roots:
        if (root / "vllm").is_dir():
            patched += 1
        patch_root(root)
    if patched == 0:
        raise RuntimeError("no vLLM package roots found")


if __name__ == "__main__":
    main()
