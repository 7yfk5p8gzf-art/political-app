export function isVideoResult(item: {
  url?: string | null;
  title?: string | null;
  description?: string | null;
  type?: string | null;
}) {
  const url = (item.url || "").toLowerCase();
  const title = (item.title || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
const isBadRootUrl =
  url === "https://www.euronews.com/" ||
  url === "https://euronews.com/" ||
  url.endsWith("euronews.com/");

if (isBadRootUrl) return false;
  return (
  item.type === "video" &&
  (
    url.includes("youtube.com/watch") ||
    url.includes("youtu.be/")
  ) &&
  !url.includes("/shorts/")
);
}