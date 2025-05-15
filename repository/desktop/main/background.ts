import socket from "ws";
import path from "path";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { ipcMain as ipc, dialog, app as client } from "electron";
//
//
var server: socket | null = null;
(async () => {
    var port = 8642;
    var production = process.env.NODE_ENV === "production";
    server = new socket("ws://localhost:" + port);
    server.on("open", () => console.log("@connected:", port));
    server.on("error", error => console.error("@error:", error));
    server.on("close", ip => console.log("@disconnected:", ip, " @port:", port));
    if (production) serve({ directory: "app" });
    else client.setPath("userData", client.getPath("userData") + " (development)");
    await client.whenReady();
    var mainwindow = createWindow("main", {
        show: true,
        fullscreen: true,
        autoHideMenuBar: true,
        webPreferences: {
            sandbox: false,
            preload: path.join(__dirname, "preload.js"),
        },
    });
    switch (production) {
        case false:
            await mainwindow.loadURL("http://localhost:" + process.argv[2] + "/home");
            mainwindow.webContents.openDevTools();
            break;
        case true:
            await mainwindow.loadURL("app://./home");
            break;
        default:
            process.exit(0);
    }
})();
//
//
ipc.handle("select-output-folder", async event => {
    var result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (result.canceled) return null;
    else return result.filePaths[0];
});
//
//
interface SearchVideos {
    query: string;
    verbose: boolean;
}
ipc.on("SearchVideos", (event, response: SearchVideos) => {
    server.send(JSON.stringify({ event: "SearchVideos", payload: response }));
    server.on("message", output => {
        var { event: msgEvent, data: msgData } = JSON.parse(output.toString());
        event.reply("SearchVideos", { [msgEvent]: msgData });
    });
});
//
//
interface VideoData {
    query: string;
    verbose: boolean;
}
ipc.on("VideoData", (event, response: VideoData) => {
    server.send(JSON.stringify({ event: "VideoData", payload: response }));
    server.on("message", output => {
        var { event: msgEvent, data: msgData } = JSON.parse(output.toString());
        event.reply("VideoData", { [msgEvent]: msgData });
    });
});
//
//
interface AudioLowest {
    query: string;
    output: string;
    stream: boolean;
    useTor: boolean;
    verbose: boolean;
    metadata: boolean;
}
ipc.on("AudioLowest", (event, response: AudioLowest) => {
    server.send(JSON.stringify({ event: "AudioLowest", payload: response }));
    server.on("message", output => {
        var { event: msgEvent, data: msgData } = JSON.parse(output.toString());
        event.reply(msgEvent, msgData);
    });
});
//
//
interface AudioHighest {
    query: string;
    output: string;
    stream: boolean;
    useTor: boolean;
    verbose: boolean;
    metadata: boolean;
}
ipc.on("AudioHighest", (event, response: AudioHighest) => {
    server.send(JSON.stringify({ event: "AudioHighest", payload: response }));
    server.on("message", output => {
        var { event: msgEvent, data: msgData } = JSON.parse(output.toString());
        event.reply(msgEvent, msgData);
    });
});
//
//
interface VideoLowest {
    query: string;
    output: string;
    stream: boolean;
    useTor: boolean;
    verbose: boolean;
    metadata: boolean;
}
ipc.on("VideoLowest", (event, response: VideoLowest) => {
    server.send(JSON.stringify({ event: "VideoLowest", payload: response }));
    server.on("message", output => {
        var { event: msgEvent, data: msgData } = JSON.parse(output.toString());
        event.reply(msgEvent, msgData);
    });
});
//
//
interface VideoHighest {
    query: string;
    output: string;
    stream: boolean;
    useTor: boolean;
    verbose: boolean;
    metadata: boolean;
}
ipc.on("VideoHighest", (event, response: VideoHighest) => {
    server.send(JSON.stringify({ event: "VideoHighest", payload: response }));
    server.on("message", output => {
        var { event: msgEvent, data: msgData } = JSON.parse(output.toString());
        event.reply(msgEvent, msgData);
    });
});
//
//
interface AudioVideoLowest {
    query: string;
    output: string;
    stream: boolean;
    useTor: boolean;
    verbose: boolean;
    metadata: boolean;
}
ipc.on("AudioVideoLowest", (event, response: AudioVideoLowest) => {
    server.send(JSON.stringify({ event: "AudioVideoLowest", payload: response }));
    server.on("message", output => {
        var { event: msgEvent, data: msgData } = JSON.parse(output.toString());
        event.reply(msgEvent, msgData);
    });
});
//
//
interface AudioVideoHighest {
    query: string;
    output: string;
    stream: boolean;
    useTor: boolean;
    verbose: boolean;
    metadata: boolean;
}
ipc.on("AudioVideoHighest", (event, response: AudioVideoHighest) => {
    server.send(JSON.stringify({ event: "AudioVideoHighest", payload: response }));
    server.on("message", output => {
        var { event: msgEvent, data: msgData } = JSON.parse(output.toString());
        event.reply(msgEvent, msgData);
    });
});
//
//
client.on("window-all-closed", () => client.quit());
