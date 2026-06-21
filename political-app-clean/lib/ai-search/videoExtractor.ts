import { isVideoResult } from "./videoDetector";

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
        .map((item) => [item.url, item])
    ).values()
  );
}