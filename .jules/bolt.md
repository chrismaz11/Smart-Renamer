## 2024-05-22 - [Optimizing Directory Scanning]
**Learning:** Using `fs.readdir(path, { withFileTypes: true })` avoids the need for subsequent `fs.stat` calls for each file, significantly reducing I/O operations when iterating over directories.
**Action:** Always check if `fs.readdir` provides enough information (via `Dirent` objects) before reaching for `fs.stat`.

## 2024-05-22 - [Parallelizing File Processing]
**Learning:** Sequential processing of independent files (especially when involving I/O or API calls) is a major bottleneck. A simple concurrency limiter (like `p-limit` or a custom implementation) can drastically improve throughput without overwhelming resources.
**Action:** Use a concurrency limiter to parallelize `map` operations over arrays of items that require async processing.
