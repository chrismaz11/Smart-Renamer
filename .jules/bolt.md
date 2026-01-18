## 2025-05-22 - Parallel File Processing
**Learning:** In `processDirectory.js`, files were processed sequentially using `await` inside a `for` loop. This significantly slowed down processing.
**Action:** Implemented a concurrency limiter (`limitConcurrency`) and used `Promise.all` to process files in parallel with a limit of 5. Crucially, I processed subdirectories *sequentially* (after file processing) to prevent recursive concurrency fan-out ($5^N$ tasks), which could crash the system on deep directory trees.
