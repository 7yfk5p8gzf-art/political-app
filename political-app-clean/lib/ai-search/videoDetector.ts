export function isVideoResult(item: {
  url?: string | null;
  title?: string | null;
  description?: string | null;
  type?: string | null;
}) {
  const url = (item.url || "").toLowerCase();
  const title = (item.title || "").toLowerCase();
  const description = (item.description || "").toLowerCase();

  return (
    item.type === "video" ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("/video") ||
    title.includes("video") ||
    title.includes("youtube") ||
    title.includes("interview") ||
    title.includes("rede") ||
    title.includes("pressekonferenz") ||
    title.includes("debatte") ||
    description.includes("video") ||
    description.includes("youtube")
  );
}