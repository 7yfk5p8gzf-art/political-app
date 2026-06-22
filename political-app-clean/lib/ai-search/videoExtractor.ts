import { isVideoResult } from "./videoDetector";

function isBadVideoCandidate(item: {
  url?: string | null;
  title?: string | null;
  description?: string | null;
}) {
  const text = `${item.title || ""} ${item.description || ""} ${item.url || ""}`
    .toLowerCase();

  const badWords = [
    "subscribe",
    "subscription",
    "premium",
    "paid",
    "paywall",
    "members only",
    "sign in",
    "login",
    "private video",
    "video unavailable",
    "not available",
    "removed",
    "deleted",
    "shorts",
  ];

  return badWords.some((word) => text.includes(word));
}

export function extractVideoResults<T extends {
  url?: string | null;
  title?: string | null;
  description?: string | null;
  type?: string | null;
}>(
  results: T[]
) {
  return Array.from(
    new Map(
      results
        .filter((item) => isVideoResult(item))
        .filter((item) => !isBadVideoCandidate(item))
        .map((item) => [item.url, item])
    ).values()
  );
}