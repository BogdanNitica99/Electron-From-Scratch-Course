const path = require("path");
const os = require("os");

const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require("electron");
const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngQuant = require("imagemin-pngquant");
const slash = require("slash");

// set env
process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let aboutWindow;

let outputPath = path.join(os.homedir(), "imageshrink");

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageShrink",
    width: isDev ? 700 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.handle("outputPath", () => outputPath);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadURL(`file://${__dirname}/app/index.html`); //or
  // mainWindow.loadFile("./app/index.html");
}

ipcMain.on("imgPathAndQuality", (e, options) => {
  shrinkImage(options, outputPath);
});

async function shrinkImage({ imgPath, quality }, dest) {
  try {
    const pngQuality = quality / 100;

    // slash is used for Windows backwards slash in paths
    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngQuant({ quality: [pngQuality, pngQuality] }),
      ],
    });

    shell.openPath(dest);

    mainWindow.webContents.send("image:done");
  } catch (error) {
    console.log(error);
  }
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About ImageShrink",
    width: 300,
    height: 300,
    resizable: false,
  });

  aboutWindow.loadFile("./app/about.html");
}

app.on("ready", () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+I", () =>
    mainWindow.toggleDevTools()
  );

  // garbage collection
  mainWindow.on("closed", () => (mainWindow = null));
});

const menu = [
  // quick fix for MacOS menu
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: "CmdOrCtrl+W",
        click: () => app.quit(),
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

// Quit when all windows are closed
// app.on("window-all-closed", () => {
//   // On MacOS it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (!isMac) {
//     app.quit();
//   }
// });

app.on("activate", () => {
  // On MacOS it is common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
