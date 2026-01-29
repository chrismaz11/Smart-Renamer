## 2024-05-22 - Vanilla JS Loading State Pattern
**Learning:** In Vanilla JS apps using Tailwind, managing button loading states requires manual DOM manipulation. A reusable `setLoading` helper that toggles `disabled` and injects an SVG spinner while preserving original text via `dataset` is a robust pattern.
**Action:** Always wrap async handlers in `try...finally` to ensure `setLoading(btn, false)` is called, preventing "stuck" UI states.
