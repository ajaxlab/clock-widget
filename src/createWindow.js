const { BrowserWindow, ipcMain } = require('electron');

let win;
const W = 108;
const H = 108;

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    //    resizable: false,
    width: W,
    height: H,
    skipTaskbar: true
  });
  win.loadURL(`file://${__dirname}/index.html`);
  // win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
}

function getWindowBounds(windowRatio) {
  const pos = win.getPosition();
  const size = win.getSize();
  const x0 = pos[0];
  const y0 = pos[1];
  const w0 = size[0];
  const h0 = size[1];
  const width = w0 * windowRatio;
  const height = h0 * windowRatio;
  const x = x0 - (width - w0) / 2;
  const y = y0 - (height - h0) / 2;
  return { x, y, width, height };
}

function extendWindow(ratio) {
  try {
    const { x, y, width, height } = getWindowBounds(ratio);
    console.log('extendWindow', x, y, width, height);
    win.setPosition(x, y);
    win.setSize(width, height);
  } catch (error) {
    console.warn(error);
  }
}

ipcMain.on('moveStart', (event) => {
  extendWindow(8);
});

ipcMain.on('move', (event, delta) => {
  const p = win.getPosition();
  win.setPosition(p[0] + delta.x, p[1] + delta.y);
});

ipcMain.on('moveEnd', (event) => {
  extendWindow(1 / 8);
});

module.exports = createWindow;
