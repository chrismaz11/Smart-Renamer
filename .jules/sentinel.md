## 2025-02-18 - Command Injection via `child_process.exec`
**Vulnerability:** The application was using `child_process.exec` to run `ffmpeg` and `ffprobe` commands, directly interpolating user-controlled filenames into the command string.
**Learning:** Even when filenames are wrapped in quotes, `exec` spawns a shell, which can interpret certain sequences (like `$(...)` or backticks if not properly escaped, or if the quotes are broken) to execute arbitrary code.
**Prevention:** Always use `child_process.execFile` (or `spawn`) with an array of arguments when executing external binaries with user input. This passes arguments directly to the process without invoking a shell.
