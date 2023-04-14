const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");
const gotTheLock = app.requestSingleInstanceLock();

let APP_URL = "https://game.aq.com/game/";
let APP_NAME = "Zueira";
let APP_ICON = "logo.ico";

let win;

if (!gotTheLock) {
  app.quit();
} else {
  const createMenu = () => {
    const template = [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  };

  const createWindow = () => {
    win = new BrowserWindow({
      title: APP_NAME,
      icon: "/build/icon.ico",
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        plugins: true,
      },
    });

    win.webContents.on("new-window", (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    win.webContents.on("context-menu", (event, params) => {
      Menu.getApplicationMenu().popup(win, params.x, params.y);
    });

    win.maximize();
    win.loadURL(APP_URL);

    win.once("page-title-updated", function (event, title) {
      event.preventDefault();
      // win.title = title;
      win.title = APP_NAME;
    });
  };

  const setupFlashPlugin = () => {
    let pluginName;
    let pluginType;

    switch (process.platform) {
      case "win32":
        pluginType = "win/";
        pluginName = "pepflashplayer.dll";
        break;
      case "darwin":
        pluginType = "mac/";
        pluginName = "PepperFlashPlayer.plugin";
        break;
      default:
        pluginType = "linux/";
        pluginName = "libpepflashplayer.so";
    }

    if (["freebsd", "linux", "netbsd", "openbsd"].includes(process.platform)) {
      app.commandLine.appendSwitch("no-sandbox");
    }

    app.commandLine.appendSwitch(
      "ppapi-flash-path",
      path.join(
        __dirname +
          "/plugins/" +
          pluginType +
          (process.arch == "x64" ? "x64" : "ia32"),
        pluginName
      )
    );
    app.commandLine.appendSwitch("ppapi-flash-version", "32.0.0.371");
  };

  app.setAsDefaultProtocolClient(app.getName());

  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  setupFlashPlugin();

  app.whenReady().then(() => {
    app.allowRendererProcessReuse = true;

    createMenu();
    createWindow();

    win.setIcon(path.join(__dirname, "/assets/", APP_ICON));

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}
