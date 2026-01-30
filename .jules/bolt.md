## 2024-05-23 - Partial File Reading for LLM Context
**Learning:** Reading entire files into memory just to extract the first few kilobytes for LLM context is a major bottleneck (memory and IO).
**Action:** Use `fs.open` and `fileHandle.read` with a buffer limit to read only what's necessary (e.g., first 20KB). This provided a ~17x speedup for 100MB files and prevented memory spikes. Ensure generic utilities support optional truncation to avoid breaking other consumers.
