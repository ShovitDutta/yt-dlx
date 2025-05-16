import colors from "colors";
import formatTime from "./formatTime"; // Assuming formatTime is an async function returning Promise<string>
import calculateETA from "./calculateETA"; // Assuming calculateETA is an async function returning Promise<string>

/**
 * Displays a progress bar in the console based on the given percentage and calculates ETA.
 * This function performs calculations and console output synchronously but is defined as async
 * because it calls and awaits other asynchronous functions like `calculateETA` and `formatTime`.
 * It resolves after writing the progress update to stdout.
 *
 * @param options - The progress bar options.
 * @param options.percent - The current progress percentage (0-100).
 * // The 'timemark' parameter from the original code was not used in the function body
 * // and has been removed from the function signature.
 * @param options.baseTime - The start timestamp (e.g., `process.hrtime()`) used for ETA calculation.
 * @returns A Promise that resolves when the progress bar update is written to stdout.
 */
var progbar = async ({ percent, baseTime }: { percent: number; baseTime: any }): Promise<void> => {
    // Ensure percent is a number and within bounds
    if (isNaN(percent)) percent = 0;
    percent = Math.min(Math.max(percent, 0), 100);

    // Determine color based on percentage
    var color = percent < 25 ? colors.red : percent < 50 ? colors.yellow : colors.green;

    // Calculate width based on terminal size (synchronous)
    var width = Math.floor(process.stdout.columns / 4);
    var scomp = Math.round((width * percent) / 100);

    // Build the progress bar string (synchronous)
    var progb = color("━").repeat(scomp) + color(" ").repeat(width - scomp);

    // Await the result of the async calculateETA function
    const etaTimemarkPromise: Promise<string> = calculateETA(baseTime, percent);
    const etaTimemarkString: string = await etaTimemarkPromise;

    // Parse the string result from calculateETA to a number for formatTime
    const etaSeconds = parseFloat(etaTimemarkString);

    // Await the result of the async formatTime function, passing the number
    const formattedETAPromise: Promise<string> = formatTime(etaSeconds);
    const formattedETA: string = await formattedETAPromise;

    // Synchronous console output
    process.stdout.write(`\r${color("@prog:")} ${progb} ${color("| @percent:")} ${percent.toFixed(2)}% ${color("| @timemark:")} ${etaTimemarkString} ${color("| @eta:")} ${formattedETA}`);

    // The async function completes after the stdout write operation.
};

export default progbar;
