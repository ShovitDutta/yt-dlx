// #!/usr/bin/env node
// import YouTubeDLX from "..";
// import * as fs from "fs";
// import colors from "colors";
// import * as path from "path";
// import minimist from "minimist";
// import { spawn } from "child_process";
// import { version } from "../../package.json";

// var proTube = minimist(process.argv.slice(2), {
// string: ["query", "format"],
// alias: {
// h: "help",
// v: "version",
// e: "extract",
// vl: "video-lowest",
// al: "audio-lowest",
// vh: "video_highest",
// ah: "audio-highest",
// },
// });
// var uLoc: string = "";
// var maxTries: number = 6;
// var currentDir: string = __dirname;
// var program = async () => {
// var command = proTube._[0];
// switch (command) {
// case "install:deps":
// while (maxTries > 0) {
// var enginePath = path.join(currentDir, "util");
// if (fs.existsSync(enginePath)) {
// uLoc = enginePath;
// break;
// } else {
// currentDir = path.join(currentDir, "..");
// maxTries--;
// }
// }
// var rox = spawn("sh", [
// "-c",
// `chmod +x ${uLoc}/deps.sh && ${uLoc}/deps.sh`,
// ]);
// await Promise.all([
// new Promise<void>((resolve, reject) => {
// rox.stdout.on("data", stdout => {
// console.log(
// colors.green("@stdout:"),
// stdout.toString().trim(),
// );
// });
// rox.on("close", code => {
// if (code === 0) resolve();
// else reject(new Error(`@closed with code ${code}`));
// });
// }),
// new Promise<void>((resolve, reject) => {
// rox.stderr.on("data", stderr => {
// console.log(
// colors.yellow("@stderr:"),
// stderr.toString().trim(),
// );
// });
// rox.on("close", code => {
// if (code === 0) resolve();
// else reject(new Error(`@closed with code ${code}`));
// });
// }),
// ]);
// break;
// case "install:socks5":
// while (maxTries > 0) {
// var enginePath = path.join(currentDir, "util");
// if (fs.existsSync(enginePath)) {
// uLoc = enginePath;
// break;
// } else {
// currentDir = path.join(currentDir, "..");
// maxTries--;
// }
// }
// var xrox = spawn("sh", [
// "-c",
// `chmod +x ${uLoc}/socks5.sh && ${uLoc}/socks5.sh`,
// ]);
// await Promise.all([
// new Promise<void>((resolve, reject) => {
// xrox.stdout.on("data", stdout => {
// console.log(
// colors.green("@stdout:"),
// stdout.toString().trim(),
// );
// });
// xrox.on("close", code => {
// if (code === 0) resolve();
// else reject(new Error(`@closed with code ${code}`));
// });
// }),
// new Promise<void>((resolve, reject) => {
// xrox.stderr.on("data", stderr => {
// console.log(
// colors.yellow("@stderr:"),
// stderr.toString().trim(),
// );
// });
// xrox.on("close", code => {
// if (code === 0) resolve();
// else reject(new Error(`@closed with code ${code}`));
// });
// }),
// ]);
// break;
// case "version":
// case "v":
// console.error(colors.green("Installed Version: yt-dlx@" + version));
// break;
// case "help":
// case "h":
// console.log("@help: visit https://yt-dlx-shovit.koyeb.app/");
// break;
// case "extract":
// case "e":
// if (!proTube || !proTube.query || proTube.query.length === 0) {
// console.error(colors.red("error: no query"));
// } else
// await YouTubeDLX.info
// .extract({
// query: proTube.query,
// })
// .then((data: any) => {
// console.log(data);
// process.exit();
// })
// .catch((error: string) => {
// console.error(colors.red(error));
// process.exit();
// });
// break;
// // case "list-formats":
// // case "f":
// // if (!proTube || !proTube.query || proTube.query.length === 0) {
// // console.error(colors.red("error: no query"));
// // } else
// // await YouTubeDLX.info
// // .list_formats({
// // query: proTube.query,
// // })
// // .then((data: any) => {
// // console.log(data);
// // process.exit();
// // })
// // .catch((error: string) => {
// // console.error(colors.red(error));
// // process.exit();
// // });
// // break;
// case "audio-highest":
// case "ah":
// if (!proTube || !proTube.query || proTube.query.length === 0) {
// console.error(colors.red("error: no query"));
// } else
// await YouTubeDLX.AudioOnly.Single.Highest({
// query: proTube.query,
// })
// .then((data: any) => {
// console.log(data);
// process.exit();
// })
// .catch((error: string) => {
// console.error(colors.red(error));
// process.exit();
// });
// break;
// case "audio-lowest":
// case "al":
// if (!proTube || !proTube.query || proTube.query.length === 0) {
// console.error(colors.red("error: no query"));
// } else
// await YouTubeDLX.AudioOnly.Single.Lowest({
// query: proTube.query,
// })
// .then((data: any) => {
// console.log(data);
// process.exit();
// })
// .catch((error: string) => {
// console.error(colors.red(error));
// process.exit();
// });
// break;
// case "video_highest":
// case "vh":
// if (!proTube || !proTube.query || proTube.query.length === 0) {
// console.error(colors.red("error: no query"));
// } else
// await YouTubeDLX.VideoOnly.Single.Highest({
// query: proTube.query,
// })
// .then((data: any) => {
// console.log(data);
// process.exit();
// })
// .catch((error: string) => {
// console.error(colors.red(error));
// process.exit();
// });
// break;
// case "video-lowest":
// case "vl":
// if (!proTube || !proTube.query || proTube.query.length === 0) {
// console.error(colors.red("error: no query"));
// } else
// await YouTubeDLX.VideoOnly.Single.Lowest({
// query: proTube.query,
// })
// .then((data: any) => {
// console.log(data);
// process.exit();
// })
// .catch((error: string) => {
// console.error(colors.red(error));
// process.exit();
// });
// break;
// default:
// console.log("@help: visit https://yt-dlx-shovit.koyeb.app/");
// process.exit();
// break;
// }
// };

// if (!proTube._[0]) {
// console.log("@help: visit https://yt-dlx-shovit.koyeb.app/");
// process.exit();
// } else program();
