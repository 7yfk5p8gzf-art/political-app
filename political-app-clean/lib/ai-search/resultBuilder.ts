type BraveResult = {
  title?: string;
  url?: string;
  description?: string;
};

async function generateAiSummary({
  query,
  title,
  url,
  snippet,
}: {
  query: string;
  title: string;
  url: string;
  snippet: string;
}) {
  return snippet || title || url || query;
}

async function generateVideoTimestamp({
  title,
  snippet,
}: {
  title: string;
  snippet: string;
}) {
  return null;
}

function extractYouTubeVideoId(url: string) {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
  return match?.[1] || null;
}
export async function buildResult({
  item,
  query,
  type,
}: {
  item: BraveResult;
  query: string;
  type: "article" | "video";
}) {
  const title = item.title || (type === "video" ? "Untitled video" : "Untitled result");
  const url = item.url || "#";
  const snippet = item.description || "No summary available.";

  const baseSummary = await generateAiSummary({
    query,
    title,
    url,
    snippet,
  });

  const timestamp =
  type === "video"
    ? await generateVideoTimestamp({
        title,
        snippet,
      })
    : null;

const summary_hu = baseSummary;
const summary_de = "";
const summary_en = "";
const summary_fr = "";

  return {
    type,
    title,
    url,
    videoId: extractYouTubeVideoId(url),

    summary: baseSummary,
    summary_hu,
    summary_de,
    summary_en,
    summary_fr,

    politician: query.split(" ")[0] || "",
    topic: query.split(" ").slice(1).join(" ") || "",

    timestamp,
  };
}