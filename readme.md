# ai-renamer

A desktop application that uses AI to intelligently rename and organize files. Built with Electron, React, and Tailwind CSS.

## Features

-   **Intuitive File Selection**: Easily select multiple files and folders to rename and organize.
-   **Powerful Renaming Rules**: Customize how your files are named using patterns that can include the original name, date, and a counter.
-   **Smart Organization**: Automatically sort files into subdirectories based on file type (e.g., PDF, JPG) and date (Year/Month).
-   **Live Preview**: See how your files will be renamed and where they will be moved before applying any changes.
-   **One-Click Apply**: Rename and organize all selected files with a single click.
-   **Undo Last Operation**: Easily revert the last batch of changes if you make a mistake.

## Getting Started

### Prerequisites

-   Node.js and npm
-   Git

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ozgrozer/ai-renamer.git
    cd ai-renamer
    ```

2.  **Install dependencies:**
    This project has a separate frontend and backend. You'll need to install dependencies for both.
    ```bash
    # Install root dependencies
    npm install

    # Install frontend dependencies
    cd frontend
    npm install
    cd ..
    ```

3.  **Run the application:**
    The application runs the Electron app and the Vite development server concurrently.
    ```bash
    # From the root directory
    npm start
    ```
    This will launch the desktop application. The frontend is served by Vite and supports hot-reloading for a seamless development experience.

## Contribution

Feel free to contribute. Open a new [issue](https://github.com/ozgrozer/ai-renamer/issues), or make a [pull request](https://github.com/ozgrozer/ai-renamer/pulls).

## License

[GPL-3.0](https://github.com/ozgrozer/ai-renamer/blob/main/license)
