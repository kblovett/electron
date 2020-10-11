const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const os = require('os');

// set env
const dev = 'development';
const prod = 'production';
process.env.NODE_ENV = dev;

const isDev = process.env.NODE_ENV !== prod ? true : false;
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
    backgroundColor: 'white',
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
    },
  });

  // mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile(`${__dirname}/app/index.html`);
}

app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());
  globalShortcut.register(isMac ? 'Alt+Cmd+I' : 'Ctrl+Shift+I', () =>
    mainWindow.toggleDevTools()
  );

  mainWindow.on('closed', () => (mainWindow = null));
});

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+W',
        click: () => app.quit(),
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => mainWindow.reload(),
      },
    ],
  },
];

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
