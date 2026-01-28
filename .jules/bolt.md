## 2024-05-23 - Directory Traversal Performance
**Learning:** Using `fs.readdir` without `withFileTypes: true` forces an additional `fs.stat` call per file, which is extremely expensive in this environment (likely due to sandbox or filesystem overhead).
**Action:** Always use `fs.readdir(path, { withFileTypes: true })` and rely on `Dirent` methods (`isFile()`, `isDirectory()`) instead of `fs.stat` when iterating directories. Only fall back to `fs.stat` for symbolic links if needed.
