## 2024-05-22 - fs.readdir withFileTypes
**Learning:** `fs.readdir` with `{ withFileTypes: true }` avoids N+1 `fs.stat` calls during directory traversal.
**Action:** Always check if file type information is needed when listing directories and use `withFileTypes` to get `Dirent` objects directly.
