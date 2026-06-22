export type ContradictionCandidateInput = {
  semanticIntent?: string;
  semanticTopicCluster?: string | null;
  oldStatementQueries?: string[];
  contradictionProbability?: number;
};

export type ContradictionCandidateResult = {
  isCandidate: boolean;
  candidateStrength: number;
  candidateReason: string;
};

export function buildContradictionCandidate(
  input: ContradictionCandidateInput
): ContradictionCandidateResult {
  const hasIntent =
    input.semanticIntent &&
    input.semanticIntent !== "neutral";

  const hasTopicCluster = Boolean(
    input.semanticTopicCluster
  );

  const hasOldStatementQueries =
    Boolean(input.oldStatementQueries?.length);

  const probability =
    input.contradictionProbability || 0;

  let candidateStrength = 0;

  if (hasIntent) {
    candidateStrength += 20;
  }

  if (hasTopicCluster) {
    candidateStrength += 15;
  }

  if (hasOldStatementQueries) {
    candidateStrength += 10;
  }

  if (probability >= 90) {
    candidateStrength += 25;
  } else if (probability >= 75) {
    candidateStrength += 15;
  } else if (probability >= 50) {
    candidateStrength += 8;
  }

  candidateStrength = Math.min(candidateStrength, 85);

  const isCandidate =
    candidateStrength >= 45 && probability >= 50;

  return {
    isCandidate,
    candidateStrength,
    candidateReason: isCandidate
      ? "Possible contradiction candidate, requires AI review"
      : "Weak contradiction signals",
  };
}