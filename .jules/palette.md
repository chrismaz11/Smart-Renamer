# Palette's Journal

**Boundaries:**
- ONLY add critical UX/a11y learnings
- Format: `## YYYY-MM-DD - [Title]`

## 2025-10-26 - [Async Button Loading State]
**Learning:** Using `setLoading(button, isLoading)` helper with `try...finally` ensures buttons are reliably reset even if errors occur, preventing "stuck" UI states during async operations.
**Action:** Apply this pattern to all async action buttons (like file processing or network requests) to improve perceived performance and prevent double-submissions.
