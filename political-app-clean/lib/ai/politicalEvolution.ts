export type PoliticalEvolutionInput = {
  semanticIntent?: string;
  timelineCategory?: string;
  stanceConfidence?: number;
};

export type PoliticalEvolutionResult = {
  evolutionType:
    | "strategic_shift"
    | "ideological_shift"
    | "crisis_reaction"
    | "rhetoric_escalation"
    | "unclear";
  evolutionStrength: number;
  explanation: string;
};

export function detectPoliticalEvolution(
  input: PoliticalEvolutionInput
): PoliticalEvolutionResult {
  const confidence = input.stanceConfidence || 0;

  if (input.timelineCategory === "long" && confidence >= 50) {
    return {
      evolutionType: "ideological_shift",
      evolutionStrength: 90,
      explanation: "Long-term stance movement detected",
    };
  }

  if (input.timelineCategory === "medium" && confidence >= 50) {
    return {
      evolutionType: "strategic_shift",
      evolutionStrength: 70,
      explanation: "Medium-term strategic repositioning detected",
    };
  }

  if (input.timelineCategory === "recent" && confidence >= 50) {
    return {
      evolutionType: "crisis_reaction",
      evolutionStrength: 60,
      explanation: "Recent stance movement may be crisis-driven",
    };
  }

  if (input.semanticIntent && input.semanticIntent !== "neutral") {
    return {
      evolutionType: "rhetoric_escalation",
      evolutionStrength: 50,
      explanation: "Non-neutral political intent detected",
    };
  }

  return {
    evolutionType: "unclear",
    evolutionStrength: 0,
    explanation: "Not enough information to classify political evolution",
  };
}