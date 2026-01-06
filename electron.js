const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('remote-debugging-port', '9222');

let lastOperation = [];

function generateNewPath(filePath, rules, counter, baseOutputPath) {
    const stats = fs.statSync(filePath);
    const originalName = path.basename(filePath, path.extname(filePath));
    const extension = path.extname(filePath);
    const fileDate = new Date(stats.mtime);

    let newName = rules.namingPattern;

    if (newName.includes('[Date]')) {
        const year = fileDate.getFullYear();
        const month = String(fileDate.getMonth() + 1).padStart(2, '0');
        const day = String(fileDate.getDate()).padStart(2, '0');
        const formattedDate = rules.dateFormat
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
        newName = newName.replace('[Date]', formattedDate);
    }

    newName = newName.replace('[Original Name]', originalName);
    newName = newName.replace('[Counter]', String(counter).padStart(3, '0'));
    newName += extension;

    let destinationDir = baseOutputPath;

    if (rules.organizeByDate) {
        const year = fileDate.getFullYear();
        const monthName = fileDate.toLocaleString('default', { month: 'long' });
        destinationDir = path.join(destinationDir, String(year), monthName);
    }

    if (rules.organizeByFileType) {
        const fileTypeDir = extension.substring(1).toUpperCase();
        destinationDir = path.join(destinationDir, fileTypeDir);
    }

    return {
        newName: newName,
        destination: destinationDir,
        fullPath: path.join(destinationDir, newName)
    };
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'frontend/preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
    }
}

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('open-dialog', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections']
    });
    return filePaths;
});

ipcMain.handle('get-preview', async (event, { files, rules }) => {
    if (!files || files.length === 0) {
        return [];
    }
    const baseOutputPath = path.dirname(files[0]);
    let counter = parseInt(rules.counterStart, 10) || 1;
    const previews = [];

    for (const filePath of files) {
        try {
            const { newName, destination } = generateNewPath(filePath, rules, counter, baseOutputPath);
            previews.push({
                id: filePath,
                original: path.basename(filePath),
                newName: newName,
                destination: destination,
            });
            counter++;
        } catch (error) {
            previews.push({
                id: filePath,
                original: path.basename(filePath),
                newName: 'Error processing file',
                destination: error.message
            });
        }
    }
    return previews;
});

ipcMain.handle('apply-changes', async (event, { files, rules }) => {
    if (!files || files.length === 0) {
        return [];
    }
    const baseOutputPath = path.dirname(files[0]);
    lastOperation = [];
    const results = [];
    let counter = parseInt(rules.counterStart, 10) || 1;

    for (const filePath of files) {
        try {
            const { fullPath, destination } = generateNewPath(filePath, rules, counter, baseOutputPath);
            if (rules.createSubfolders) {
                fs.mkdirSync(destination, { recursive: true });
            }
            fs.renameSync(filePath, fullPath);
            lastOperation.push({ oldPath: filePath, newPath: fullPath });
            results.push({ success: true, original: filePath, new: fullPath });
            counter++;
        } catch (error) {
            results.push({ success: false, original: filePath, error: error.message });
        }
    }
    return results;
});

ipcMain.handle('organize-files', async (event, { files, rules }) => {
    console.log('Organizing files...', { files, rules });
    // Placeholder for now
    return [];
});

ipcMain.handle('undo', async () => {
    if (lastOperation.length === 0) {
        return { success: false, message: 'No operation to undo.' };
    }

    const results = [];
    const affectedDirs = new Set();

    // 1. Move all files back to their original locations
    for (let i = lastOperation.length - 1; i >= 0; i--) {
        const { oldPath, newPath } = lastOperation[i];
        try {
            // Ensure the original directory exists before moving the file back
            const oldPathDir = path.dirname(oldPath);
            if (!fs.existsSync(oldPathDir)) {
                fs.mkdirSync(oldPathDir, { recursive: true });
            }

            fs.renameSync(newPath, oldPath);
            results.push({ success: true, from: newPath, to: oldPath });

            // Keep track of the directories that might now be empty
            affectedDirs.add(path.dirname(newPath));
        } catch (error) {
            results.push({ success: false, from: newPath, error: error.message });
        }
    }

    // 2. Clean up any directories that became empty after moving files out
    const attemptToRemoveEmptyDir = (dirPath) => {
        try {
            // Base case: Stop if the directory doesn't exist or isn't empty.
            if (!fs.existsSync(dirPath) || fs.readdirSync(dirPath).length > 0) {
                return;
            }

            // It's empty, so remove it.
            fs.rmdirSync(dirPath);

            // Recursively try to remove the parent directory as well.
            const parentDir = path.dirname(dirPath);
            if (parentDir !== dirPath) { // Safeguard to avoid infinite loop on root directories
               attemptToRemoveEmptyDir(parentDir);
            }
        } catch (error) {
            // Log errors but don't stop the process.
            console.error(`Error during empty directory cleanup for ${dirPath}:`, error.message);
        }
    };

    affectedDirs.forEach(dir => attemptToRemoveEmptyDir(dir));

    // Clear the last operation history
    lastOperation = [];
    return { success: true, results };
});
