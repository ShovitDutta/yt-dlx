// Suggestion: Add JSDoc comments to the function, explaining its purpose, parameters, and return value. Also, consider making the progress bar more configurable, allowing users to customize the colors, width, and symbols used. The `baseTime` parameter is not used, so it should be removed.
import colors from "colors";
import formatTime from "./formatTime";
import calculateETA from "./calculateETA";
var progbar = ({ percent, timemark, baseTime }) => {
    if (isNaN(percent)) percent = 0;
    percent = Math.min(Math.max(percent, 0), 100);
    var color = percent < 25 ? colors.red : percent < 50 ? colors.yellow : colors.green;
    var width = Math.floor(process.stdout.columns / 4);
    var scomp = Math.round((width * percent) / 100);
    var progb = color("━").repeat(scomp) + color(" ").repeat(width - scomp);
    var timemark: any = calculateETA(baseTime, percent);
    process.stdout.write(`\r${color("@prog:")} ${progb} ${color("| @percent:")} ${percent.toFixed(2)}% ${color("| @timemark:")} ${timemark} ${color("| @eta:")} ${formatTime(timemark)}`);
};
export default progbar;
