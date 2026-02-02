## 2025-05-21 - Async Loading States
**Learning:** Users lack feedback during long-running AI operations (renaming, reading directories). Adding a `setLoading` helper that toggles `disabled`, `opacity-75`, `cursor-not-allowed` and injects a spinner SVG is a reusable pattern here.
**Action:** Always wrap async event listeners in `try...finally` to ensure the loading state is reset, even on errors. Use `dataset.originalText` to restore button content.
