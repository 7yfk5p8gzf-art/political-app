export type ContradictionScoringInput = {
  politician?: string | null;
  topic?: string | null;
  title?: string | null;
  summary?: string | null;
};

export type ContradictionScoringResult = {
  contradictionProbability: number;
  contradictionReasons: string[];
};

export function scoreContradiction(
  input: ContradictionScoringInput
): ContradictionScoringResult {
  const hasPolitician = Boolean(input.politician);

  const hasTopic = Boolean(input.topic);

  const hasSummary = Boolean(
    input.summary && input.summary.length > 80
  );

  const hasStrongTitle = Boolean(
    input.title && input.title.length > 30
  );

  const contradictionProbability =
    (hasPolitician ? 25 : 0) +
    (hasTopic ? 25 : 0) +
    (hasSummary ? 25 : 0) +
    (hasStrongTitle ? 25 : 0);

  const contradictionReasons: string[] = [];

  if (hasPolitician) {
    contradictionReasons.push("Known politician detected");
  }

  if (hasTopic) {
    contradictionReasons.push("Topic identified");
  }

  if (hasSummary) {
    contradictionReasons.push("Detailed summary available");
  }

  if (hasStrongTitle) {
    contradictionReasons.push("Strong statement title");
  }

  return {
    contradictionProbability,
    contradictionReasons,
  };
}