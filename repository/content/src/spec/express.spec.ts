import YouTubeDLX from "..";
import express from "express";
import * as path from "path";
const Test_Server = express();
Test_Server.use(express.json());
function wrapEmitter(emitter, eventType = "data") {
    return new Promise((resolve, reject) => {
        emitter.on(eventType, resolve);
        emitter.on("error", reject);
    });
}
Test_Server.get("/api/Account/HomeFeed", async (req: any, res: any) => {
    try {
        const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose, sort: req.query.sort };
        const emitter = YouTubeDLX.Account.HomeFeed(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Account/SubscriptionsFeed", async (req: any, res: any) => {
    try {
        const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose };
        const emitter = YouTubeDLX.Account.SubscriptionsFeed(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Account/UnseenNotifications", async (req: any, res: any) => {
    try {
        const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose };
        const emitter = YouTubeDLX.Account.UnseenNotifications(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Account/History", async (req: any, res: any) => {
    try {
        const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose, sort: req.query.sort };
        const emitter = YouTubeDLX.Account.History(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Search/Channel/Single", async (req: any, res: any) => {
    try {
        const options = { channelLink: req.query.channelLink };
        const emitter = YouTubeDLX.Search.Channel.Single(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Search/Channel/Multiple", async (req: any, res: any) => {
    try {
        const options = { query: req.query.query };
        const emitter = YouTubeDLX.Search.Channel.Multiple(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Search/Video/Single", async (req: any, res: any) => {
    try {
        const options = { videoLink: req.query.videoLink };
        const emitter = YouTubeDLX.Search.Video.Single(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Search/Video/Multiple", async (req: any, res: any) => {
    try {
        const options = { query: req.query.query };
        const emitter = YouTubeDLX.Search.Video.Multiple(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Search/Playlist/Single", async (req: any, res: any) => {
    try {
        const options = { playlistLink: req.query.playlistLink };
        const emitter = YouTubeDLX.Search.Playlist.Single(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Search/Playlist/Multiple", async (req: any, res: any) => {
    try {
        const options = { playlistLink: req.query.query };
        const emitter = YouTubeDLX.Search.Playlist.Multiple(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Misc/System/Help", async (req: any, res: any) => {
    try {
        const helpUrl = await YouTubeDLX.Misc.System.Help();
        res.json({ helpUrl });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Misc/Video/Extract", async (req: any, res: any) => {
    try {
        const options = { query: req.query.query, verbose: req.query.verbose, useTor: req.query.useTor };
        const emitter = YouTubeDLX.Misc.Video.Extract(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Misc/Video/Formats", async (req: any, res: any) => {
    try {
        const options = { query: req.query.query, verbose: req.query.verbose };
        const emitter = YouTubeDLX.Misc.Video.Formats(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Misc/Video/Comments", async (req: any, res: any) => {
    try {
        const options = { query: req.query.query, verbose: req.query.verbose };
        const emitter = YouTubeDLX.Misc.Video.Comments(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Misc/Video/Transcript", async (req: any, res: any) => {
    try {
        const options = { videoLink: req.query.videoLink, verbose: req.query.verbose };
        const emitter = YouTubeDLX.Misc.Video.Transcript(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Misc/Video/Related", async (req: any, res: any) => {
    try {
        const options = { videoId: req.query.videoId };
        const emitter = YouTubeDLX.Misc.Video.Related(options);
        const data = await wrapEmitter(emitter);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Video/Custom", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            resolution: req.query.resolution,
            filter: req.query.filter,
            stream: req.query.stream,
            verbose: req.query.verbose,
            metadata: req.query.metadata,
        };
        const emitter = YouTubeDLX.Video.Custom(options);
        if (options.stream) {
            emitter.on("stream", streamData => streamData.pipe(res));
            emitter.on("error", error => res.status(500).send(error.message));
        } else if (options.metadata) {
            const metadata = await wrapEmitter(emitter, "metadata");
            res.json(metadata);
        } else {
            const data = await wrapEmitter(emitter);
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Video/Highest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream,
            verbose: req.query.verbose,
            metadata: req.query.metadata,
        };
        const emitter = YouTubeDLX.Video.Highest(options);
        if (options.stream) {
            emitter.on("stream", streamData => streamData.pipe(res));
            emitter.on("error", error => res.status(500).send(error.message));
        } else if (options.metadata) {
            const metadata = await wrapEmitter(emitter, "metadata");
            res.json(metadata);
        } else {
            const data = await wrapEmitter(emitter);
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Video/Lowest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream,
            verbose: req.query.verbose,
            metadata: req.query.metadata,
        };
        const emitter = YouTubeDLX.Video.Lowest(options);
        if (options.stream) {
            emitter.on("stream", streamData => streamData.pipe(res));
            emitter.on("error", error => res.status(500).send(error.message));
        } else if (options.metadata) {
            const metadata = await wrapEmitter(emitter, "metadata");
            res.json(metadata);
        } else {
            const data = await wrapEmitter(emitter);
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Audio/Custom", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            resolution: req.query.resolution,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream,
            verbose: req.query.verbose,
            metadata: req.query.metadata,
        };
        const emitter = YouTubeDLX.Audio.Custom(options);
        if (options.stream) {
            emitter.on("stream", streamData => streamData.pipe(res));
            emitter.on("error", error => res.status(500).send(error.message));
        } else if (options.metadata) {
            const metadata = await wrapEmitter(emitter, "metadata");
            res.json(metadata);
        } else {
            const data = await wrapEmitter(emitter);
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Audio/Highest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream,
            verbose: req.query.verbose,
            metadata: req.query.metadata,
        };
        const emitter = YouTubeDLX.Audio.Highest(options);
        if (options.stream) {
            emitter.on("stream", streamData => streamData.pipe(res));
            emitter.on("error", error => res.status(500).send(error.message));
        } else if (options.metadata) {
            const metadata = await wrapEmitter(emitter, "metadata");
            res.json(metadata);
        } else {
            const data = await wrapEmitter(emitter);
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Audio/Lowest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream,
            verbose: req.query.verbose,
            metadata: req.query.metadata,
        };
        const emitter = YouTubeDLX.Audio.Lowest(options);
        if (options.stream) {
            emitter.on("stream", streamData => streamData.pipe(res));
            emitter.on("error", error => res.status(500).send(error.message));
        } else if (options.metadata) {
            const metadata = await wrapEmitter(emitter, "metadata");
            res.json(metadata);
        } else {
            const data = await wrapEmitter(emitter);
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Audio_Video/Custom", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            resolution: req.query.resolution,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream,
            verbose: req.query.verbose,
            metadata: req.query.metadata,
        };
        const emitter = YouTubeDLX.Audio_Video.Custom(options);
        if (options.stream) {
            emitter.on("stream", streamData => streamData.pipe(res));
            emitter.on("error", error => res.status(500).send(error.message));
        } else if (options.metadata) {
            const metadata = await wrapEmitter(emitter, "metadata");
            res.json(metadata);
        } else {
            const data = await wrapEmitter(emitter);
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Audio_Video/Highest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream,
            verbose: req.query.verbose,
            metadata: req.query.metadata,
        };
        const emitter = YouTubeDLX.Audio_Video.Highest(options);
        if (options.stream) {
            emitter.on("stream", streamData => streamData.pipe(res));
            emitter.on("error", error => res.status(500).send(error.message));
        } else if (options.metadata) {
            const metadata = await wrapEmitter(emitter, "metadata");
            res.json(metadata);
        } else {
            const data = await wrapEmitter(emitter);
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.get("/api/Audio_Video/Lowest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream,
            verbose: req.query.verbose,
            metadata: req.query.metadata,
        };
        const emitter = YouTubeDLX.Audio_Video.Lowest(options);
        if (options.stream) {
            emitter.on("stream", streamData => streamData.pipe(res));
            emitter.on("error", error => res.status(500).send(error.message));
        } else if (options.metadata) {
            const metadata = await wrapEmitter(emitter, "metadata");
            res.json(metadata);
        } else {
            const data = await wrapEmitter(emitter);
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});
Test_Server.listen(3000, () => console.log(`Server running on port 3000`));
