import { NextResponse } from "next/server";
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
  if (!process.env.OPENAI_API_KEY) {
    return snippet || "Nincs AI összefoglaló.";
  }
  async function generateVideoTimestamp({
  title,
  snippet,
}: {
  title: string;
  snippet: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.3-chat-latest",
        input: [
          {
            role: "system",
            content:
              "Keress videó timestamp utalásokat. Csak timestampet adj vissza HH:MM:SS vagy MM:SS formátumban. Ha nincs, akkor NO_TIMESTAMP.",
          },
          {
            role: "user",
            content: `
Video title:
${title}

Video snippet:
${snippet}
`,
          },
        ],
      }),
    });

    const data = await res.json();

    const text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "";

    if (
      text.includes(":") &&
      !text.includes("NO_TIMESTAMP")
    ) {
      return text.trim();
    }

    return null;
  } catch {
    return null;
  }
}

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.3-chat-latest",
        input: [
          {
            role: "system",
            content:
              "Te politikai forrásokat elemzel. Rövid, semleges, magyar nyelvű összefoglalót írsz. Ne találj ki semmit, csak a kapott cím, link és snippet alapján dolgozz.",
          },
          {
            role: "user",
            content: `
Keresés: ${query}

Forrás címe:
${title}

URL:
${url}

Snippet / részlet:
${snippet}

Írj 2-3 mondatos, admin preview kártyára való összefoglalót.
`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return snippet || "AI összefoglaló nem sikerült.";
    }

    const data = await res.json();

    const text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      snippet ||
      "Nincs AI összefoglaló.";

    return String(text)
  .replace(/&#x27;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, "&")
  .replace(/<[^>]*>/g, "")
  .trim();
  } catch {
    return snippet || "AI összefoglaló nem sikerült.";
  }
}
async function generateVideoTimestamp({
  title,
  snippet,
}: {
  title: string;
  snippet: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.3-chat-latest",
        input: [
          {
            role: "system",
            content:
              "Keress videó timestamp utalásokat. Csak timestampet adj vissza HH:MM:SS vagy MM:SS formátumban. Ha nincs, akkor NO_TIMESTAMP.",
          },
          {
            role: "user",
            content: `
Video title:
${title}

Video snippet:
${snippet}
`,
          },
        ],
      }),
    });

    const data = await res.json();

    const text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "";

    if (text.includes(":") && !text.includes("NO_TIMESTAMP")) {
      return text.trim();
    }

    return null;
  } catch {
    return null;
  }
}function extractYouTubeVideoId(url: string) {
  if (!url) return null;

  if (url.includes("youtube.com/watch?v=")) {
    return url.split("v=")[1]?.split("&")[0] || null;
  }

  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1]?.split("?")[0] || null;
  }

  if (url.includes("youtube.com/shorts/")) {
    return url.split("youtube.com/shorts/")[1]?.split("?")[0] || null;
  }

  return null;
}

type BraveResult = {
  title?: string;
  url?: string;
  description?: string;
};

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const apiKey = process.env.BRAVE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          results: [],
          error: "Missing BRAVE_API_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(
        query
      )}&count=5`,
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": apiKey,
        },
      }
    );

    const json = await response.json();

    const rawResults = json.web?.results || [];
    const videoResults = rawResults.filter((item: BraveResult) =>
  item.url?.includes("youtube.com") ||
  item.url?.includes("youtu.be")
);

const articleResults = rawResults.filter(
  (item: BraveResult) =>
    !item.url?.includes("youtube.com") &&
    !item.url?.includes("youtu.be")
);

const articles = await Promise.all(
  articleResults.map(async (item: BraveResult) => ({
    type: "article",

    title: item.title || "Untitled result",

    url: item.url || "#",
    videoId: extractYouTubeVideoId(item.url || ""),

    summary: await generateAiSummary({
      query,
      title: item.title || "",
      url: item.url || "",
      snippet: item.description || "No summary available.",
    }),

    politician: query.split(" ")[0] || "",

    topic: query.split(" ").slice(1).join(" ") || "",
  }))
);

const videos = await Promise.all(
  videoResults.map(async (item: BraveResult) => ({
    type: "video",

    title: item.title || "Untitled video",

    url: item.url || "#",

    summary: await generateAiSummary({
      query,
      title: item.title || "",
      url: item.url || "",
      snippet: item.description || "No summary available.",
    }),

    politician: query.split(" ")[0] || "",

    topic: query.split(" ").slice(1).join(" ") || "",
    timestamp: await generateVideoTimestamp({
  title: item.title || "",
  snippet: item.description || "",
}),

  }))
);

const results = [...videos, ...articles];
  
    

    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { results: [], error: "AI search failed" },
      { status: 500 }
    );
  }
}