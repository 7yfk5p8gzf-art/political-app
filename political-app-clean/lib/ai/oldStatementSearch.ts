export type OldStatementSearchInput = {
  politician?: string | null;
  topic?: string | null;
  semanticTopicCluster?: string | null;
};

export type OldStatementSearchResult = {
  oldStatementQueries: string[];
  oldStatementHint: string;
};

export function buildOldStatementSearch(
  input: OldStatementSearchInput
): OldStatementSearchResult {
  const politician = input.politician || "";
  const topic = input.topic || input.semanticTopicCluster || "this topic";

  const oldStatementQueries = [
    `${politician} ${topic} older statement`,
    `${politician} ${topic} previous position`,
    `${politician} ${topic} before`,
    `${politician} ${topic} past opinion`,
  ].filter((query) => query.trim().length > 0);

  return {
    oldStatementQueries,
    oldStatementHint: `Search previous statements about ${topic}`,
  };
  }
  export type ExistingStatementMatch = {
  title?: string | null;
  summary?: string | null;
  url?: string | null;
  politician?: string | null;
  topic?: string | null;
};

export function findBestOldStatement(
  statements: ExistingStatementMatch[],
  topic?: string | null
) {
  if (!topic) return null;

  const lowerTopic = topic.toLowerCase();

  return (
    statements.find((item) => {
      const text = `
${item.title || ""}
${item.summary || ""}
${item.topic || ""}
`.toLowerCase();

      return text.includes(lowerTopic);
    }) || null
  );
}
