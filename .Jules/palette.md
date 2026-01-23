# Palette's Journal


## 2026-01-23 - Reusable Loading State
**Learning:** Managing button loading states requires consistent handling of disabled attributes, visual cues (spinners), and text restoration.
**Action:** Adopt the `setLoading` pattern: cache original text in `dataset.originalText`, inject an SVG spinner with Tailwind utility classes (`animate-spin`), and wrap async operations in `try...finally` to guarantee state reset.
