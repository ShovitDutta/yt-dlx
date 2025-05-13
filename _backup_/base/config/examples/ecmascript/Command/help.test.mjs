// =============================[ EXAMPLE CODE ]=============================
//
import YouTube from "yt-dlx";
import colors from "colors";
(async () => {
  try {
    const result = await YouTube.default.info.help();
    console.log(result);
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ EXAMPLE CODE ]=============================
