## 2025-05-18 - File Traversal Optimization
**Learning:** Using `fs.readdir` with `{ withFileTypes: true }` provides ~8x performance improvement over `fs.readdir` + `fs.stat` loop for large directories (5000 files).
**Action:** Always prefer `withFileTypes: true` when iterating directories if file type checks are needed.
