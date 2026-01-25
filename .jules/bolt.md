## 2026-01-25 - fs.readdir withFileTypes
**Learning:** Using `fs.readdir` with `{ withFileTypes: true }` avoids separate `fs.stat` calls for each file, which significantly reduces directory scanning time (observed ~7x speedup).
**Action:** Always prefer `withFileTypes: true` when iterating directories if you only need type information (file/dir/symlink).
