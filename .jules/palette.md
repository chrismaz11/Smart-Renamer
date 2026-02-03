# Palette's Journal

## 2024-05-22 - Async Loading Feedback
**Learning:** In Vanilla JS/Electron apps, button state management for async operations requires careful manual handling to prevent stuck states.
**Action:** Use a `setLoading(btn, bool)` helper with `try...finally` blocks in event listeners to guarantee state restoration even on error.
