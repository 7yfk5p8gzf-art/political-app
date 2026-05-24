export type ContradictionRankingInput = {
  contradictionProbability?: number;
  candidateStrength?: number;
  oldStatementScore?: number;
  timelineStrength?: number;
  dateConfidence?: number;
  evolutionStrength?: number;
};

export type ContradictionRankingResult = {
  overallRankScore: number;
  rankLabel:
    | "low"
    | "medium"
    | "high"
    | "critical";
  rankReason: string;
};

export function rankContradiction(
  input: ContradictionRankingInput
): ContradictionRankingResult {
  const score =
    (input.contradictionProbability || 0) * 0.25 +
    (input.candidateStrength || 0) * 0.25 +
    (input.oldStatementScore || 0) * 0.2 +
    (input.timelineStrength || 0) * 0.1 +
    (input.dateConfidence || 0) * 0.1 +
    (input.evolutionStrength || 0) * 0.1;

  const overallRankScore = Math.round(score);

  if (overallRankScore >= 85) {
    return {
      overallRankScore,
      rankLabel: "critical",
      rankReason: "Very strong contradiction candidate",
    };
  }

  if (overallRankScore >= 65) {
    return {
      overallRankScore,
      rankLabel: "high",
      rankReason: "Strong contradiction candidate",
    };
  }

  if (overallRankScore >= 40) {
    return {
      overallRankScore,
      rankLabel: "medium",
      rankReason: "Moderate contradiction signals detected",
    };
  }

  return {
    overallRankScore,
    rankLabel: "low",
    rankReason: "Weak contradiction signals",
  };
}