import ytdlx from "yt-dlx";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!req.body || !req.body.yturl) {
      return res.status(400).send("Invalid request. yturl parameter is missing.");
    }
    const yturl = decodeURIComponent(req.body.yturl as string);
    const EnResp = await ytdlx.info.extract({
      query: yturl,
      verbose: false,
      onionTor: false,
    });
    return res.status(200).json({
      TubeUrl: yturl,
      EnResp,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error processing the stream.");
  }
}
