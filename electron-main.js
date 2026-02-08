const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');

const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

let mainWindow;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            // preload: path.join(__dirname, 'preload.js'), // Removed as it is not used
        },
    });

    if (isDev) {
        // In development, load from the Next.js dev server
        mainWindow.loadURL('http://localhost:9002');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, start a local server to serve the 'out' directory
        // This solves navigation and file:// protocol issues
        const server = http.createServer((request, response) => {
            return handler(request, response, {
                public: path.join(__dirname, 'out'),
                rewrites: [
                    { source: '**', destination: '/index.html' } // SPA fallback for direct navigation if needed, though trailingSlash handles folders
                ]
            });
        });

        // Listen on a random free port (or fixed if preferred, random is safer)
        server.listen(0, () => {
            const port = server.address().port;
            console.log(`Server running at http://localhost:${port}`);
            mainWindow.loadURL(`http://localhost:${port}`);
        });

        // Ensure server closes when app quits (though process exit handles it)
        app.on('will-quit', () => {
            server.close();
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
