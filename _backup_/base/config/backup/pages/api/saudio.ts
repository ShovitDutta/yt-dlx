// import chalk from "chalk";
// import ytdlx from "yt-dlx";
// import type { NextApiRequest, NextApiResponse } from "next";
// export const config = {
// api: {
// bodyParser: false,
// },
// };

// export default async function handler(
// request: NextApiRequest,
// response: NextApiResponse
// ) {
// try {
// const url = decodeURIComponent(request.query.url as string);
// const format = decodeURIComponent(request.query.format as string);
// console.log(chalk.greenBright.bold("❓ Url:"), chalk.italic(url));
// console.log(chalk.greenBright.bold("❓ Format:"), chalk.italic(format));
// await ytdlx.stream.audio.custom({
// url,
// format,
// collector: response,
// });
// } catch (error) {
// console.error("Error:", error);
// response.status(500).send("Error processing the stream.");
// }
// }
