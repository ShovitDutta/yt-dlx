import YouTubeDLX from "..";
import express, { Request, Response } from "express";
import * as path from "path";
import { Readable } from "stream";

const Test_Server = express();
Test_Server.use(express.json());

async function handleYouTubeDLXRequest<T extends object>(
    promiseFn: (options: any) => Promise<T>,
    options: any,
    res: Response,
    streamHandler?: (streamData: Readable, res: Response) => void,
    metadataHandler?: (metadata: any, res: Response) => void,
) {
    try {
        const result = await promiseFn(options);

        if (options.stream && streamHandler && "stream" in result && result.stream instanceof Readable) {
            streamHandler(result.stream, res);
        } else if (options.metadata && metadataHandler && "metadata" in result) {
            metadataHandler(result.metadata, res);
        } else {
            res.json(result);
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
}

Test_Server.get("/api/Account/HomeFeed", async (req: Request, res: Response) => {
    const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose, sort: req.query.sort };
    await handleYouTubeDLXRequest(YouTubeDLX.Account.HomeFeed, options, res);
});

Test_Server.get("/api/Account/SubscriptionsFeed", async (req: Request, res: Response) => {
    const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose };
    await handleYouTubeDLXRequest(YouTubeDLX.Account.SubscriptionsFeed, options, res);
});

Test_Server.get("/api/Account/UnseenNotifications", async (req: Request, res: Response) => {
    const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose };
    await handleYouTubeDLXRequest(YouTubeDLX.Account.UnseenNotifications, options, res);
});

Test_Server.get("/api/Account/History", async (req: Request, res: Response) => {
    const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose, sort: req.query.sort };
    await handleYouTubeDLXRequest(YouTubeDLX.Account.History, options, res);
});

Test_Server.get("/api/Search/Channel/Single", async (req: Request, res: Response) => {
    const options = { channelLink: req.query.channelLink };
    await handleYouTubeDLXRequest(YouTubeDLX.Search.Channel.Single, options, res);
});

Test_Server.get("/api/Search/Channel/Multiple", async (req: Request, res: Response) => {
    const options = { query: req.query.query };
    await handleYouTubeDLXRequest(YouTubeDLX.Search.Channel.Multiple, options, res);
});

Test_Server.get("/api/Search/Video/Single", async (req: Request, res: Response) => {
    const options = { videoLink: req.query.videoLink };
    await handleYouTubeDLXRequest(YouTubeDLX.Search.Video.Single, options, res);
});

Test_Server.get("/api/Search/Video/Multiple", async (req: Request, res: Response) => {
    const options = { query: req.query.query };
    await handleYouTubeDLXRequest(YouTubeDLX.Search.Video.Multiple, options, res);
});

Test_Server.get("/api/Search/Playlist/Single", async (req: Request, res: Response) => {
    const options = { playlistLink: req.query.playlistLink };
    await handleYouTubeDLXRequest(YouTubeDLX.Search.Playlist.Single, options, res);
});

Test_Server.get("/api/Search/Playlist/Multiple", async (req: Request, res: Response) => {
    const options = { playlistLink: req.query.query };
    await handleYouTubeDLXRequest(YouTubeDLX.Search.Playlist.Multiple, options, res);
});

Test_Server.get("/api/Misc/System/Help", async (req: Request, res: Response) => {
    try {
        const helpUrl = await YouTubeDLX.Misc.System.Help();
        res.json({ helpUrl });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

Test_Server.get("/api/Misc/Video/Extract", async (req: Request, res: Response) => {
    const options = { query: req.query.query, verbose: req.query.verbose, useTor: req.query.useTor };
    await handleYouTubeDLXRequest(YouTubeDLX.Misc.Video.Extract, options, res);
});

Test_Server.get("/api/Misc/Video/Formats", async (req: Request, res: Response) => {
    const options = { query: req.query.query, verbose: req.query.verbose };
    await handleYouTubeDLXRequest(YouTubeDLX.Misc.Video.Formats, options, res);
});

Test_Server.get("/api/Misc/Video/Comments", async (req: Request, res: Response) => {
    const options = { query: req.query.query, verbose: req.query.verbose };
    await handleYouTubeDLXRequest(YouTubeDLX.Misc.Video.Comments, options, res);
});

Test_Server.get("/api/Misc/Video/Transcript", async (req: Request, res: Response) => {
    const options = { videoLink: req.query.videoLink, verbose: req.query.verbose };
    await handleYouTubeDLXRequest(YouTubeDLX.Misc.Video.Transcript, options, res);
});

Test_Server.get("/api/Misc/Video/Related", async (req: Request, res: Response) => {
    const options = { videoId: req.query.videoId };
    await handleYouTubeDLXRequest(YouTubeDLX.Misc.Video.Related, options, res);
});

Test_Server.get("/api/Video/Custom", async (req: Request, res: Response) => {
    const options = {
        query: req.query.query,
        output: req.query.output || path.resolve(process.cwd(), "./output"),
        resolution: req.query.resolution,
        filter: req.query.filter,
        stream: req.query.stream,
        verbose: req.query.verbose,
        metadata: req.query.metadata,
    };
    await handleYouTubeDLXRequest(
        YouTubeDLX.Video.Custom,
        options,
        res,
        (streamData, res) => streamData.pipe(res),
        (metadata, res) => res.json(metadata),
    );
});

Test_Server.get("/api/Video/Highest", async (req: Request, res: Response) => {
    const options = {
        query: req.query.query,
        output: req.query.output || path.resolve(process.cwd(), "./output"),
        filter: req.query.filter,
        stream: req.query.stream,
        verbose: req.query.verbose,
        metadata: req.query.metadata,
    };
    await handleYouTubeDLXRequest(
        YouTubeDLX.Video.Highest,
        options,
        res,
        (streamData, res) => streamData.pipe(res),
        (metadata, res) => res.json(metadata),
    );
});

Test_Server.get("/api/Video/Lowest", async (req: Request, res: Response) => {
    const options = {
        query: req.query.query,
        output: req.query.output || path.resolve(process.cwd(), "./output"),
        filter: req.query.filter,
        stream: req.query.stream,
        verbose: req.query.verbose,
        metadata: req.query.metadata,
    };
    await handleYouTubeDLXRequest(
        YouTubeDLX.Video.Lowest,
        options,
        res,
        (streamData, res) => streamData.pipe(res),
        (metadata, res) => res.json(metadata),
    );
});

Test_Server.get("/api/Audio/Custom", async (req: Request, res: Response) => {
    const options = {
        query: req.query.query,
        resolution: req.query.resolution,
        output: req.query.output || path.resolve(process.cwd(), "./output"),
        filter: req.query.filter,
        stream: req.query.stream,
        verbose: req.query.verbose,
        metadata: req.query.metadata,
    };
    await handleYouTubeDLXRequest(
        YouTubeDLX.Audio.Custom,
        options,
        res,
        (streamData, res) => streamData.pipe(res),
        (metadata, res) => res.json(metadata),
    );
});

Test_Server.get("/api/Audio/Highest", async (req: Request, res: Response) => {
    const options = {
        query: req.query.query,
        output: req.query.output || path.resolve(process.cwd(), "./output"),
        filter: req.query.filter,
        stream: req.query.stream,
        verbose: req.query.verbose,
        metadata: req.query.metadata,
    };
    await handleYouTubeDLXRequest(
        YouTubeDLX.Audio.Highest,
        options,
        res,
        (streamData, res) => streamData.pipe(res),
        (metadata, res) => res.json(metadata),
    );
});

Test_Server.get("/api/Audio/Lowest", async (req: Request, res: Response) => {
    const options = {
        query: req.query.query,
        output: req.query.output || path.resolve(process.cwd(), "./output"),
        filter: req.query.filter,
        stream: req.query.stream,
        verbose: req.query.verbose,
        metadata: req.query.metadata,
    };
    await handleYouTubeDLXRequest(
        YouTubeDLX.Audio.Lowest,
        options,
        res,
        (streamData, res) => streamData.pipe(res),
        (metadata, res) => res.json(metadata),
    );
});

Test_Server.get("/api/Audio_Video/Custom", async (req: Request, res: Response) => {
    const options = {
        query: req.query.query,
        resolution: req.query.resolution,
        output: req.query.output || path.resolve(process.cwd(), "./output"),
        filter: req.query.filter,
        stream: req.query.stream,
        verbose: req.query.verbose,
        metadata: req.query.metadata,
    };
    await handleYouTubeDLXRequest(
        YouTubeDLX.Audio_Video.Custom,
        options,
        res,
        (streamData, res) => streamData.pipe(res),
        (metadata, res) => res.json(metadata),
    );
});

Test_Server.get("/api/Audio_Video/Highest", async (req: Request, res: Response) => {
    const options = {
        query: req.query.query,
        output: req.query.output || path.resolve(process.cwd(), "./output"),
        filter: req.query.filter,
        stream: req.query.stream,
        verbose: req.query.verbose,
        metadata: req.query.metadata,
    };
    await handleYouTubeDLXRequest(
        YouTubeDLX.Audio_Video.Highest,
        options,
        res,
        (streamData, res) => streamData.pipe(res),
        (metadata, res) => res.json(metadata),
    );
});

Test_Server.get("/api/Audio_Video/Lowest", async (req: Request, res: Response) => {
    const options = {
        query: req.query.query,
        output: req.query.output || path.resolve(process.cwd(), "./output"),
        filter: req.query.filter,
        stream: req.query.stream,
        verbose: req.query.verbose,
        metadata: req.query.metadata,
    };
    await handleYouTubeDLXRequest(
        YouTubeDLX.Audio_Video.Lowest,
        options,
        res,
        (streamData, res) => streamData.pipe(res),
        (metadata, res) => res.json(metadata),
    );
});

Test_Server.listen(3000, () => console.log(`Server running on port 3000`));
