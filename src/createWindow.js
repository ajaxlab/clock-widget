const { BrowserWindow, ipcMain } = require('electron');

let win;

function createWindow() {
    win = new BrowserWindow({
        alwaysOnTop: true,
        frame: false,
        transparent: true,
        width: 300,
        height: 300,
        skipTaskbar: true
    });
    win.loadURL(`file://${__dirname}/index.html`);
    // win.webContents.openDevTools();
    win.on('closed', () => {
        win = null;
    });
}

ipcMain.on('moveDelta', (event, delta) => {
    const p = win.getPosition();
    win.setPosition(p[0] + delta.x, p[1] + delta.y);
});

module.exports = createWindow;
