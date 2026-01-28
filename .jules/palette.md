## 2024-05-22 - Async Button Loading Pattern
**Learning:** The application lacks a standardized way to show loading states on buttons during async operations, leading to uncertainty.
**Action:** Adopt the `setLoading(button, isLoading)` helper pattern which disables the button, adds a spinner SVG, and preserves original text using `dataset.originalText`.
