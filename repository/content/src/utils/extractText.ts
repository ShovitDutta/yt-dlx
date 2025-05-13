export default function extractText(textObj: any): { runs?: any[]; text: string } {
  return {
    runs: textObj?.runs || undefined,
    text: textObj?.text || textObj?.runs?.[0]?.text || "",
  };
}
