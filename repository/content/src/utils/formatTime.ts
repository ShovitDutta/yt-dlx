/**
 * Formats a duration in seconds into a human-readable string (HHh MMm SSs) using async function syntax.
 * Although this function's internal operations are purely synchronous, it is marked as async
 * to ensure consistency within a codebase being refactored to use async/await throughout.
 * It resolves immediately with the formatted string.
 *
 * @param seconds The duration in seconds.
 * @returns A Promise resolving with the formatted time string (e.g., "01h 05m 10s"), or "00h 00m 00s" for invalid input.
 */
export default async function formatTime(seconds: number): Promise<string> {
    // Check for invalid or non-finite input numbers
    if (!isFinite(seconds) || isNaN(seconds)) {
        return "00h 00m 00s";
    }

    // Ensure seconds is a non-negative integer for calculations
    const totalSeconds = Math.floor(Math.max(0, seconds));

    // Synchronously calculate hours, minutes, and remaining seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    // Synchronously format the time components into a string
    const formattedString = `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;

    // Although an async function, it performs no awaits and returns the result immediately.
    return formattedString;
}
