## 2025-05-15 - Command Injection in Frame Extraction
**Vulnerability:** User-controlled filenames were interpolated directly into shell commands (`exec`) in `src/utils/extract-frames.js`, allowing arbitrary command execution if a file contained shell metacharacters.
**Learning:** Even desktop apps handling local files must treat filenames as untrusted input. `exec` spawns a shell and is inherently risky for variable arguments.
**Prevention:** Always use `child_process.execFile` with an argument array instead of string concatenation, preventing shell interpretation of the arguments.
