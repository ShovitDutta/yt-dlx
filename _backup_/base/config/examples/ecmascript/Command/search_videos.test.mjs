// =============================[ EXAMPLE CODE ]=============================
//
import YouTube from "yt-dlx";
import colors from "colors";
(async () => {
  try {
    const result = await YouTube.default.ytSearch.Video.Multiple({
      query: "8k dolby nature",
    });
    console.log(result);
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ EXAMPLE CODE ]=============================
