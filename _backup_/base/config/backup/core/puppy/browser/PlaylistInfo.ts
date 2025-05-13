import { z } from "zod";
import colors from "colors";
import { load } from "cheerio";
import closers from "../closers";
import YouTubeId from "../YouTubeId";
import crawler, { browser, page } from "../crawler";

export interface InputYouTube {
  query: string;
  verbose?: boolean;
  onionTor?: boolean;
  screenshot?: boolean;
}
export interface PlaylistInfoType {
  playlistViews: number;
  playlistTitle: string;
  playlistVideoCount: number;
  playlistDescription: string;
  playlistVideos: {
    ago: string;
    title: string;
    views: string;
    author: string;
    videoId: string;
    videoLink: string;
    authorUrl: string;
    thumbnailUrls: string[];
  }[];
}

export default async function PlaylistInfo(input: InputYouTube): Promise<PlaylistInfoType | undefined> {
  let query: string = "";
  const QuerySchema = z.object({
    query: z
      .string()
      .min(1)
      .refine(
        async input => {
          switch (true) {
            case /^(https?:\/\/)?(www\.)?(youtube\.com\/(playlist\?|embed\/|v\/|channel\/)(list=)?)([a-zA-Z0-9_-]+)/.test(input):
              const resultLink = await YouTubeId(input);
              if (resultLink !== undefined) {
                query = input;
                return true;
              }
              break;
            default:
              const resultId = await YouTubeId(`https://www.youtube.com/playlist?list=${input}`);
              if (resultId !== undefined) {
                query = `https://www.youtube.com/playlist?list=${input}`;
                return true;
              }
              break;
          }
          return false;
        },
        {
          message: "Query must be a valid YouTube Playlist Link or ID.",
        },
      ),
    verbose: z.boolean().optional(),
    onionTor: z.boolean().optional(),
    screenshot: z.boolean().optional(),
  });
  const { screenshot, verbose, onionTor } = await QuerySchema.parseAsync(input);
  let metaTube: any[] = [];
  await crawler(verbose, onionTor);
  await page.goto(query);
  for (let i = 0; i < 40; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  }
  if (screenshot) {
    await page.screenshot({
      path: "FilterVideo.png",
    });
    console.log(colors.yellow("@scrape:"), "took snapshot...");
  }
  const content = await page.content();
  const $ = load(content);
  const playlistTitle = $("yt-formatted-string.style-scope.yt-dynamic-sizing-formatted-string").text().trim();
  const viewsText: any = $("yt-formatted-string.byline-item").eq(1).text();
  const playlistViews = parseInt(viewsText.replace(/,/g, "").match(/\d+/)[0]);
  let playlistDescription = $("span#plain-snippet-text").text();

  // Iterate over each playlist video element
  const videoElements = $("ytd-playlist-video-renderer");
  const videoIdPromises: Promise<string | undefined>[] = [];
  videoElements.each((_index, element) => {
    const title = $(element).find("h3").text().trim();
    const videoLink = "https://www.youtube.com" + $(element).find("a").attr("href");
    const videoIdPromise = YouTubeId(videoLink);
    videoIdPromises.push(videoIdPromise);
    videoIdPromise
      .then(videoId => {
        const newLink = "https://www.youtube.com/watch?v=" + videoId;
        const author = $(element).find(".yt-simple-endpoint.style-scope.yt-formatted-string").text();
        const authorUrl = "https://www.youtube.com" + $(element).find(".yt-simple-endpoint.style-scope.yt-formatted-string").attr("href");
        const views = $(element).find(".style-scope.ytd-video-meta-block span:first-child").text();
        const ago = $(element).find(".style-scope.ytd-video-meta-block span:last-child").text();
        const thumbnailUrls = [
          `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
          `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          `https://img.youtube.com/vi/${videoId}/default.jpg`,
        ];
        metaTube.push({
          ago,
          author,
          videoId,
          authorUrl,
          thumbnailUrls,
          videoLink: newLink,
          title: title.trim(),
          views: views.replace(/ views/g, ""),
        });
      })
      .catch(error => {
        console.error("Error fetching videoId:", error);
      });
  });

  // Wait for all videoIdPromises to resolve
  await Promise.all(videoIdPromises);

  console.log(colors.green("@info:"), colors.white("scrapping done for"), colors.green(query));
  await closers(browser);
  return {
    playlistVideos: metaTube,
    playlistDescription: playlistDescription.trim(),
    playlistVideoCount: metaTube.length,
    playlistViews,
    playlistTitle,
  };
}

process.on("SIGINT", async () => await closers(browser));
process.on("SIGTERM", async () => await closers(browser));
process.on("uncaughtException", async () => await closers(browser));
process.on("unhandledRejection", async () => await closers(browser));
