import { NextResponse } from "next/server";

type BraveResult = {
  title?: string;
  url?: string;
  description?: string;
};

type Lang = "hu" | "de" | "en" | "fr";

function cleanText(text: string) {
  return String(text || "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/<[^>]*>/g, "")
    .trim();
}

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
            content: `
Te politikai forrásokat elemzel. Rövid, semleges, magyar nyelvű összefoglalót írsz.
Minden admin felületen megjelenő szöveg magyar legyen.
A title mezőt is fordítsd magyarra.
A topic mezőt is magyarul add vissza.
Politikus neveket ne fordíts.
URL-eket ne módosíts.
Törekedj több nézőpontból származó források elemzésére.

Részesítsd előnyben:
- helyi nyelvű forrásokat
- videós interjúkat
- teljes beszélgetéseket
- nemzetközi sajtót
- fact-check jellegű oldalakat
- eltérő politikai nézőpontokat

Ne csak egyetlen politikai oldal narratíváját kövesd.

A cél:
bizonyíték alapú, kiegyensúlyozott elemzés.
`,
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

    return cleanText(text);
  } catch {
    return snippet || "AI összefoglaló nem sikerült.";
  }
}

async function translateSummary(text: string, language: Lang) {
  if (!process.env.OPENAI_API_KEY) {
    return text;
  }

  try {
    const languageNames: Record<Lang, string> = {
      hu: "Hungarian",
      de: "German",
      en: "English",
      fr: "French",
    };

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
            content: `Translate this political summary to ${languageNames[language]}. Keep it neutral, concise and factual. Do not add new information.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    const data = await res.json();

    const translated =
      data.output_text || data.output?.[0]?.content?.[0]?.text || text;

    return cleanText(translated);
  } catch {
    return text;
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

    const text = data.output_text || data.output?.[0]?.content?.[0]?.text || "";

    if (text.includes(":") && !text.includes("NO_TIMESTAMP")) {
      return text.trim();
    }

    return null;
  } catch {
    return null;
  }
}

function extractYouTubeVideoId(url: string) {
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

async function buildResult({
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

  const [summary_hu, summary_de, summary_en, summary_fr, timestamp] =
    await Promise.all([
      translateSummary(baseSummary, "hu"),
      translateSummary(baseSummary, "de"),
      translateSummary(baseSummary, "en"),
      translateSummary(baseSummary, "fr"),
      type === "video"
        ? generateVideoTimestamp({
            title,
            snippet,
          })
        : Promise.resolve(null),
    ]);

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
    const rawResults: BraveResult[] = json.web?.results || [];

    const videoResults = rawResults.filter(
      (item) =>
        item.url?.includes("youtube.com") || item.url?.includes("youtu.be")
    );

    const articleResults = rawResults.filter(
      (item) =>
        !item.url?.includes("youtube.com") && !item.url?.includes("youtu.be")
    );

    const articles = await Promise.all(
      articleResults.map((item) =>
        buildResult({
          item,
          query,
          type: "article",
        })
      )
    );

    const videos = await Promise.all(
      videoResults.map((item) =>
        buildResult({
          item,
          query,
          type: "video",
        })
      )
    );
    const combinedResults = [...videos, ...articles].map((item) => {
  const hasPolitician = Boolean(item.politician);
  const hasTopic = Boolean(item.topic);
  const hasSummary = Boolean(item.summary && item.summary.length > 80);
  const hasStrongTitle = Boolean(item.title && item.title.length > 30);

  const contradictionProbability =
    (hasPolitician ? 25 : 0) +
    (hasTopic ? 25 : 0) +
    (hasSummary ? 25 : 0) +
    (hasStrongTitle ? 25 : 0);
    
    const contradictionReasons = [];
    const analysisText = `
${item.title || ""}
${item.summary || ""}
${item.url || ""}
`.toLowerCase();

const supportWords = [
  "support",
  "approve",
  "back",
  "defend",
  "promote",
  "allow",
  "encourage",
];

const opposeWords = [
  "oppose",
  "ban",
  "block",
  "criticize",
  "reject",
  "stop",
  "fight",
];

const supportMatches = supportWords.filter((word) =>
  analysisText.includes(word)
);

const opposeMatches = opposeWords.filter((word) =>
  analysisText.includes(word)
);

let stanceDirection = "neutral";

if (supportMatches.length > opposeMatches.length) {
  stanceDirection = "support";
}

if (opposeMatches.length > supportMatches.length) {
  stanceDirection = "oppose";
}

if (hasPolitician) {
  contradictionReasons.push("Known politician detected");
}

if (hasTopic) {
  contradictionReasons.push("Topic identified");
}

if (hasSummary) {
  contradictionReasons.push("Detailed summary available");
}

if (hasStrongTitle) {
  contradictionReasons.push("Strong statement title");
}

  return {
    ...item,

    contradictionProbability,
    contradictionReasons,
    stanceDirection,
supportMatches,
opposeMatches,
stanceConfidence:
  Math.max(supportMatches.length, opposeMatches.length) * 25,
  hasVideo: item.url?.includes("youtube") || item.url?.includes("youtu.be"),

transcriptReady: false,

detectedLanguage:
  analysisText.includes(" der ") ||
  analysisText.includes(" die ") ||
  analysisText.includes(" und ")
    ? "de"
    : "en",

detectedQuote:
  item.summary?.split(".")[0] || null,

detectedTimestamp:
  item.url?.includes("youtube")
    ? "00:00"
    : null,

    possibleContradictionSearch:
      `${item.politician || ""} ${item.topic || ""} older statement`,

    possibleContradictionHint:
      `Search older statements about ${item.topic || "this topic"}`,
  };
});

    return NextResponse.json({
  results: combinedResults,
});
  } catch (error) {
    console.error("AI search failed:", error);

    return NextResponse.json(
      { results: [], error: "AI search failed" },
      { status: 500 }
    );
  }
}