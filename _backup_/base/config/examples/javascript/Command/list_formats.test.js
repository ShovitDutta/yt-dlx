// =============================[ EXAMPLE CODE ]=============================
//
const YouTube = require("yt-dlx");
const colors = require("colors");

(async () => {
  try {
    await YouTube.default.info.list_formats({
      verbose: true,
      query: "video-NAME/ID/URL",
    });
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
