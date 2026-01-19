# Palette's Journal

## 2024-05-22 - Async Button States
**Learning:** Async operations in Electron renderers (like file renaming) must provide immediate visual feedback on the triggering element to prevent perceived unresponsiveness or double-submission.
**Action:** Use a reusable `setLoading` helper that swaps content with a spinner while preserving button width/height to avoid layout shifts.
