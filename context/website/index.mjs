import YouTubeDLX from "yt-dlx";
const YouTube = YouTubeDLX.default;
(async () => {
    const response = await YouTube.Misc.Video.Extract({ query: "https://www.youtube.com/watch?v=njX2bu-_Vw4", verbose: true });
    console.log(JSON.stringify(response));
})().catch(console.error);
