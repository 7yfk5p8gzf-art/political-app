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
    candidateStrength += 25;
  }

  if (hasTopicCluster) {
    candidateStrength += 25;
  }

  if (hasOldStatementQueries) {
    candidateStrength += 25;
  }

  if (probability >= 75) {
    candidateStrength += 25;
  }

  const isCandidate = candidateStrength >= 50;

  return {
    isCandidate,
    candidateStrength,
    candidateReason: isCandidate
      ? "Possible semantic contradiction candidate"
      : "Not enough contradiction signals",
  };
}