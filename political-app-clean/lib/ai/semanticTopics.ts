export function getSemanticTopicCluster(topic?: string | null) {
  if (!topic) return null;

  return topic
    .toLowerCase()
    .replace(/migration|immigration|migrants/g, "migration")
    .replace(/war|ukraine|russia/g, "geopolitics")
    .replace(/economy|inflation|tax/g, "economy");
}