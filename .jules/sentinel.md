## 2025-02-18 - Command Injection in Video Processing
**Vulnerability:** `src/utils/extract-frames.js` used `child_process.exec` with a concatenated string including the user-supplied filename to run `ffmpeg` and `ffprobe`. This allowed arbitrary command execution via malicious filenames.
**Learning:** Even when inputs are wrapped in quotes, shell injection is trivial with `exec`. The developer likely assumed quotes were sufficient sanitization.
**Prevention:** Always use `child_process.execFile` (or `spawn`) with an argument array when invoking external programs with user input. This bypasses the shell entirely, treating arguments as raw strings.
