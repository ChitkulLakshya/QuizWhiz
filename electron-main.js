const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'), // Optional: if you add one later
        },
    });

    if (isDev) {
        // In development, load from the Next.js dev server
        // Loading localhost:9002 as configured in package.json scripts
        mainWindow.loadURL('http://localhost:9002');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load the static index.html from the 'out' directory
        // 'out' is the default export folder for Next.js
        mainWindow.loadFile(path.join(__dirname, 'out', 'index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
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
