#!/usr/bin/env node
import colors from "colors";
import YouTubeDLX from "../index";
import { Command } from "commander";
import packageJson from "../../package.json";

const program = new Command();

program
    .name("yt-dlx")
    .version(packageJson.version)
    .description("Effortless Audio-Video Downloader And Streamer!")
    .option("-o, --output-dir <path>", "Specify The Output Directory", process.cwd())
    .option("-v, --verbose", "Enable Verbose Output");

program
    .command("audio <url>")
    .description("Download Audio From A Given URL")
    .option("--lowest", "Download The Lowest Quality Audio")
    .option("--highest", "Download The Highest Quality Audio")
    .option("--custom <format>", "Download Audio In A Custom Format (Bitrate Or Format ID)")
    .option("--language <lang>", "Specify Audio Language")
    .option("--filter <filter>", "Apply Audio Filter")
    .option("--show-progress", "Show Download Progress")
    .option("--use-tor", "Use Tor For The Request")
    .action(async (url, options) => {
        try {
            const outputDir = options.outputDir || program.opts().outputDir;
            const verbose = options.verbose || program.opts().verbose;
            let audioOptions: any = { Query: url, Output: outputDir, ShowProgress: options.showProgress, UseTor: options.useTor, Verbose: verbose };
            if (options.lowest) {
                await YouTubeDLX.Audio.Lowest({ ...audioOptions, Language: options.language, Filter: options.filter });
            } else if (options.highest) {
                await YouTubeDLX.Audio.Highest({ ...audioOptions, Language: options.language, Filter: options.filter });
            } else if (options.custom) {
                const customFormat = options.custom;
                let customAudioOptions: any = { ...audioOptions, Language: options.language, Filter: options.filter };

                if (!isNaN(Number(customFormat))) {
                    customAudioOptions.AudioBitrate = Number(customFormat);
                    console.log(colors.green("@info:"), `Attempting To Download Audio With Bitrate Closest To ${customFormat}.`);
                } else {
                    customAudioOptions.AudioFormatId = customFormat;
                    console.log(colors.green("@info:"), `Attempting To Download Audio With Format ID ${customFormat}.`);
                }

                await YouTubeDLX.Audio.Custom(customAudioOptions);
            } else {
                await YouTubeDLX.Audio.Highest({ ...audioOptions, Language: options.language, Filter: options.filter });
            }
            console.log(colors.green("@success:"), "Audio Download Complete.");
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

program
    .command("video <url>")
    .description("Download Video From A Given URL")
    .option("--lowest", "Download The Lowest Quality Video")
    .option("--highest", "Download The Highest Quality Video")
    .option("--custom <format>", "Download Video In A Custom Format (Resolution, Fps, Or Format ID)")
    .option("--filter <filter>", "Apply Video Filter")
    .option("--show-progress", "Show Download Progress")
    .option("--use-tor", "Use Tor For The Request")
    .action(async (url, options) => {
        try {
            const outputDir = options.outputDir || program.opts().outputDir;
            const verbose = options.verbose || program.opts().verbose;
            let videoOptions: any = { Query: url, Output: outputDir, ShowProgress: options.showProgress, UseTor: options.useTor, Verbose: verbose };

            if (options.lowest) {
                await YouTubeDLX.Video.Lowest({ ...videoOptions, Filter: options.filter });
            } else if (options.highest) {
                await YouTubeDLX.Video.Highest({ ...videoOptions, Filter: options.filter });
            } else if (options.custom) {
                const customFormat = options.custom;
                let customVideoOptions: any = { ...videoOptions, Filter: options.filter };

                if (!isNaN(Number(customFormat))) {
                    customVideoOptions.VideoFPS = Number(customFormat);
                    console.log(colors.green("@info:"), `Attempting To Download Video With FPS Closest To ${customFormat}.`);
                } else if (customFormat.toLowerCase().includes("p")) {
                    customVideoOptions.VideoResolution = customFormat;
                    console.log(colors.green("@info:"), `Attempting To Download Video With Resolution ${customFormat}.`);
                } else {
                    customVideoOptions.VideoFormatId = customFormat;
                    console.log(colors.green("@info:"), `Attempting To Download Video With Format ID ${customFormat}.`);
                }

                await YouTubeDLX.Video.Custom(customVideoOptions);
            } else {
                await YouTubeDLX.Video.Highest({ ...videoOptions, Filter: options.filter });
            }
            console.log(colors.green("@success:"), "Video Download Complete.");
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

program
    .command("audiovideo <url>")
    .description("Download Combined Audio And Video From A Given URL")
    .option("--lowest", "Download The Lowest Quality Combined Stream")
    .option("--highest", "Download The Highest Quality Combined Stream")
    .option("--custom <format>", "Download Combined Audio/Video In A Custom Format")
    .option("--audio-language <lang>", "Specify Audio Language")
    .option("--video-filter <filter>", "Apply Video Filter")
    .option("--show-progress", "Show Download Progress")
    .option("--use-tor", "Use Tor For The Request")
    .action(async (url, options) => {
        try {
            const outputDir = options.outputDir || program.opts().outputDir;
            const verbose = options.verbose || program.opts().verbose;
            let avOptions: any = {
                Query: url,
                Output: outputDir,
                ShowProgress: options.showProgress,
                AudioLanguage: options.audioLanguage,
                Filter: options.videoFilter,
                UseTor: options.useTor,
                Verbose: verbose,
            };

            if (options.lowest) {
                await YouTubeDLX.Audio_Video.Lowest(avOptions);
            } else if (options.highest) {
                await YouTubeDLX.Audio_Video.Highest(avOptions);
            } else if (options.custom) {
                const customFormat = options.custom;
                let customAVOptions: any = { ...avOptions };

                if (!isNaN(Number(customFormat))) {
                    customAVOptions.AudioBitrate = Number(customFormat);
                    console.log(colors.green("@info:"), `Attempting To Download Audio/Video With Audio Bitrate Closest To ${customFormat}.`);
                } else if (customFormat.toLowerCase().includes("p")) {
                    customAVOptions.VideoResolution = customFormat;
                    console.log(colors.green("@info:"), `Attempting To Download Audio/Video With Video Resolution ${customFormat}.`);
                } else {
                    customAVOptions.AudioFormatId = customFormat;
                    console.log(colors.green("@info:"), `Attempting To Download Audio/Video With Audio Format ID ${customFormat}.`);
                }

                await YouTubeDLX.Audio_Video.Custom(customAVOptions);
            } else {
                await YouTubeDLX.Audio_Video.Highest(avOptions);
            }
            console.log(colors.green("@success:"), "Audio/Video Download Complete.");
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

const searchCommand = program.command("search").description("Search For Content");

searchCommand
    .command("video <query>")
    .description("Search For Videos")
    .option("--min-views <count>", "Minimum View Count", parseInt)
    .option("--max-views <count>", "Maximum View Count", parseInt)
    .option("--order-by <criteria>", "Order Results By (Relevance, ViewCount, Rating, Date)", "relevance")
    .action(async (query, options) => {
        try {
            const verbose = options.verbose || program.opts().verbose;
            const videos = await YouTubeDLX.Search.Video.Multiple({ Query: query, minViews: options.minViews, maxViews: options.maxViews, orderBy: options.orderBy, Verbose: verbose });
            console.log(colors.green("@success:"), "Video Search Results:");
            console.log(JSON.stringify(videos, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

searchCommand
    .command("channel <query>")
    .description("Search For Channels")
    .action(async (query, options) => {
        try {
            const verbose = options.verbose || program.opts().verbose;
            const channels = await YouTubeDLX.Search.Channel.Multiple({ Query: query, Verbose: verbose });
            console.log(colors.green("@success:"), "Channel Search Results:");
            console.log(JSON.stringify(channels, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

searchCommand
    .command("playlist <query>")
    .description("Search For Playlists")
    .action(async (query, options) => {
        try {
            const verbose = options.verbose || program.opts().verbose;
            const playlists = await YouTubeDLX.Search.Playlist.Multiple({ playlistLink: query, Verbose: verbose });
            console.log(colors.green("@success:"), "Playlist Search Results:");
            console.log(JSON.stringify(playlists, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

const accountCommand = program.command("account").description("Perform Account-Related Actions");

accountCommand
    .command("home-feed")
    .description("Get The Home Feed")
    .option("--cookies <cookies>", "YouTube Cookies For Authentication", process.env.YT_COOKIES)
    .option("--sort <criteria>", "Sort Criteria (Oldest, Newest, Old-To-New, New-To-Old)")
    .action(async options => {
        try {
            const verbose = options.verbose || program.opts().verbose;
            if (!options.cookies) {
                throw new Error("Cookies Not Provided. Please Set YT_COOKIES Environment Variable Or Use --cookies Option.");
            }
            const feed = await YouTubeDLX.Account.HomeFeed({ Cookies: options.cookies, Sort: options.sort, Verbose: verbose });
            console.log(colors.green("@success:"), "Home Feed:");
            console.log(JSON.stringify(feed, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

accountCommand
    .command("history")
    .description("Get Watch History")
    .option("--cookies <cookies>", "YouTube Cookies For Authentication", process.env.YT_COOKIES)
    .option("--sort <criteria>", "Sort Criteria (Oldest, Newest, Old-To-New, New-To-Old)")
    .action(async options => {
        try {
            const verbose = options.verbose || program.opts().verbose;
            if (!options.cookies) {
                throw new Error("Cookies Not Provided. Please Set YT_COOKIES Environment Variable Or Use --cookies Option.");
            }
            const history = await YouTubeDLX.Account.History({ Cookies: options.cookies, Sort: options.sort, Verbose: verbose });
            console.log(colors.green("@success:"), "Watch History:");
            console.log(JSON.stringify(history, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

accountCommand
    .command("subscriptions")
    .description("Get Subscriptions Feed")
    .option("--cookies <cookies>", "YouTube Cookies For Authentication", process.env.YT_COOKIES)
    .action(async options => {
        try {
            const verbose = options.verbose || program.opts().verbose;
            if (!options.cookies) {
                throw new Error("Cookies Not Provided. Please Set YT_COOKIES Environment Variable Or Use --cookies Option.");
            }
            const subscriptions = await YouTubeDLX.Account.SubscriptionsFeed({ Cookies: options.cookies, Verbose: verbose });
            console.log(colors.green("@success:"), "Subscriptions Feed:");
            console.log(JSON.stringify(subscriptions, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

accountCommand
    .command("notifications")
    .description("Get Unseen Notifications Count")
    .option("--cookies <cookies>", "YouTube Cookies For Authentication", process.env.YT_COOKIES)
    .action(async options => {
        try {
            const verbose = options.verbose || program.opts().verbose;
            if (!options.cookies) {
                throw new Error("Cookies Not Provided. Please Set YT_COOKIES Environment Variable Or Use --cookies Option.");
            }
            const notifications = await YouTubeDLX.Account.UnseenNotifications({ Cookies: options.cookies, Verbose: verbose });
            console.log(colors.green("@success:"), "Unseen Notifications Count:");
            console.log(JSON.stringify(notifications, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

const miscVideoCommand = program.command("misc video").description("Perform Miscellaneous Video Actions");

miscVideoCommand
    .command("get-id <url>")
    .description("Get The YouTube ID From A URL")
    .action(async url => {
        try {
            const videoId = await YouTubeDLX.Misc.Video.GetId(url);
            console.log(colors.green("@success:"), "Video ID:", videoId);
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

miscVideoCommand
    .command("extract <url>")
    .description("Extract Video Information")
    .option("--use-tor", "Use Tor For The Request")
    .action(async (url, options) => {
        try {
            const verbose = options.verbose || program.opts().verbose;
            const videoInfo = await YouTubeDLX.Misc.Video.Extract({ Query: url, UseTor: options.useTor, Verbose: verbose });
            console.log(colors.green("@success:"), "Video Information:");
            console.log(JSON.stringify(videoInfo, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

miscVideoCommand
    .command("related <video-id>")
    .description("Get Related Videos For A Video ID")
    .action(async videoId => {
        try {
            const verbose = program.opts().verbose;
            const related = await YouTubeDLX.Misc.Video.Related({ VideoId: videoId, Verbose: verbose });
            console.log(colors.green("@success:"), "Related Videos:");
            console.log(JSON.stringify(related, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

miscVideoCommand
    .command("comments <query>")
    .description("Get Video Comments For A Video Query")
    .action(async query => {
        try {
            const verbose = program.opts().verbose;
            const comments = await YouTubeDLX.Misc.Video.Comments({ Query: query, Verbose: verbose });
            console.log(colors.green("@success:"), "Video Comments:");
            console.log(JSON.stringify(comments, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

miscVideoCommand
    .command("transcript <url>")
    .description("Get Video Transcript For A Video URL")
    .action(async (url, options) => {
        try {
            const verbose = program.opts().verbose;
            const transcript = await YouTubeDLX.Misc.Video.Transcript({ VideoLink: url, Verbose: verbose });
            console.log(colors.green("@success:"), "Video Transcript:");
            console.log(JSON.stringify(transcript, null, 2));
        } catch (error: any) {
            console.error(colors.red("@error:"), error.message);
        }
    });

// Custom help output for the main program
program.addHelpText(
    "afterAll",
    `
---
## Detailed Usage:

**Global Options:**
  -o, --output-dir <path>  Specify The Output Directory (Defaults To Current Working Directory)
  -v, --verbose           Enable Verbose Output For Detailed Logging

---
## Audio Commands:
  **yt-dlx audio <url> [options]**
  Download audio from a given URL.

  **Options for Audio:**
    --lowest               Download The Lowest Quality Audio.
    --highest              Download The Highest Quality Audio (Default If No Quality Option Is Specified).
    --custom <format>      Download Audio In A Custom Format (Bitrate Or Format ID).
                           Example: --custom 128k (for 128kbps) or --custom 251 (for a specific format ID).
    --language <lang>      Specify Audio Language (e.g., 'en', 'es').
    --filter <filter>      Apply Audio Filter (e.g., 'acodec="opus"').
    --show-progress        Show Download Progress.
    --use-tor              Use Tor For The Request.

---
## Video Commands:
  **yt-dlx video <url> [options]**
  Download video from a given URL.

  **Options for Video:**
    --lowest               Download The Lowest Quality Video.
    --highest              Download The Highest Quality Video (Default If No Quality Option Is Specified).
    --custom <format>      Download Video In A Custom Format (Resolution, FPS, Or Format ID).
                           Example: --custom 720p (for 720p resolution), --custom 30 (for 30 FPS), or --custom 137 (for a specific format ID).
    --filter <filter>      Apply Video Filter (e.g., 'vcodec="avc1"').
    --show-progress        Show Download Progress.
    --use-tor              Use Tor For The Request.

---
## Audio And Video Combined Commands:
  **yt-dlx audiovideo <url> [options]**
  Download combined audio and video from a given URL.

  **Options for Audio/Video:**
    --lowest               Download The Lowest Quality Combined Stream.
    --highest              Download The Highest Quality Combined Stream (Default If No Quality Option Is Specified).
    --custom <format>      Download Combined Audio/Video In A Custom Format.
                           This option is ambiguous and will prioritize audio bitrate, then video resolution, then audio format ID.
                           For more precise control over both audio and video, consider downloading separately.
    --audio-language <lang> Specify Audio Language.
    --video-filter <filter> Apply Video Filter.
    --show-progress        Show Download Progress.
    --use-tor              Use Tor For The Request.

---
## Search Commands:
  **yt-dlx search <command> [options]**
  Search for content.

  **Subcommands for Search:**
    **video <query> [options]**
      Search for videos.
      Options:
        --min-views <count>  Minimum View Count.
        --max-views <count>  Maximum View Count.
        --order-by <criteria> Order Results By (relevance, viewCount, rating, date).

    **channel <query>**
      Search for channels.

    **playlist <query>**
      Search for playlists.

---
## Account Commands:
  **yt-dlx account <command> [options]**
  Perform account-related actions. Requires YouTube cookies for authentication.
  You can set the YT_COOKIES environment variable or use the --cookies option.

  **Subcommands for Account:**
    **home-feed**
      Get The Home Feed.
      Options:
        --cookies <cookies>  YouTube Cookies For Authentication.
        --sort <criteria>    Sort Criteria (Oldest, Newest, Old-To-New, New-To-Old).

    **history**
      Get Watch History.
      Options:
        --cookies <cookies>  YouTube Cookies For Authentication.
        --sort <criteria>    Sort Criteria (Oldest, Newest, Old-To-New, New-To-Old).

    **subscriptions**
      Get Subscriptions Feed.
      Options:
        --cookies <cookies>  YouTube Cookies For Authentication.

    **notifications**
      Get Unseen Notifications Count.
      Options:
        --cookies <cookies>  YouTube Cookies For Authentication.

---
## Miscellaneous Video Commands:
  **yt-dlx misc video <command> [options]**
  Perform miscellaneous video actions.

  **Subcommands for Miscellaneous Video:**
    **get-id <url>**
      Get The YouTube ID From A URL.

    **extract <url>**
      Extract Video Information.
      Options:
        --use-tor            Use Tor For The Request.

    **related <video-id>**
      Get Related Videos For A Video ID.

    **comments <query>**
      Get Video Comments For A Video Query (Can Be Video ID Or URL).

    **transcript <url>**
      Get Video Transcript For A Video URL.

`,
);

program.showHelpAfterError();
program.parse(process.argv);
