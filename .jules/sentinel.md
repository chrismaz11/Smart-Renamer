## 2025-10-26 - [CRITICAL] Command Injection in Frame Extraction
**Vulnerability:** Found use of `child_process.exec` with unsanitized user input (filenames) in `src/utils/extract-frames.js`. This allows attackers to execute arbitrary commands by crafting malicious filenames (e.g., `video"; rm -rf /; ".mp4`).
**Learning:** String interpolation for shell commands is inherently unsafe when handling user input. Even "internal" tools like ffmpeg wrappers can be vectors if they use shell execution.
**Prevention:** Always use `child_process.execFile` or `spawn` with an array of arguments. This bypasses the shell and treats arguments as data, not code. Prohibit `exec` for anything involving dynamic input.
