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
  const contradictionReasons: string[] = [];

  let contradictionProbability = 0;

  if (input.politician) {
    contradictionProbability += 15;
    contradictionReasons.push("Known politician detected");
  }

  if (input.topic) {
    contradictionProbability += 15;
    contradictionReasons.push("Topic identified");
  }

  if (input.summary && input.summary.length > 80) {
    contradictionProbability += 10;
    contradictionReasons.push("Detailed summary available");
  }

  if (input.title && input.title.length > 30) {
    contradictionProbability += 10;
    contradictionReasons.push("Strong statement title");
  }

  const text = `
${input.title || ""}
${input.summary || ""}
`.toLowerCase();

  const contradictionWords = [
    "changed",
    "reversed",
    "contradiction",
    "u-turn",
    "previously",
    "earlier",
    "before",
    "now",
    "instead",
    "but now",
  ];

  const matches = contradictionWords.filter((word) =>
    text.includes(word)
  );

  contradictionProbability += matches.length * 10;

  if (matches.length > 0) {
    contradictionReasons.push(
      "Potential contradiction language detected"
    );
  }

  contradictionProbability = Math.min(
    contradictionProbability,
    100
  );

  return {
    contradictionProbability,
    contradictionReasons,
  };
}