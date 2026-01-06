# Smart Renamer

Intelligent AI-powered file renamer with context awareness that uses LM Studio to generate meaningful file names based on content and directory context.

## Features

- 🤖 **AI-Powered Naming** - Uses LM Studio for intelligent file renaming
- 📁 **Context Awareness** - Analyzes directory structure for better naming decisions
- 🔍 **Content Analysis** - Examines file metadata and content for accurate names
- 🏷️ **Tag Support** - Adds searchable tags to files
- 📂 **Auto Organization** - Organizes files into category folders
- 🛡️ **Safe Mode** - Dry-run option to preview changes
- 🎯 **Interactive Mode** - Confirm each rename operation
- ⚡ **Batch Processing** - Processes files efficiently in configurable batches
- 🎨 **GUI Available** - Electron-based graphical interface

## Supported File Types

- **Images**: JPG, PNG, GIF, BMP, WebP, SVG
- **Videos**: MP4, AVI, MOV, MKV, WMV, FLV, WebM
- **Documents**: PDF, DOC, DOCX, TXT, MD, RTF
- **Code**: JS, TS, PY, Java, CPP, HTML, CSS, JSON, XML
- **Audio**: MP3, WAV, FLAC, AAC, OGG
- **Archives**: ZIP, RAR, 7Z, TAR, GZ

## Prerequisites

- Node.js 14+ 
- [LM Studio](https://lmstudio.ai/) running locally
- A loaded language model in LM Studio

## Installation

### Global Installation
```bash
npm install -g smart-renamer
```

### Local Installation
```bash
git clone https://github.com/chrismaz11/Smart-Renamer.git
cd Smart-Renamer
npm install
```

## Usage

### Command Line Interface

#### Basic Usage
```bash
# Rename files in a directory
smart-renamer /path/to/files

# Safe mode - preview changes without renaming
smart-renamer ~/Downloads --dry-run

# Interactive mode - confirm each rename
smart-renamer ~/Pictures --interactive
```

#### Advanced Options
```bash
smart-renamer <path> [options]

Options:
  -p, --provider <provider>    AI provider (lm-studio, ollama) [default: lm-studio]
  -u, --url <url>             LM Studio base URL [default: http://localhost:1234]
  -m, --model <model>         Model name (auto-detected if not specified)
  -d, --dry-run               Show what would be renamed without actually renaming
  -i, --interactive           Interactive mode - confirm each rename
  -o, --organize              Organize files into category folders
  -f, --force-rename          Rename even well-named files for better names
  -t, --add-tags              Add searchable tags to files
  -b, --batch-size <size>     Process files in batches [default: 20]
```

#### Examples
```bash
# Process downloads folder with preview
smart-renamer ~/Downloads --dry-run

# Interactive renaming with organization
smart-renamer ~/Pictures --interactive --organize

# Batch process with custom LM Studio URL
smart-renamer ./documents --batch-size 10 --url http://localhost:1234

# Force rename well-named files for better names
smart-renamer ./photos --force-rename --add-tags
```

### Graphical User Interface

Launch the Electron GUI:
```bash
npm run gui
```

## Configuration

### LM Studio Setup

1. Download and install [LM Studio](https://lmstudio.ai/)
2. Load a language model (recommended: Code Llama, Mistral, or similar)
3. Start the local server (default: http://localhost:1234)
4. Ensure the model is loaded and ready

### Custom LM Studio Configuration
```bash
# Use custom LM Studio URL
smart-renamer /path/to/files --url http://localhost:8080

# Specify model explicitly
smart-renamer /path/to/files --model "codellama-7b-instruct"
```

## How It Works

1. **File Analysis** - Scans files and extracts metadata
2. **Context Building** - Analyzes directory structure and existing naming patterns
3. **AI Processing** - Sends context to LM Studio for intelligent name generation
4. **Smart Filtering** - Skips already well-named files (unless `--force-rename`)
5. **Safe Execution** - Renames files with collision detection and backup

## Development

### Scripts
```bash
npm start          # Run the CLI tool
npm run dev        # Development mode
npm run gui        # Launch Electron GUI
npm run build      # Build Electron app
```

### Project Structure
```
src/
├── index.js           # CLI entry point
├── SmartRenamer.js    # Main renaming logic
├── LMStudioClient.js  # LM Studio API client
├── FileAnalyzer.js    # File analysis and filtering
└── ContextBuilder.js  # Directory context analysis
gui/
├── main.js           # Electron main process
└── index.html        # GUI interface
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Troubleshooting

### Common Issues

**LM Studio Connection Failed**
- Ensure LM Studio is running
- Check the URL (default: http://localhost:1234)
- Verify a model is loaded

**No Files Processed**
- Check file types are supported
- Use `--force-rename` to process well-named files
- Verify file permissions

**Performance Issues**
- Reduce `--batch-size` for large directories
- Ensure adequate system resources for LM Studio

### Support

For issues and feature requests, please open an issue on GitHub.
