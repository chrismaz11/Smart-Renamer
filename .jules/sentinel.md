## 2024-05-22 - [CRITICAL] Command Injection via Filename
**Vulnerability:** The `extractFrames` function used `child_process.exec` with a concatenated command string including the input filename. This allowed command injection if the filename contained quotes and shell metacharacters.
**Learning:** Even when wrapping variables in quotes, `exec` is unsafe for user-controlled input because it spawns a shell. Malicious filenames can break out of quotes.
**Prevention:** Use `child_process.execFile` (or `spawn`) with an argument array. This passes arguments directly to the executable without shell interpretation, neutralizing shell metacharacters.
