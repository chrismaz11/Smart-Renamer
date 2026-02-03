## 2025-05-21 - Command Injection in Frame Extraction
**Vulnerability:** Unsanitized user input (`inputFile`) passed to `child_process.exec` in `src/utils/extract-frames.js` allowed arbitrary command execution.
**Learning:** Even with double quotes, shell commands are vulnerable to injection. `ffmpeg` and `ffprobe` operations often involve file paths that can be malicious.
**Prevention:** Always use `execFile` or `spawn` with argument arrays when invoking external binaries. Never use `exec` with user-controlled strings.
