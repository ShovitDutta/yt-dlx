import chalk from "chalk";
import ytdlx from "yt-dlx";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!req.body || !req.body.Query) {
      return res.status(400).send("Invalid request. Query parameter is missing.");
    }
    const Query = await req.body.Query;
    console.log(chalk.greenBright.bold("❓ Query:"), chalk.italic(Query));
    const TubeBody: any[] = await ytdlx.ytSearch.Video.Multiple({
      query: Query,
    });
    return res.status(200).json(TubeBody);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error processing the stream.");
  }
}
