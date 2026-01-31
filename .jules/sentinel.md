## 2025-05-13 - Command Injection in Shell Execution
**Vulnerability:** `child_process.exec` spawns a shell and interprets the command string. Concatenating user input (filenames) into this string allows Command Injection even if quoted (e.g., via shell metacharacters).
**Learning:** Quoting arguments in `exec` is insufficient protection. The vulnerability existed because `exec` was used for convenience over `execFile` or `spawn`.
**Prevention:** Always use `child_process.execFile` or `child_process.spawn` with the `args` array option. This passes arguments directly to the process without shell interpretation.
