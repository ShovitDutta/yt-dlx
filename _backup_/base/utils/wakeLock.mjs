// import { yellow, red, green } from "colors";
// import { spawn } from "child_process";
// import { schedule } from "node-cron";
// import express from "express";

// const app = express();
// const port = process.env.PORT || 8000;
// app.use((req, res) => res.status(404).send("404!"));

// function reproc() {
// const iproc = spawn("sh", [
// "-c",
// "pkill tor && service tor start && yarn global add yt-dlx",
// ]);
// iproc.stdout.on("data", (data) => {
// console.log(yellow("@debug:"), data.toString());
// });
// iproc.stderr.on("data", (data) => {
// console.error(red("@error:"), data.toString());
// });
// iproc.on("close", (code) => {
// if (code !== 0) {
// console.error(red("@error:"), "installation failed.");
// } else {
// const rproc = spawn("sh", [
// "-c",
// "pkill tor && service tor start && yarn global remove yt-dlx",
// ]);
// rproc.stdout.on("data", (data) => {
// console.log(yellow("@debug:"), data.toString());
// });
// rproc.stderr.on("data", (data) => {
// console.error(red("@error:"), data.toString());
// });
// rproc.on("close", (code) => {
// if (code !== 0) console.error(red("@error:"), "removal failed.");
// else reproc();
// });
// }
// });
// }

// app.listen(port, () => {
// console.log(green("@server:"), "started on port", port);
// schedule("*/10 * * * *", () => reproc());
// });

// export default app;
