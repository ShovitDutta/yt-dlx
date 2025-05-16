/**
 * Extracts the YouTube video ID (11 characters) or playlist ID from a YouTube link using async/await.
 * Handles various URL formats including standard watch URLs, share links, embed links, and playlist URLs.
 *
 * Note: This function attempts to extract the first matching ID based on the order of patterns.
 * For URLs containing both video (`v=`) and playlist (`list=`) parameters, the video ID will likely be returned first.
 * If the primary intent is to get the playlist ID when a playlist pattern is present, the pattern order or logic might need adjustment.
 * The current implementation returns the ID captured by the first matching pattern.
 *
 * @param videoLink The YouTube video, short link, embed link, or playlist URL.
 * @returns A Promise resolving with the extracted video ID (11 characters) or playlist ID (longer string), or `undefined` if no valid ID is found in the expected format.
 */
export default async function YouTubeID(videoLink: string): Promise<string | undefined> {
    // Check if the link is a likely YouTube link
    if (!/youtu\.?be/i.test(videoLink)) {
        return undefined; // Not a YouTube link, return undefined immediately
    }

    const patterns: RegExp[] = [
        /youtu\.be\/([^#\&\?]{11})/, // Shortened youtube link
        /\?v=([^#\&\?]{11})/, // Standard watch link param
        /\&v=([^#\&\?]{11})/, // Standard watch link with other params
        /embed\/([^#\&\?]{11})/, // Embed link
        /\/v\/([^#\&\?]{11})/, // /v/ format
        /list=([^#\&\?]+)/, // Playlist link param
        /playlist\?list=([^#\&\?]+)/, // Standard playlist link
    ];

    for (const pattern of patterns) {
        const match = pattern.exec(videoLink);
        if (match && match[1]) {
            // Return the captured group (the ID)
            return match[1];
        }
    }

    // No pattern matched
    return undefined;
}
