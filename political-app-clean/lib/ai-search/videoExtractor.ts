export function extractVideoResults<T extends {
  url?: string | null;
}>(
  results: T[]
) {
  return Array.from(
    new Map(
      results
        .filter(
          (item) =>
            item.url?.includes("youtube.com") ||
            item.url?.includes("youtu.be")
        )
        .map((item) => [item.url, item])
    ).values()
  );
}