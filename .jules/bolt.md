## 2024-05-23 - Directory Traversal Optimization
**Learning:** `fs.readdir` with `{ withFileTypes: true }` avoids N+1 `fs.stat` calls, providing ~18x speedup (717ms -> 40ms) for 5000 files in this codebase.
**Action:** Always use `withFileTypes` for directory scanning.

## 2024-05-23 - Exception-based Control Flow
**Learning:** `processDirectory.js` failed to pass `inputPath` to `processFile`, causing `path.relative` to throw exceptions for every file. These exceptions were caught and logged, masking the bug but severely impacting performance (and spamming logs).
**Action:** Ensure arguments are correctly passed to avoid "silent" exception loops.
