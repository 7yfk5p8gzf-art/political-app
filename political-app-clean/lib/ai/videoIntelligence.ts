export type VideoIntelligenceInput = {
  url?: string | null;
  summary?: string | null;
  analysisText: string;
};

export type VideoIntelligenceResult = {
  hasVideo: boolean;
  transcriptReady: boolean;
  detectedLanguage: string;
  detectedQuote: string | null;
  detectedTimestamp: string | null;
};

export function analyzeVideoIntelligence(
  input: VideoIntelligenceInput
): VideoIntelligenceResult {
  const hasVideo =
    Boolean(input.url?.includes("youtube")) ||
    Boolean(input.url?.includes("youtu.be"));

  const detectedLanguage =
    input.analysisText.includes(" der ") ||
    input.analysisText.includes(" die ") ||
    input.analysisText.includes(" und ")
      ? "de"
      : "en";

  return {
    hasVideo,
    transcriptReady: false,
    detectedLanguage,
    detectedQuote: input.summary?.split(".")[0] || null,
    detectedTimestamp: hasVideo ? "00:00" : null,
  };
}