# AI Renamer

A Node.js CLI that uses Ollama and LM Studio models (Llava, Gemma, Llama etc.) to intelligently rename files by their contents.

*Forked from [ozgrozer/ai-renamer](https://github.com/ozgrozer/ai-renamer) - Original creator: [Ozgur Ozer](https://github.com/ozgrozer)*

## Features

- **Multi-Provider Support**: Works with Ollama, LM Studio, and OpenAI
- **Content Analysis**: Analyzes images, videos, documents, and code files
- **Intelligent Naming**: Generates descriptive names based on actual file content
- **Multiple Case Styles**: Support for camelCase, kebab-case, snake_case, and more
- **Video Frame Extraction**: Uses ffmpeg to analyze video content
- **PDF Support**: Reads and analyzes PDF document content
- **Configurable**: Persistent configuration saves your preferences
- **Subdirectory Processing**: Option to include files in subdirectories

## Installation

```bash
# Install globally
npm install -g ai-renamer

# Or run with npx
npx ai-renamer /path/to/files
```

## Usage

### Basic Usage
```bash
ai-renamer /path/to/files
```

### Provider-Specific Usage

**Ollama (Default)**
```bash
ai-renamer /path --provider=ollama --model=llava:13b
```

**LM Studio**
```bash
ai-renamer /path --provider=lm-studio
```

**OpenAI**
```bash
ai-renamer /path --provider=openai --api-key=YOUR_API_KEY
```

### Advanced Options

```bash
# Custom case style
ai-renamer /path --case=kebab-case

# Limit filename length
ai-renamer /path --chars=25

# Include subdirectories
ai-renamer /path --include-subdirectories=true

# Custom prompt
ai-renamer /path --custom-prompt="Focus on the main subject"

# Set language
ai-renamer /path --language=Spanish
```

## Configuration

Settings are automatically saved to `~/ai-renamer.json` when you use flags. Available options:

- `--provider` / `-p`: AI provider (ollama, lm-studio, openai)
- `--api-key` / `-a`: API key for OpenAI
- `--base-url` / `-u`: Custom API base URL
- `--model` / `-m`: Specific model to use
- `--frames` / `-f`: Max video frames to extract (default: 3)
- `--case` / `-c`: Output case style
- `--chars` / `-x`: Max filename characters
- `--language` / `-l`: Output language
- `--include-subdirectories` / `-s`: Process subdirectories
- `--custom-prompt` / `-r`: Additional prompt instructions

## Case Styles

Powered by the `change-case` library:

- `camelCase` → twoWords
- `kebab-case` → two-words  
- `snake_case` → two_words
- `PascalCase` → TwoWords
- `CONSTANT_CASE` → TWO_WORDS
- And more...

## Requirements

- Node.js 16+
- One of the following AI providers:
  - [Ollama](https://ollama.com/download) with a vision model
  - [LM Studio](https://lmstudio.ai/) with a loaded model
  - OpenAI API key
- [FFmpeg](https://www.ffmpeg.org/download.html) (for video processing)

## Examples

Transform generic filenames into descriptive ones:
- `IMG_20240106_143022.jpg` → `sunset-mountain-landscape.jpg`
- `document.pdf` → `quarterly-financial-report.pdf`
- `video.mp4` → `cooking-tutorial-pasta.mp4`
- `file.js` → `user-authentication-service.js`

## License

GPL-3.0
