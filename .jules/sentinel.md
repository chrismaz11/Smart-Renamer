## 2025-02-23 - Command Injection in Video Processing
**Vulnerability:** The `src/utils/extract-frames.js` module uses `child_process.exec` with unescaped user inputs (`inputFile` and `framesOutputDir`) to execute `ffmpeg` and `ffprobe` commands.
**Learning:** Using `exec` invokes a shell, which interprets metacharacters. Concatenating user input into shell commands allows attackers to execute arbitrary commands by injecting characters like `;`, `|`, or `$()`.
**Prevention:** Always use `child_process.execFile` (or `spawn`) which takes the command and an array of arguments. This bypasses the shell and treats arguments as literal strings, preventing injection.
