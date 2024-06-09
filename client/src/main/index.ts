import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { app, shell, BrowserWindow, ipcMain } from "electron";
import icon from "../../resources/icon.png?asset";
import { join } from "path";
import colors from "colors";
import ytdlx from "yt-dlx";
import * as fs from "fs";

var ipcApi = async (): Promise<void> => {
  ipcMain.on(
    "AddSend",
    async (
      event: Electron.IpcMainEvent,
      data: { num1: number; num2: number }
    ) => event.sender.send("AddGet", data.num1 + data.num2)
  );

  ipcMain.on(
    "AudioSend",
    async (
      event: Electron.IpcMainEvent,
      data: {
        output: string;
        videoId: string;
        useTor: boolean;
        verbose: boolean;
      }
    ) => {
      console.log(colors.green("❓ videoId:"), colors.italic(data.videoId));
      var response = await ytdlx.AudioOnly.Single.Highest({
        stream: true,
        metadata: false,
        output: data.output,
        useTor: data.useTor,
        query: data.videoId,
        verbose: data.verbose,
      });
      if (response && "ffmpeg" in response && "filename" in response) {
        response.ffmpeg.pipe(fs.createWriteStream(response.filename), {
          end: true,
        });
        response.ffmpeg.on("progress", ({ percent, timemark }) => {
          event.sender.send("AudioGet", {
            percent,
            timemark,
          });
        });
      } else event.sender.send("AudioError", "ffmpeg or filename not found!");
    }
  );

  setInterval(() => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send("TimeGet", new Date().toLocaleTimeString());
    });
  }, 1000);
};

function createWindow(): void {
  var mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");
  app.on(
    "browser-window-created",
    (_: Electron.Event, window: BrowserWindow): void => {
      optimizer.watchWindowShortcuts(window);
    }
  );
  ipcApi();
  createWindow();
  app.on("activate", (): void => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", (): void => {
  if (process.platform !== "darwin") app.quit();
});
