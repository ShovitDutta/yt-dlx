// Suggestion: Add JSDoc comments to the function, explaining its purpose, parameters, and return value. The return type is a string, but the function returns a number formatted as a string. It should return a number.
export default function calculateETA(startTime: Date, percent: number): string {
    var currentTime = new Date();
    var elapsedTime = (currentTime.getTime() - startTime.getTime()) / 1000;
    var remainingTime = (elapsedTime / percent) * (100 - percent);
    return remainingTime.toFixed(2);
}
