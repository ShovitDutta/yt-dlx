// =============================[ EXAMPLE CODE ]=============================
//
import YouTube from "yt-dlx";
import colors from "colors";
(async () => {
  try {
    const result = await YouTube.default.ytSearch.Playlist.Single({
      query: "https://youtube.com/playlist?list=PL06diOotXAJLAAHBY7kIUm5GQwm2ZinOz&si=raalOwdBLBtmJ9s5",
    });
    console.log(result);
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ EXAMPLE CODE ]=============================
