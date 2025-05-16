import colors from "colors";
import { z, ZodError } from "zod";
import { Client, Video } from "youtubei"; // Assuming 'youtubei' provides a 'Client' class and a 'Video' type or similar structure
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await

// Define the Zod schema for input validation
const ZodSchema = z.object({
    query: z.string().min(2), // Mandatory query, min 2 characters
    minViews: z.number().optional(), // Optional minimum view count
    maxViews: z.number().optional(), // Optional maximum view count
    verbose: z.boolean().optional(), // Optional verbose logging flag
    orderBy: z.enum(["relevance", "viewCount", "rating", "date"]).optional(), // Optional sorting order
});

// Define the interface for the video data structure returned by the search
export interface SearchVideoResult {
    id: string;
    title: string;
    isLive: boolean;
    duration: number | null; // duration might be null for live streams or unlisted videos
    viewCount: number | null; // viewCount might be null
    uploadDate: string | null; // uploadDate might be null
    channelid: string | undefined; // Channel ID might be optional
    thumbnails: { url: string; width: number; height: number }[]; // Assuming thumbnail structure
    description: string | null; // Description might be null
    channelname: string | undefined; // Channel name might be optional
}

/**
 * @shortdesc Searches for YouTube videos with filtering and sorting options using async/await instead of events.
 *
 * @description This function performs a video search on YouTube based on a provided query using async/await. It allows filtering results by minimum and maximum view counts and sorting the results by view count or upload date.
 *
 * The function requires a search query and returns a Promise that resolves with an array of video objects matching the criteria, or rejects with an error.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param {string} options.query - The search term. **Required**, min 2 characters.
 * @param {number} [options.minViews] - Minimum view count filter.
 * @param {number} [options.maxViews] - Maximum view count filter.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @param {("relevance" | "viewCount" | "rating" | "date")} [options.orderBy] - Specify the sorting order. Implemented sorts are by `viewCount` (desc) and `date` (desc). "relevance" and "rating" sorting are handled by the underlying search library.
 *
 * @returns {Promise<SearchVideoResult[]>} A Promise that resolves with an array of video objects upon success.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the search request fails, or if no videos are found matching the specified criteria after filtering/sorting.
 */
export default async function search_videos({ query, minViews, maxViews, orderBy, verbose }: z.infer<typeof ZodSchema>): Promise<SearchVideoResult[]> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse({ query, minViews, maxViews, orderBy, verbose });

        // Initialize youtubei client
        const youtube = new Client(); // Assuming Client constructor is synchronous

        // Perform the asynchronous search
        // Assuming Youtube returns a Promise<SearchResults> where SearchResults has an 'items' array of video objects
        const searchResults = await youtube.search(query, { type: "video" });

        // Map the search results to the desired SearchVideoResult structure
        let videos: SearchVideoResult[] = searchResults.items
            .filter((item: any) => item.type === "video") // Ensure only video items are processed
            .map((item: any) => ({
                id: item.id,
                title: item.title,
                isLive: item.isLive, // Assuming property name is isLive
                duration: item.duration, // Assuming duration is a number or null
                viewCount: item.viewCount, // Assuming viewCount is a number or null
                uploadDate: item.uploadDate, // Assuming uploadDate is a string or null
                channelid: item.channel?.id, // Optional chaining for channel properties
                thumbnails:
                    item.thumbnails?.map((thumb: { url: string; width: number; height: number }) => ({
                        // Map thumbnail objects
                        url: thumb.url,
                        width: thumb.width,
                        height: thumb.height,
                    })) || [], // Default to empty array if thumbnails missing
                description: item.description || null, // Default to null if description missing
                channelname: item.channel?.name, // Optional chaining for channel properties
                // Note: Original singleVideoType included 'tags' and 'likeCount', but search results
                // typically don't include these. Mapping only available properties.
            }));

        // Apply view count filters if provided
        if (minViews !== undefined) {
            videos = videos.filter(video => video.viewCount !== null && video.viewCount >= minViews);
        }
        if (maxViews !== undefined) {
            videos = videos.filter(video => video.viewCount !== null && video.viewCount <= maxViews);
        }

        // Apply sorting if orderBy is specified
        if (orderBy) {
            if (orderBy === "viewCount") {
                // Sort by view count descending, handling potential nulls by putting them at the end
                videos.sort((a, b) => {
                    if (a.viewCount === null && b.viewCount === null) return 0;
                    if (a.viewCount === null) return 1; // nulls after non-nulls
                    if (b.viewCount === null) return -1; // non-nulls before nulls
                    return b.viewCount - a.viewCount; // Sort descending for non-nulls
                });
            } else if (orderBy === "date") {
                // Sort by date descending, handling potential nulls by putting them at the end
                videos.sort((a, b) => {
                    // Attempt to parse dates or treat nulls/invalid dates carefully
                    const dateA = a.uploadDate ? new Date(a.uploadDate).getTime() : NaN;
                    const dateB = b.uploadDate ? new Date(b.uploadDate).getTime() : NaN;

                    if (isNaN(dateA) && isNaN(dateB)) return 0;
                    if (isNaN(dateA)) return 1; // Invalid dates/nulls after valid dates
                    if (isNaN(dateB)) return -1; // Valid dates before invalid dates/nulls

                    return dateB - dateA; // Sort descending for valid dates
                });
            }
            // "relevance" and "rating" are typically handled by the search query itself
        }

        // Check if any videos remain after filtering/sorting
        if (videos.length === 0) {
            // If no videos match criteria or were found initially and filtered out, throw an error.
            throw new Error(`${colors.red("@error: ")} No videos found matching the given criteria.`);
        }

        // If successful and videos are found, return the array of videos. The async function wraps this in a resolved Promise.
        return videos;
    } catch (error: any) {
        // Catch any errors that occurred during the process (Zod validation, search request, filtering/sorting issues).
        // Format the error message based on the error type and re-throw it to reject the main function's Promise.
        if (error instanceof ZodError) {
            // Handle Zod validation errors by formatting the error details.
            throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        } else if (error instanceof Error) {
            // Re-throw standard Error objects with their existing message.
            throw new Error(`${colors.red("@error:")} ${error.message}`);
        } else {
            // Handle any other unexpected error types by converting them to a string.
            throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
        }
    } finally {
        // This block executes after the try block successfully returns or the catch block throws.
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
