## 2025-02-19 - Directory Traversal Optimization
**Learning:** `fs.readdir` with `withFileTypes: true` significantly reduces syscalls by avoiding `fs.stat` for every file, providing ~30x speedup for large directories (5000 files).
**Action:** Always prefer `withFileTypes: true` when iterating directories if file type information is needed.
