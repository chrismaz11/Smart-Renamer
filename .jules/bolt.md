## 2025-05-20 - Sequential fs.stat in directory scanning
**Learning:** Using `fs.readdir` without `withFileTypes: true` forces an additional `fs.stat` call for every file, which is a significant bottleneck in large directories.
**Action:** Always use `fs.readdir(path, { withFileTypes: true })` and `Dirent` methods to avoid redundant syscalls.
