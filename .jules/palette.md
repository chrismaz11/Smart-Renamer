## 2024-05-22 - Testing Vanilla JS in Jest
**Learning:** Testing non-module vanilla JS files (like `public/renderer.js`) in Jest requires reading the file string and using `eval()` within a `jsdom` environment. Wrapping code in an IIFE `(function(){ ... })()` avoids scope pollution and allows `const` redeclarations across tests if managed correctly.
**Action:** Use the `eval(IIFE)` pattern when adding tests for legacy/vanilla frontend scripts in this project.
