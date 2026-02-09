const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

const serve = require('electron-serve');

const loadURL = serve({ directory: 'out' });

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:9002');
        mainWindow.webContents.openDevTools();
    } else {
        loadURL(mainWindow).catch(err => {
            console.error('Failed to load app:', err);
        });
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
