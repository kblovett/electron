const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require('electron');
const os = require('os');
const path = require('path');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.file.file = `${__dirname}/${app.name}` + '.log';

// set env
const dev = 'development';
const prod = 'production';
process.env.NODE_ENV = prod;

const isDev = process.env.NODE_ENV !== prod ? true : false;
const isMac = os.platform() === 'darwin' ? true : false;
const isTux = os.platform() === 'linux' ? true : false;
const isWin = os.platform() === 'win32' ? true : false;

let mainWindow;
let aboutWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: isDev ? 815 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    backgroundColor: 'white',
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile(`${__dirname}/app/index.html`);
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: 'About ImageShrink',
    width: 300,
    height: 400,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: 'white',
  });

  aboutWindow.loadFile(`${__dirname}/app/about.html`);
}

app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());

  mainWindow.on('closed', () => (mainWindow = null));
});

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow(),
            },
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            {
              role: 'reload',
            },
            {
              role: 'forcereload',
            },
            {
              type: 'separator',
            },
            {
              role: 'toggledevtools',
            },
          ],
        },
      ]
    : []),
  {
    role: 'help',
    ...(!isMac
      ? {
          submenu: [
            {
              label: 'About ImageShrink',
              click: () => createAboutWindow(),
            },
          ],
        }
      : []),
  },
];

ipcMain.on('image:minimize', (e, options) => {
  options.destination = path.join(os.homedir(), 'image-shrink');
  shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, destination }) {
  try {
    const pngQuality = quality / 100;
    const files = await imagemin([slash(imgPath)], {
      destination,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({ quality: [pngQuality, pngQuality] }),
      ],
    });
    log.info(`\nIN: ${imgPath}\nOUT: ${destination}\nQUALITY: ${quality}%\n`);
    // shell.openPath(destination);
    mainWindow.webContents.send('image:done');
  } catch (err) {
    log.error(err);
  }
}

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
