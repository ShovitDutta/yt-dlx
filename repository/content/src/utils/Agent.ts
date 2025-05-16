import colors from "colors";
import Engine from "./Engine"; // Assuming Engine is refactored and returns a Promise
import { Client } from "youtubei"; // youtubei.js Client, assumed to have async methods
import YouTubeID from "./YouTubeId"; // Assuming YouTubeID is refactored and returns Promise<string | undefined>

/**
 * Fetches detailed information for a YouTube video using its ID via youtubei.js.
 * This function is asynchronous and utilizes await for fetching data from the youtubei.js client.
 *
 * @param options - The options for fetching video information.
 * @param options.videoId The unique identifier of the YouTube video.
 * @returns A Promise that resolves with a VideoInfoType object containing detailed video information, or null if fetching fails or no data is returned for the given ID.
 * @throws Throws an error if the process of fetching the video data encounters issues or the video ID is invalid according to the upstream service.
 */
export async function VideoInfo({ videoId }: { videoId: string }): Promise<VideoInfoType | null> {
    try {
        const youtube = new Client();
        // Await the asynchronous method call to get video data
        const VideoInfoData: any = await youtube.getVideo(videoId);

        // Check if video data was successfully retrieved
        if (!VideoInfoData) {
            // Throw a specific error if no data was returned
            throw new Error(`${colors.red("@error: ")} Unable to fetch video data for id: ${videoId}`);
        }

        // Return a structured object mapping relevant properties
        return {
            id: VideoInfoData.id,
            title: VideoInfoData.title,
            thumbnails: VideoInfoData.thumbnails, // Assuming thumbnails is an array of strings or similar structure
            uploadDate: VideoInfoData.uploadDate,
            description: VideoInfoData.description,
            duration: VideoInfoData.duration,
            isLive: VideoInfoData.isLiveContent,
            viewCount: VideoInfoData.viewCount,
            channelid: VideoInfoData.channel?.id, // Use optional chaining for safety
            channelname: VideoInfoData.channel?.name, // Use optional chaining for safety
            tags: VideoInfoData.tags, // Assuming tags is an array of strings or undefined
            likeCount: VideoInfoData.likeCount,
        };
    } catch (error: any) {
        // Catch any errors during the fetch process and re-throw with context
        throw new Error(`${colors.red("@error: ")} Error fetching video data: ${error.message}`);
    }
}

/**
 * Defines the structure for detailed information about a YouTube video, typically obtained from a direct video data fetch.
 */
export interface VideoInfoType {
    id: string;
    title: string;
    thumbnails: string[]; // Assuming this type based on common API responses
    uploadDate: string;
    description: string;
    duration: number;
    isLive: boolean;
    viewCount: number;
    channelid: string | undefined;
    channelname: string | undefined;
    tags: string[] | undefined; // Assuming this type
    likeCount: number | undefined;
}

/**
 * Defines the structure for information about a YouTube video item as returned in search results.
 */
export interface searchVideosType {
    id: string;
    title: string;
    isLive: boolean;
    duration: number;
    viewCount: number;
    uploadDate: string;
    channelid: string; // Assuming channel ID is always present in search results
    channelname: string; // Assuming channel name is always present in search results
    description: string; // Assuming description might be available in search results
    thumbnails: string[]; // Assuming this type
}

/**
 * Acts as an agent to process a YouTube query. It first attempts to extract a video ID.
 * If successful, it fetches detailed video info. If not, it performs a video search and uses the first result.
 * It then constructs a URL (using a potentially non-standard format from the original code) and passes it
 * to the Engine function for further processing. Uses async/await throughout its operations.
 *
 * @param options - The agent options.
 * @param options.query The input query string, which can be a YouTube video URL, a raw video ID, or a search term.
 * @param [options.useTor=false] A boolean flag to indicate whether to use Tor for anonymization (passed to Engine).
 * @param [options.verbose=false] A boolean flag to enable verbose logging during the process.
 * @returns A Promise that resolves with the result of the Engine function, which typically contains format details and metadata. Returns Promise<any> as in the original signature.
 * @throws Throws an error if video ID extraction fails, search yields no results, or fetching video info fails.
 */
export default async function Agent({ query, useTor = false, verbose = false }: { query: string; useTor?: boolean; verbose?: boolean }): Promise<any> {
    if (verbose && useTor) console.log(colors.green("@info:"), "Using Tor for request anonymization");

    let url: string;
    // Await the asynchronous YouTubeID function to extract video ID
    const videoId: string | undefined = await YouTubeID(query);
    const youtube = new Client(); // Initialize youtubei.js client

    if (!videoId) {
        // If no video ID was extracted, perform a search
        try {
            // Await the asynchronous search method from youtubei.js
            const searchResults = await youtube.search(query, { type: "video" });

            // Check if search returned any results
            if (searchResults.items.length === 0) {
                throw new Error(`${colors.red("@error: ")} Unable to find a video for query: ${query}`);
            }

            // Use the first video result found
            const video = searchResults.items[0];
            console.log(colors.green("@info:"), "preparing payload for", video.title);

            // Construct the URL for the Engine using the found video ID.
            // Note: The format `https://www.youtube.com/watch?v=${video.id}` seems non-standard
            // for typical yt-dlp/yt-dlx usage which usually expects the original YouTube URL or ID.
            // Preserving the original structure with correct string interpolation.
            url = `https://www.youtube.com/watch?v=${video.id}`;
        } catch (error: any) {
            // Catch and re-throw errors specifically from the search operation
            throw new Error(`${colors.red("@error: ")} Error during video search: ${error.message}`);
        }
    } else {
        // If a video ID was extracted, fetch detailed video information
        // Await the asynchronous VideoInfo function
        const TubeBody = await VideoInfo({ videoId });

        // Check if video info was successfully fetched
        if (!TubeBody) {
            throw new Error(`${colors.red("@error: ")} Unable to get video data for id: ${videoId}`);
        }

        console.log(colors.green("@info:"), "preparing payload for", TubeBody.title);

        // Construct the URL for the Engine using the video ID.
        // Note: Preserving the potentially non-standard URL format from the original code.
        url = `https://www.youtube.com/watch?v=${TubeBody.id}`;
    }

    // Finally, call and await the Engine function with the determined URL and options
    return await Engine({ query: url, useTor, verbose });
}
