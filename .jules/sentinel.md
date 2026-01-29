## 2025-05-22 - Command Injection in Frame Extraction
**Vulnerability:** Command injection in `src/utils/extract-frames.js` due to `exec` usage with unsanitized file paths.
**Learning:** `child_process.exec` spawns a shell, making it vulnerable to shell metacharacters in filenames.
**Prevention:** Always use `child_process.execFile` or `spawn` with an array of arguments, especially when handling user input or filenames.
