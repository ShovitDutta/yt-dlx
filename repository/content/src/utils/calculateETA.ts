/**
 * Calculates the estimated time remaining (ETA) for a process based on the start time and current completion percentage using async function syntax.
 * The calculation involves synchronous date and arithmetic operations.
 * Although this function performs purely synchronous operations, it is defined as an async function
 * to maintain consistency with a codebase being refactored to predominantly use async/await.
 * The function resolves immediately with the calculated ETA as a string.
 *
 * @param startTime The Date object representing the start time of the process.
 * @param percent The current completion percentage (0-100). Must be greater than 0 for a valid calculation.
 * @returns A Promise resolving with the estimated time remaining in seconds as a string with 2 decimal places. Returns a string representation of Infinity, -Infinity, or NaN if the calculation results in one of those (e.g., percent is 0).
 */
export default async function calculateETA(startTime: Date, percent: number): Promise<string> {
    // Get the current time synchronously
    const currentTime = new Date();

    // Calculate elapsed time in seconds synchronously
    const elapsedTime = (currentTime.getTime() - startTime.getTime()) / 1000;

    let remainingTime: number;

    // Synchronously calculate remaining time.
    // Ensure percentage is valid and positive to avoid division issues.
    if (percent > 0 && percent <= 100 && isFinite(elapsedTime)) {
        remainingTime = (elapsedTime / percent) * (100 - percent);
    } else {
        // If percentage is invalid or 0, ETA cannot be calculated meaningfully.
        // Assign Infinity, which toFixed() will handle.
        remainingTime = Infinity;
    }

    // Format the result to 2 decimal places synchronously
    const formattedETA = remainingTime.toFixed(2);

    // Although an async function, it performs no awaits and returns the result immediately.
    return formattedETA;
}
