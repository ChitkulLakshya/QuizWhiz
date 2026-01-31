const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // In production (bundled), the 'out' folder is usually at the root of the ASAR or resources
    // When running locally with electron, it might be in the current directory.
    // We'll look for index.html in the 'out' folder.
    const indexPath = path.join(__dirname, 'out', 'index.html');

    if (fs.existsSync(indexPath)) {
        win.loadFile(indexPath);
    } else {
        console.error('Error: index.html not found at ' + indexPath);
        // Fallback or dev mode handling if needed, but for this specific ask we want to load the built files.
        // Ensure you run 'npm run build-app' first to generate the 'out' folder.
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
