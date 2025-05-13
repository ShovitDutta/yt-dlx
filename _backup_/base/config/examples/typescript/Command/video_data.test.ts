// =============================[ EXAMPLE CODE ]=============================
//
import YouTube from "yt-dlx";
import colors from "colors";
(async () => {
  try {
    const result = await YouTube.ytSearch.Video.Single({
      query: "video-NAME/ID/URL",
    });
    console.log(result);
  } catch (error: any) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ EXAMPLE CODE ]=============================
