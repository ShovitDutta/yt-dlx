export default function calculateETA(startTime: Date, percent: number): string {
  var currentTime = new Date();
  var elapsedTime = (currentTime.getTime() - startTime.getTime()) / 1000;
  var remainingTime = (elapsedTime / percent) * (100 - percent);
  return remainingTime.toFixed(2);
}
