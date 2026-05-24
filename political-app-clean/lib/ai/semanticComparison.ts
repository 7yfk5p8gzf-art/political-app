export type SemanticComparisonInput = {
  oldStatement?: string | null;
  newStatement?: string | null;
};

export type SemanticComparisonResult = {
  similarityScore: number;
  possibleContradiction: boolean;
  detectedShift: "support_to_oppose" | "oppose_to_support" | "neutral";
};

export function compareSemantics(
  input: SemanticComparisonInput
): SemanticComparisonResult {
  const oldText = (input.oldStatement || "").toLowerCase();

  const newText = (input.newStatement || "").toLowerCase();

  const supportWords = [
    "support",
    "approve",
    "allow",
    "promote",
    "encourage",
  ];

  const opposeWords = [
    "oppose",
    "ban",
    "reject",
    "block",
    "fight",
  ];

  const oldSupport = supportWords.some((word) =>
    oldText.includes(word)
  );

  const oldOppose = opposeWords.some((word) =>
    oldText.includes(word)
  );

  const newSupport = supportWords.some((word) =>
    newText.includes(word)
  );

  const newOppose = opposeWords.some((word) =>
    newText.includes(word)
  );

  let detectedShift: SemanticComparisonResult["detectedShift"] =
    "neutral";

  if (oldSupport && newOppose) {
    detectedShift = "support_to_oppose";
  }

  if (oldOppose && newSupport) {
    detectedShift = "oppose_to_support";
  }

  const possibleContradiction = detectedShift !== "neutral";

  const similarityScore =
    possibleContradiction ? 85 : 40;

  return {
    similarityScore,
    possibleContradiction,
    detectedShift,
  };
}