export function diversifyResults<T extends { url?: string | null }>(
  results: T[]
) {
  const seenDomains = new Set<string>();

  return results.filter((item) => {
    try {
      const domain = new URL(item.url || "")
        .hostname.replace("www.", "");

      if (seenDomains.has(domain)) {
        return false;
      }

      seenDomains.add(domain);

      return true;
    } catch {
      return false;
    }
  });
}