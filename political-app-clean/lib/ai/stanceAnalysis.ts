export type StanceAnalysisInput = {
  title?: string | null;
  summary?: string | null;
  url?: string | null;
};

export type StanceAnalysisResult = {
  stanceDirection: "support" | "oppose" | "neutral";
  supportMatches: string[];
  opposeMatches: string[];
  stanceConfidence: number;
  analysisText: string;
};

export function analyzeStance(input: StanceAnalysisInput): StanceAnalysisResult {
  const analysisText = `
${input.title || ""}
${input.summary || ""}
${input.url || ""}
`.toLowerCase();

  const supportWords = [
    "support",
    "approve",
    "back",
    "defend",
    "promote",
    "allow",
    "encourage",
  ];

  const opposeWords = [
    "oppose",
    "ban",
    "block",
    "criticize",
    "reject",
    "stop",
    "fight",
  ];

  const supportMatches = supportWords.filter((word) =>
    analysisText.includes(word)
  );

  const opposeMatches = opposeWords.filter((word) =>
    analysisText.includes(word)
  );

  let stanceDirection: "support" | "oppose" | "neutral" = "neutral";

  if (supportMatches.length > opposeMatches.length) {
    stanceDirection = "support";
  }

  if (opposeMatches.length > supportMatches.length) {
    stanceDirection = "oppose";
  }

  const stanceConfidence =
    Math.max(supportMatches.length, opposeMatches.length) * 25;

  return {
    stanceDirection,
    supportMatches,
    opposeMatches,
    stanceConfidence,
    analysisText,
  };
}