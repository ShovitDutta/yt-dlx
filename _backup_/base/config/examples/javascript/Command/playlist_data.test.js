// =============================[ EXAMPLE CODE ]=============================
//
const YouTube = require("yt-dlx");
const colors = require("colors");

(async () => {
  try {
    const result = await YouTube.default.ytSearch.Playlist.Single({
      query: "playlist-LINK/ID",
    });
    console.log(result);
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
