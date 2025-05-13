console.clear();
// import * as fs from "fs";
// import colors from "colors";
// import * as path from "path";
// import { promisify } from "util";
// import ffmpeg from "fluent-ffmpeg";
// import { exec } from "child_process";
// import { progressBar } from "../../base/ffmpeg";

// function sizeFormat(filesize: number) {
// if (isNaN(filesize) || filesize < 0) return filesize;
// const bytesPerMegabyte = 1024 * 1024;
// const bytesPerGigabyte = bytesPerMegabyte * 1024;
// const bytesPerTerabyte = bytesPerGigabyte * 1024;
// if (filesize < bytesPerMegabyte) return filesize + " B";
// else if (filesize < bytesPerGigabyte) {
// return (filesize / bytesPerMegabyte).toFixed(2) + " MB";
// } else if (filesize < bytesPerTerabyte) {
// return (filesize / bytesPerGigabyte).toFixed(2) + " GB";
// } else return (filesize / bytesPerTerabyte).toFixed(2) + " TB";
// }

// async function Engine() {
// const lowAudio: any = {};
// const highAudio: any = {};
// const lowVideo: any = {};
// const highVideo: any = {};
// const lowHLS: any = {};
// const highHLS: any = {};
// let payLoad: any = {
// manifest: [],
// lowAudio: [],
// highAudio: [],
// lowVideo: [],
// highVideo: [],
// lowHLS: [],
// highHLS: [],
// };
// let maxT = 8;
// let pLoc = "";
// let dirC = process.cwd();
// while (maxT > 0) {
// const enginePath = path.join(dirC, "util", "engine");
// if (fs.existsSync(enginePath)) {
// pLoc = enginePath;
// break;
// } else {
// dirC = path.join(dirC, "..");
// maxT--;
// }
// }
// pLoc += " --proxy socks5://127.0.0.1:9050";
// pLoc += " --dump-single-json 'https://www.youtube.com/watch?v=AbFnsaDQMYQ'";
// pLoc += ` --no-check-certificate --prefer-insecure --no-call-home --skip-download --no-warnings --geo-bypass`;
// pLoc += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"`;
// const metaCore = await promisify(exec)(pLoc);
// const metaTube = JSON.parse(metaCore.stdout.toString());
// await metaTube.formats.forEach((op: any) => {
// const rm = new Set(["storyboard", "Default"]);
// if (!rm.has(op.format_note) && op.protocol === "m3u8_native" && op.vbr) {
// if (!lowHLS[op.resolution] || op.vbr < lowHLS[op.resolution].vbr)
// lowHLS[op.resolution] = op;
// if (!highHLS[op.resolution] || op.vbr > highHLS[op.resolution].vbr)
// highHLS[op.resolution] = op;
// }
// if (rm.has(op.format_note) || op.filesize === undefined || null) return;
// const prevLowVideo = lowVideo[op.format_note];
// const prevHighVideo = highVideo[op.format_note];
// const prevLowAudio = lowAudio[op.format_note];
// const prevHighAudio = highAudio[op.format_note];
// switch (true) {
// case op.format_note.includes("p"):
// if (!prevLowVideo || op.filesize < prevLowVideo.filesize)
// lowVideo[op.format_note] = op;
// if (!prevHighVideo || op.filesize > prevHighVideo.filesize)
// highVideo[op.format_note] = op;
// break;
// default:
// if (!prevLowAudio || op.filesize < prevLowAudio.filesize)
// lowAudio[op.format_note] = op;
// if (!prevHighAudio || op.filesize > prevHighAudio.filesize)
// highAudio[op.format_note] = op;
// break;
// }
// });
// if (lowAudio) {
// Object.values(lowAudio).forEach((op) => {
// payLoad.lowAudio.push(op);
// });
// }
// if (highAudio) {
// Object.values(highAudio).forEach((op) => {
// payLoad.highAudio.push(op);
// });
// }
// if (lowVideo) {
// Object.values(lowVideo).forEach((op) => {
// payLoad.lowVideo.push(op);
// });
// }
// if (highVideo) {
// Object.values(highVideo).forEach((op) => {
// payLoad.highVideo.push(op);
// });
// }
// if (lowHLS) {
// Object.entries(lowHLS).forEach(([_resolution, op]) => {
// payLoad.lowHLS.push(op);
// });
// }
// if (highHLS) {
// Object.entries(highHLS).forEach(([_resolution, op]) => {
// payLoad.highHLS.push(op);
// });
// }
// if (payLoad) return payLoad;
// else return null;
// }

// (async () => {
// const op: any = await Engine();
// if (op.lowAudio.length > 0) {
// console.log(colors.magenta("Low Audio Options:"));
// op.lowAudio.forEach((audio: any) => {
// console.log(colors.magenta("@audio:"), {
// filesize: sizeFormat(audio.filesize),
// format_note: audio.format_note,
// });
// });
// }
// console.log();
// if (op.highAudio.length > 0) {
// console.log(colors.magenta("High Audio Options:"));
// op.highAudio.forEach((audio: any) => {
// console.log(colors.magenta("@audio:"), {
// filesize: sizeFormat(audio.filesize),
// format_note: audio.format_note,
// });
// });
// }
// console.log();
// if (op.lowVideo.length > 0) {
// console.log(colors.blue("Low Video Options:"));
// op.lowVideo.forEach((video: any) => {
// console.log(colors.blue("@video:"), {
// filesize: sizeFormat(video.filesize),
// format_note: video.format_note,
// });
// });
// }
// console.log();
// if (op.highVideo.length > 0) {
// console.log(colors.blue("High Video Options:"));
// op.highVideo.forEach((video: any) => {
// console.log(colors.blue("@video:"), {
// filesize: sizeFormat(video.filesize),
// format_note: video.format_note,
// });
// });
// }
// console.log();
// if (op.lowHLS.length > 0) {
// console.log(colors.red("Low HLS Options:"));
// op.lowHLS.forEach((manifest: any) => {
// console.log(colors.red("@manifest:"), {
// resolution: manifest.resolution,
// vbr: manifest.vbr,
// });
// });
// }
// console.log();
// if (op.highHLS.length > 0) {
// console.log(colors.red("High HLS Options:"));
// op.highHLS.forEach((manifest: any) => {
// console.log(colors.red("@manifest:"), {
// resolution: manifest.resolution,
// vbr: manifest.vbr,
// });
// });
// }
// console.log();
// const found = [
// op.manifest[0],
// op.manifest[2],
// op.manifest[3],
// op.manifest[4],
// op.manifest[5],
// op.manifest[6],
// op.manifest[7],
// ];
// for (const f of found) {
// ffmpeg(f.manifest_url)
// .videoCodec("copy")
// .outputFormat("webm")
// .output(f.resolution + ".webm")
// .inputOptions(["-protocol_whitelist file,http,https,tcp,tls"])
// .on("start", (start) => console.log(start))
// .on("end", () => process.stdout.write("\n"))
// .on("progress", (progress) => progressBar(progress))
// .on("error", (error) => console.error(error.message))
// .run();
// }
// })();
// ===========================================================================
// console.clear();
// import { Client } from "youtubei";

// (async () => {
// try {
// const youtube = new Client();
// const videos = await youtube.search("Houdini", {
// type: "video",
// });
// videos.items.forEach((item) => {
// console.log({
// id: item.id,
// title: item.title,
// thumbnails: item.thumbnails,
// uploadDate: item.uploadDate,
// description: item.description,
// duration: item.duration,
// isLive: item.isLive,
// viewCount: item.viewCount,
// channelid: item.channel?.id,
// channelname: item.channel?.name,
// });
// });

// const playlist = await youtube.search("Houdini", {
// type: "playlist",
// });
// playlist.items.forEach((item) => {
// console.log({
// id: item.id,
// title: item.title,
// videoCount: item.videoCount,
// thumbnails: item.thumbnails,
// });
// });
// } catch (error) {
// console.error("Error occurred:", error);
// }
// })();
