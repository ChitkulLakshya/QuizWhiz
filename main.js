const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simple compatibility; consider changing for security in production
    },
  });

  // For production (packaged app), load the static export from the 'out' directory
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'out/index.html'));
  } else {
    // For development, you can load the local URL
    // win.loadURL('http://localhost:3000');
    // Or load the file if you are testing the build locally
    win.loadFile(path.join(__dirname, 'out/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
