const { app } = require('electron');
const createWindow = require('./createWindow');

if (require('electron-squirrel-startup')) {
    app.quit();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', (e, hasVisibleWindows) => {
    if (!hasVisibleWindows) {
        createWindow();
    }
});
