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
  source_date?: string | null;
  created_at?: string | null;
};

export function findBestOldStatement(
  statements: ExistingStatementMatch[],
  topic?: string | null,
  politician?: string | null
) {
  if (!topic || !politician) return null;

  const lowerTopic = topic.toLowerCase();
  const lowerPolitician = politician.toLowerCase();

  const topicKeywords = lowerTopic
    .split(/[\s,.-]+/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 4);

  let bestMatch: ExistingStatementMatch | null = null;
  let bestScore = 0;
    function getStatementTime(item: ExistingStatementMatch) {
    const rawDate = item.source_date || item.created_at;

    if (!rawDate) return null;

    const time = new Date(rawDate).getTime();

    return Number.isNaN(time) ? null : time;
  }

  for (const item of statements) {
    const itemPolitician = (item.politician || "").toLowerCase();

    if (itemPolitician !== lowerPolitician) {
      continue;
    }

    const title = (item.title || "").toLowerCase();
    const summary = (item.summary || "").toLowerCase();
    const itemTopic = (item.topic || "").toLowerCase();

    const text = `${title} ${summary} ${itemTopic}`;

    let score = 0;

    const matchedKeywords = topicKeywords.filter((keyword) =>
      text.includes(keyword)
    );

    if (itemTopic === lowerTopic) {
      score += 80;
    }

    if (itemTopic.includes(lowerTopic)) {
      score += 50;
    }

    if (title.includes(lowerTopic)) {
      score += 45;
    }

    if (summary.includes(lowerTopic)) {
      score += 30;
    }

    score += matchedKeywords.length * 30;

    if (item.url) {
      score += 5;
    }
        const statementTime = getStatementTime(item);

    if (statementTime) {
      const ageInDays =
        (Date.now() - statementTime) / (1000 * 60 * 60 * 24);

      if (ageInDays > 30) score += 10;
      if (ageInDays > 180) score += 15;
      if (ageInDays > 365) score += 20;
    }

    const weakGenericMatch =
      matchedKeywords.length === 0 &&
      !itemTopic.includes(lowerTopic) &&
      !title.includes(lowerTopic) &&
      !summary.includes(lowerTopic);

    if (weakGenericMatch) {
      score -= 80;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch && bestScore >= 90
    ? {
        match: bestMatch,
        score: bestScore,
      }
    : null;
}