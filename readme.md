# Smart Renamer

Smart Renamer is a desktop app (Electron) and CLI that uses local or hosted LLMs to rename and organize files based on their contents. It supports providers like Ollama, LM Studio, and OpenAI, and includes a lightweight file-manager style UI for previewing renames before applying them.

## Features

- Rename files using AI-generated names.
- Preview old and new names before applying changes.
- Organize files with date and type-based rules.
- Works as both a CLI and Electron desktop app.

## Requirements

- Node.js 18+ (recommended for the Electron runtime).
- macOS, Windows, or Linux.
- Optional: Ollama, LM Studio, or an OpenAI API key depending on provider choice.

## Install

```bash
npm install
```

## Run the Electron app

```bash
npm start
```

## Build CSS (UI styles)

```bash
npm run build:css
```

## Run tests

```bash
npm test
```

## CLI Usage

The CLI entry point is `ai-renamer` and can be used after installation:

```bash
node src/index.js --help
```

Common options are configured in `src/configureYargs.js` and include provider selection, model names, and case formatting options.

## Project Structure

- `public/` - UI assets (`index.html`, Tailwind output, renderer script).
- `src/` - CLI + backend logic.
- `electron.js` - Electron main process entry.

## Notes

- The UI is designed to preview renames only; applying changes will use the backend logic provided by the selected provider.
- For local models, make sure the provider is running before renaming files.
