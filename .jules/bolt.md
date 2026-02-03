## 2025-02-20 - Optimizing Directory Traversal
**Learning:** `fs.readdir` with `{ withFileTypes: true }` avoids O(n) `fs.stat` calls, reducing directory traversal time by ~100x for large directories. It returns `Dirent` objects which provide `isFile()`, `isDirectory()`, etc.
**Action:** Always use `withFileTypes: true` when iterating over directories if you need file types. Handle symbolic links explicitly as `fs.Dirent` does not follow them by default (unlike `fs.stat`).
