// Suggestion: Add JSDoc comments to the function, explaining its purpose, parameters, and return value. Also, consider using a more modern approach for regular expressions and URL parsing, such as the `URL` constructor and the `String.prototype.matchAll` method.
export default function YouTubeID(videoLink: string): Promise<string | undefined> {
    return new Promise((resolve, _) => {
        if (/youtu\.?be/.test(videoLink)) {
            var i: number;
            var patterns: any = [
                /youtu\.be\/([^#\&\?]{11})/,
                /\?v=([^#\&\?]{11})/,
                /\&v=([^#\&\?]{11})/,
                /embed\/([^#\&\?]{11})/,
                /\/v\/([^#\&\?]{11})/,
                /list=([^#\&\?]+)/,
                /playlist\?list=([^#\&\?]+)/,
            ];
            for (i = 0; i < patterns.length; ++i) {
                if (patterns[i].test(videoLink)) {
                    if (i === patterns.length - 1) {
                        var match: any = patterns[i].exec(videoLink);
                        var playlistParams: any = new URLSearchParams(match[0]);
                        var videoId: any = playlistParams.get("v");
                        return resolve(videoId);
                    } else return resolve(patterns[i].exec(videoLink)[1]);
                }
            }
        }
        resolve(undefined);
    });
}
