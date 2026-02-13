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
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:9002');
        mainWindow.webContents.openDevTools();
    } else {
        const server = http.createServer((request, response) => {
            return handler(request, response, {
                public: path.join(__dirname, 'out'),
                rewrites: [
                    { source: '/admin/quiz/:quizId/edit/**', destination: '/admin/quiz/demo/edit/index.html' },
                    { source: '/admin/quiz/:quizId/control/**', destination: '/admin/quiz/demo/control/index.html' },
                    { source: '/admin/quiz/:quizId/leaderboard/**', destination: '/admin/quiz/demo/leaderboard/index.html' },
                    { source: '/host/:quizId/control/**', destination: '/host/demo/control/index.html' },
                    { source: '/play/:quizId/**', destination: '/play/demo/index.html' },
                    { source: '/quiz/:quizId/lobby/**', destination: '/quiz/demo/lobby/index.html' },
                    { source: '/quiz/:quizId/leaderboard/**', destination: '/quiz/demo/leaderboard/index.html' },
                    { source: '/quiz/:quizId/**', destination: '/quiz/demo/index.html' },
                    { source: '**', destination: '/index.html' }
                ]
            });
        });
        const PORT = 3000;
        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            mainWindow.loadURL(`http://localhost:${PORT}`);
        });
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
