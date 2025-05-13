// =============================[ EXAMPLE CODE ]=============================
//
import YouTube from "yt-dlx";
import colors from "colors";
(async () => {
  try {
    await YouTube.info.list_formats({
      verbose: true,
      query: "video-NAME/ID/URL",
    });
  } catch (error: any) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ EXAMPLE CODE ]=============================
