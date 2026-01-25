## 2024-05-22 - Async Button Loading Pattern
**Learning:** This Vanilla JS app lacks a standardized way to handle async button states, leading to potential double-submits and lack of feedback.
**Action:** Adopt the `setLoading(btn, isLoading)` helper pattern using Tailwind's `animate-spin` and `opacity-75` for all future async actions.
