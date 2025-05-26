export default async function YouTubeID(videoLink: string): Promise<string | undefined> {
    const patterns = [/youtu\.be\/([^#&?]{11})/, /\?v=([^#&?]{11})/, /&v=([^#&?]{11})/, /embed\/([^#&?]{11})/, /\/v\/([^#&?]{11})/, /list=([^#&?]+)/, /playlist\?list=([^#&?]+)/];
    for (const pattern of patterns) {
        const match = pattern.exec(videoLink);
        if (match) {
            if (pattern === patterns[patterns.length - 1]) {
                try {
                    const urlParams = new URLSearchParams(match[0]);
                    const videoId = urlParams.get("v");
                    return videoId || undefined;
                } catch (error) {
                    console.error("Error parsing URL: " + error);
                    return undefined;
                }
            } else return match[1];
        }
    }
    return undefined;
}
