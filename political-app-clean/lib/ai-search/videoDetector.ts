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
        ||
    url.includes("rainews.it/video") ||
    url.includes("rai.it") ||
    url.includes("la7.it") ||
    url.includes("tgcom24.mediaset.it") ||
    url.includes("mediaset.it/video") ||
    url.includes("ilgiornale.it/video") ||
    url.includes("bfmtv.com") && url.includes("video") ||
    url.includes("france24.com") && url.includes("video") ||
    url.includes("franceinfo.fr") && url.includes("video") ||
    url.includes("zdf.de") && url.includes("video") ||
    url.includes("ardmediathek.de") ||
    url.includes("phoenix.de") && url.includes("video")
  );
}