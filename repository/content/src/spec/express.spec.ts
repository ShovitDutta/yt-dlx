import express from "express";
import YouTubeDLX from ".."; // Assuming this imports the refactored functions
import path from "path"; // Used for default output paths
// import { PassThrough } from "stream"; // PassThrough might not be strictly needed here
import ffmpeg from "fluent-ffmpeg"; // Import ffmpeg to type StreamResult

const port = 3000;
const server = express();
server.use(express.json());

// Define types based on the return types of the refactored functions
// These mirror the definitions from the refactored function files
type DownloadResult = string;

// Simplified MetadataResult for server-side assertion.
// A more precise type would mirror the exact object structure returned by each function
// in metadata mode (e.g., containing metaData, formats, filename).
type MetadataResult = object;

interface StreamResult {
    filename: string;
    ffmpeg: ffmpeg.FfmpegCommand; // Use the imported ffmpeg type
}

// Account Routes (No change needed)
server.get("/api/Account/HomeFeed", async (req: any, res: any) => {
    try {
        const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose, sort: req.query.sort };
        const data = await YouTubeDLX.Account.HomeFeed(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Account/HomeFeed:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Account/SubscriptionsFeed", async (req: any, res: any) => {
    try {
        const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose };
        const data = await YouTubeDLX.Account.SubscriptionsFeed(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Account/SubscriptionsFeed:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Account/UnseenNotifications", async (req: any, res: any) => {
    try {
        const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose };
        const data = await YouTubeDLX.Account.UnseenNotifications(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Account/UnseenNotifications:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Account/History", async (req: any, res: any) => {
    try {
        const options = { cookies: req.query.YouTubeDLX_COOKIES, verbose: req.query.verbose, sort: req.query.sort };
        const data = await YouTubeDLX.Account.History(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Account/History:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

// Search Routes (No change needed)
server.get("/api/Search/Channel/Single", async (req: any, res: any) => {
    try {
        const options = { channelLink: req.query.channelLink };
        const data = await YouTubeDLX.Search.Channel.Single(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Search/Channel/Single:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Search/Channel/Multiple", async (req: any, res: any) => {
    try {
        const options = { query: req.query.query };
        const data = await YouTubeDLX.Search.Channel.Multiple(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Search/Channel/Multiple:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Search/Video/Single", async (req: any, res: any) => {
    try {
        const options = { videoLink: req.query.videoLink };
        const data = await YouTubeDLX.Search.Video.Single(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Search/Video/Single:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Search/Video/Multiple", async (req: any, res: any) => {
    try {
        const options = { query: req.query.query };
        const data = await YouTubeDLX.Search.Video.Multiple(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Search/Video/Multiple:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Search/Playlist/Single", async (req: any, res: any) => {
    try {
        const options = { playlistLink: req.query.playlistLink };
        const data = await YouTubeDLX.Search.Playlist.Single(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Search/Playlist/Single:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Search/Playlist/Multiple", async (req: any, res: any) => {
    try {
        const options = { playlistLink: req.query.query };
        const data = await YouTubeDLX.Search.Playlist.Multiple(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Search/Playlist/Multiple:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

// Misc Routes (No change needed)
server.get("/api/Misc/System/Help", async (req: any, res: any) => {
    try {
        const helpUrl = await YouTubeDLX.Misc.System.Help();
        res.json({ helpUrl });
    } catch (error) {
        console.error("Error in /api/Misc/System/Help:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Misc/Video/Extract", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            verbose: req.query.verbose === "true",
            useTor: req.query.useTor === "true",
        };
        const data = await YouTubeDLX.Misc.Video.Extract(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Misc/Video/Extract:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Misc/Video/Formats", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            verbose: req.query.verbose === "true",
        };
        const data = await YouTubeDLX.Misc.Video.Formats(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Misc/Video/Formats:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Misc/Video/Comments", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            verbose: req.query.verbose === "true",
        };
        const data = await YouTubeDLX.Misc.Video.Comments(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Misc/Video/Comments:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Misc/Video/Transcript", async (req: any, res: any) => {
    try {
        const options = {
            videoLink: req.query.videoLink,
            verbose: req.query.verbose === "true",
        };
        const data = await YouTubeDLX.Misc.Video.Transcript(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Misc/Video/Transcript:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

server.get("/api/Misc/Video/Related", async (req: any, res: any) => {
    try {
        const options = { videoId: req.query.videoId };
        const data = await YouTubeDLX.Misc.Video.Related(options);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/Misc/Video/Related:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

// Video Routes (Updated with type assertions using re-declared types)
server.get("/api/Video/Custom", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            resolution: req.query.resolution, // Assuming resolution is handled as string or number
            filter: req.query.filter,
            stream: req.query.stream === "true",
            verbose: req.query.verbose === "true",
            metadata: req.query.metadata === "true",
        };

        const result = await YouTubeDLX.Video.Custom(options); // Await the promise

        if (options.metadata) {
            // If metadata is true, assert result as MetadataResult
            res.json(result as MetadataResult);
        } else if (options.stream) {
            // If stream is true, assert result as StreamResult
            const streamData = result as StreamResult;
            const ffmpegStream = streamData.ffmpeg;

            ffmpegStream.on("error", (streamError: any) => {
                console.error("FFmpeg Stream Error in /api/Video/Custom:", streamError);
                if (!res.headersSent) {
                    res.status(500).send(streamError.message || "FFmpeg streaming error");
                } else {
                    res.destroy();
                }
            });

            ffmpegStream.pipe(res); // Pipe the stream
        } else {
            // Otherwise (download mode), assert result as DownloadResult (string)
            const outputPath = result as DownloadResult;
            res.json({ outputPath }); // Send the path as JSON
        }
    } catch (error) {
        console.error("Error in /api/Video/Custom:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
        } else {
            res.destroy();
        }
    }
});

server.get("/api/Video/Highest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream === "true",
            verbose: req.query.verbose === "true",
            metadata: req.query.metadata === "true",
        };

        const result = await YouTubeDLX.Video.Highest(options); // Await the promise

        if (options.metadata) {
            res.json(result as MetadataResult);
        } else if (options.stream) {
            const streamData = result as StreamResult;
            const ffmpegStream = streamData.ffmpeg;

            ffmpegStream.on("error", (streamError: any) => {
                console.error("FFmpeg Stream Error in /api/Video/Highest:", streamError);
                if (!res.headersSent) {
                    res.status(500).send(streamError.message || "FFmpeg streaming error");
                } else {
                    res.destroy();
                }
            });

            ffmpegStream.pipe(res);
        } else {
            const outputPath = result as DownloadResult;
            res.json({ outputPath });
        }
    } catch (error) {
        console.error("Error in /api/Video/Highest:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
        } else {
            res.destroy();
        }
    }
});

server.get("/api/Video/Lowest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream === "true",
            verbose: req.query.verbose === "true",
            metadata: req.query.metadata === "true",
        };

        const result = await YouTubeDLX.Video.Lowest(options); // Await the promise

        if (options.metadata) {
            res.json(result as MetadataResult);
        } else if (options.stream) {
            const streamData = result as StreamResult;
            const ffmpegStream = streamData.ffmpeg;

            ffmpegStream.on("error", (streamError: any) => {
                console.error("FFmpeg Stream Error in /api/Video/Lowest:", streamError);
                if (!res.headersSent) {
                    res.status(500).send(streamError.message || "FFmpeg streaming error");
                } else {
                    res.destroy();
                }
            });

            ffmpegStream.pipe(res);
        } else {
            const outputPath = result as DownloadResult;
            res.json({ outputPath });
        }
    } catch (error) {
        console.error("Error in /api/Video/Lowest:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
        } else {
            res.destroy();
        }
    }
});

// Audio Routes (Updated with type assertions using re-declared types)
server.get("/api/Audio/Custom", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            resolution: req.query.resolution, // Assuming resolution is handled as string or number
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream === "true",
            verbose: req.query.verbose === "true",
            metadata: req.query.metadata === "true",
        };

        const result = await YouTubeDLX.Audio.Custom(options); // Await the promise

        if (options.metadata) {
            res.json(result as MetadataResult);
        } else if (options.stream) {
            const streamData = result as StreamResult;
            const ffmpegStream = streamData.ffmpeg;

            ffmpegStream.on("error", (streamError: any) => {
                console.error("FFmpeg Stream Error in /api/Audio/Custom:", streamError);
                if (!res.headersSent) {
                    res.status(500).send(streamError.message || "FFmpeg streaming error");
                } else {
                    res.destroy();
                }
            });

            ffmpegStream.pipe(res);
        } else {
            const outputPath = result as DownloadResult;
            res.json({ outputPath });
        }
    } catch (error) {
        console.error("Error in /api/Audio/Custom:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
        } else {
            res.destroy();
        }
    }
});

server.get("/api/Audio/Highest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream === "true",
            verbose: req.query.verbose === "true",
            metadata: req.query.metadata === "true",
        };

        const result = await YouTubeDLX.Audio.Highest(options); // Await the promise

        if (options.metadata) {
            res.json(result as MetadataResult);
        } else if (options.stream) {
            const streamData = result as StreamResult;
            const ffmpegStream = streamData.ffmpeg;

            ffmpegStream.on("error", (streamError: any) => {
                console.error("FFmpeg Stream Error in /api/Audio/Highest:", streamError);
                if (!res.headersSent) {
                    res.status(500).send(streamError.message || "FFmpeg streaming error");
                } else {
                    res.destroy();
                }
            });

            ffmpegStream.pipe(res);
        } else {
            const outputPath = result as DownloadResult;
            res.json({ outputPath });
        }
    } catch (error) {
        console.error("Error in /api/Audio/Highest:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
        } else {
            res.destroy();
        }
    }
});

server.get("/api/Audio/Lowest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream === "true",
            verbose: req.query.verbose === "true",
            metadata: req.query.metadata === "true",
        };

        const result = await YouTubeDLX.Audio.Lowest(options); // Await the promise

        if (options.metadata) {
            res.json(result as MetadataResult);
        } else if (options.stream) {
            const streamData = result as StreamResult;
            const ffmpegStream = streamData.ffmpeg;

            ffmpegStream.on("error", (streamError: any) => {
                console.error("FFmpeg Stream Error in /api/Audio/Lowest:", streamError);
                if (!res.headersSent) {
                    res.status(500).send(streamError.message || "FFmpeg streaming error");
                } else {
                    res.destroy();
                }
            });

            ffmpegStream.pipe(res);
        } else {
            const outputPath = result as DownloadResult;
            res.json({ outputPath });
        }
    } catch (error) {
        console.error("Error in /api/Audio/Lowest:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
        } else {
            res.destroy();
        }
    }
});

// Audio_Video Routes (Updated with type assertions using re-declared types)
server.get("/api/Audio_Video/Custom", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            resolution: req.query.resolution, // Assuming resolution is handled as string or number
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream === "true",
            verbose: req.query.verbose === "true",
            metadata: req.query.metadata === "true",
        };

        const result = await YouTubeDLX.Audio_Video.Custom(options); // Await the promise

        if (options.metadata) {
            res.json(result as MetadataResult);
        } else if (options.stream) {
            const streamData = result as StreamResult;
            const ffmpegStream = streamData.ffmpeg;

            ffmpegStream.on("error", (streamError: any) => {
                console.error("FFmpeg Stream Error in /api/Audio_Video/Custom:", streamError);
                if (!res.headersSent) {
                    res.status(500).send(streamError.message || "FFmpeg streaming error");
                } else {
                    res.destroy();
                }
            });

            ffmpegStream.pipe(res);
        } else {
            const outputPath = result as DownloadResult;
            res.json({ outputPath });
        }
    } catch (error) {
        console.error("Error in /api/Audio_Video/Custom:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
        } else {
            res.destroy();
        }
    }
});

server.get("/api/Audio_Video/Highest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream === "true",
            verbose: req.query.verbose === "true",
            metadata: req.query.metadata === "true",
        };

        const result = await YouTubeDLX.Audio_Video.Highest(options); // Await the promise

        if (options.metadata) {
            res.json(result as MetadataResult);
        } else if (options.stream) {
            const streamData = result as StreamResult;
            const ffmpegStream = streamData.ffmpeg;

            ffmpegStream.on("error", (streamError: any) => {
                console.error("FFmpeg Stream Error in /api/Audio_Video/Highest:", streamError);
                if (!res.headersSent) {
                    res.status(500).send(streamError.message || "FFmpeg streaming error");
                } else {
                    res.destroy();
                }
            });

            ffmpegStream.pipe(res);
        } else {
            const outputPath = result as DownloadResult;
            res.json({ outputPath });
        }
    } catch (error) {
        console.error("Error in /api/Audio_Video/Highest:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
        } else {
            res.destroy();
        }
    }
});

server.get("/api/Audio_Video/Lowest", async (req: any, res: any) => {
    try {
        const options = {
            query: req.query.query,
            output: req.query.output || path.resolve(process.cwd(), "./output"),
            filter: req.query.filter,
            stream: req.query.stream === "true",
            verbose: req.query.verbose === "true",
            metadata: req.query.metadata === "true",
        };

        const result = await YouTubeDLX.Audio_Video.Lowest(options); // Await the promise

        if (options.metadata) {
            res.json(result as MetadataResult);
        } else if (options.stream) {
            const streamData = result as StreamResult;
            const ffmpegStream = streamData.ffmpeg;

            ffmpegStream.on("error", (streamError: any) => {
                console.error("FFmpeg Stream Error in /api/Audio_Video/Lowest:", streamError);
                if (!res.headersSent) {
                    res.status(500).send(streamError.message || "FFmpeg streaming error");
                } else {
                    res.destroy();
                }
            });

            ffmpegStream.pipe(res);
        } else {
            const outputPath = result as DownloadResult;
            res.json({ outputPath });
        }
    } catch (error) {
        console.error("Error in /api/Audio_Video/Lowest:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
        } else {
            res.destroy();
        }
    }
});

server.listen(port, () => console.log(`Server running on port ${port}`));
