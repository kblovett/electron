const { app, BrowserWindow } = require('electron');
const os = require('os');

// set env
process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = os.platform() === 'darwin' ? true : false;
const isTux = os.platform() === 'linux' ? true : false;
const isWin = os.platform() === 'win32' ? true : false;
console.log(isDev, isMac, isTux, isWin);

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
    },
  });

  // mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile(`${__dirname}/app/index.html`);
}

app.on('ready', createMainWindow);
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;
