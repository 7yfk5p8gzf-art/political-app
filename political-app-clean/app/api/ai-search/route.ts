import { NextResponse } from "next/server";
import { analyzeStance } from "@/lib/ai/stanceAnalysis";
import { getSemanticTopicCluster } from "@/lib/ai/semanticTopics";
import { scoreContradiction } from "@/lib/ai/contradictionScoring";
import { analyzeVideoIntelligence } from "@/lib/ai/videoIntelligence";
import {
  buildOldStatementSearch,
  findBestOldStatement,
} from "@/lib/ai/oldStatementSearch";
import { buildContradictionCandidate } from "@/lib/ai/contradictionCandidate";
import { supabase } from "@/lib/supabase";
import { detectPoliticalEvolution } from "@/lib/ai/politicalEvolution";
import { extractDateSignals } from "@/lib/ai/dateExtraction";
import { parsePoliticalQuery } from "@/lib/ai/queryParser";
import {
  rankContradiction,
  type ContradictionRankingResult,
} from "@/lib/ai/contradictionRanking";



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
    const parsedQuery = parsePoliticalQuery(query);
const effectiveQuery = `${parsedQuery.politician || ""} ${parsedQuery.topic}`.trim();

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

    
      const balancedQuery = `
${query}
(
  conservative OR right wing OR government
  OR opposition OR left wing
  OR independent OR neutral
  OR fact check OR analysis
)
`;
let localBias = "";

const q = query.toLowerCase();
let topicTerms = "";

if (
  q.includes("migráció") ||
  q.includes("bevándorlás") ||
  q.includes("migration")
) {
  topicTerms =
    " migráció OR bevándorlás OR migration OR menekült OR menekültek OR határ OR határvédelem OR schengen";
}

if (
  q.includes("orbán") ||
  q.includes("gyurcsány") ||
  q.includes("magyar")
) {
  localBias =
  "site:telex.hu OR site:444.hu OR site:index.hu OR site:mandiner.hu OR site:hvg.hu";
}

if (
  q.includes("merz") ||
  q.includes("scholz") ||
  q.includes("afd") ||
  q.includes("deutschland")
) {
  localBias =
  "site:welt.de OR site:spiegel.de OR site:focus.de OR site:zeit.de";
}

if (
  q.includes("trump") ||
  q.includes("biden") ||
  q.includes("usa")
) {
  if (
  q.includes("trump") ||
  q.includes("biden") ||
  q.includes("usa")
) {
  localBias =
    "site:cnn.com OR site:foxnews.com OR site:nytimes.com OR site:apnews.com";
}
}
let localTerms = "";

if (
  q.includes("orbán") ||
  q.includes("gyurcsány") ||
  q.includes("magyar")
) {
  localTerms =
  "migráció bevándorlás magyar politika orbán viktor fidesz";
}

if (
  q.includes("merz") ||
  q.includes("scholz") ||
  q.includes("afd")
) {
  localTerms = "migration deutschland politik";
}

if (
  q.includes("trump") ||
  q.includes("biden")
) {
  localTerms = "immigration american politics";
}
console.log("AI search parsed query:", {
  query,
  parsedQuery,
  effectiveQuery,
  topicTerms,
  localTerms,
});
const sourceQueries = [
  `${effectiveQuery} ${topicTerms} ${localTerms} site:telex.hu OR site:444.hu OR site:hvg.hu`,
  `${effectiveQuery} ${topicTerms} ${localTerms} site:mandiner.hu OR site:magyarnemzet.hu OR site:origo.hu`,
  `${effectiveQuery} ${topicTerms} ${localTerms} site:portfolio.hu OR site:24.hu`,
  `${effectiveQuery} ${topicTerms} Hungary politics migration Reuters OR BBC OR AP OR Euronews`,
  `${effectiveQuery} ${topicTerms} fact check analysis political context`,
];

const searchResponses = await Promise.all(
  sourceQueries.map((searchQuery) =>
    fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(
        searchQuery
      )}&count=3`,
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": apiKey,
        },
      }
    )
  )
);

const searchJsons = await Promise.all(
  searchResponses.map((response) => response.json())
);

const rawResults: BraveResult[] = searchJsons.flatMap(
  (json) => json.web?.results || []
);
const topicKeywords =
  query.toLowerCase().includes("migráció") ||
  query.toLowerCase().includes("migration") ||
  query.toLowerCase().includes("bevándorlás")
    ? ["migráció", "migration", "bevándorlás", "menekült", "határ", "migrant"]
    : [];

const topicFilteredResults =
  topicKeywords.length > 0
    ? rawResults.filter((item) => {
        const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();

        return topicKeywords.some((word) => text.includes(word));
      })
    : rawResults
    const seenDomains = new Set<string>();

const diversifiedResults = topicFilteredResults.filter((item) => {
  try {
    const domain = new URL(item.url || "").hostname.replace("www.", "");

    if (seenDomains.has(domain)) {
      return false;
    }

    seenDomains.add(domain);

    return true;
  } catch {
    return false;
  }
});
    const { data: existingSources } = await supabase
  .from("sources")
  .select("title, summary, url, politician, topic")
  .limit(50);

    const videoResults = diversifiedResults.filter(
           (item) =>
        item.url?.includes("youtube.com") || item.url?.includes("youtu.be")
    );

    const articleResults = diversifiedResults.filter(
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
  const { contradictionProbability, contradictionReasons } = scoreContradiction({
  politician: item.politician,
  topic: item.topic,
  title: item.title,
  summary: item.summary,
});

  const {
    stanceDirection,
    supportMatches,
    opposeMatches,
    stanceConfidence,
    analysisText,
  } = analyzeStance({
  title: item.title,
  summary: item.summary,
  url: item.url,
});

const dateSignals = extractDateSignals({
  title: item.title,
  summary: item.summary,
  url: item.url,

  });
  const ranking = rankContradiction({
  contradictionProbability,
  candidateStrength: stanceConfidence,
  oldStatementScore: Math.min((supportMatches?.length || 0) * 25, 100),
  timelineStrength: dateSignals.detectedYear ? 70 : 20,
  dateConfidence: dateSignals.dateConfidence || 0,
  evolutionStrength: 50,
});
  const {
  hasVideo,
  transcriptReady,
  detectedLanguage,
  detectedQuote,
  detectedTimestamp,
} = analyzeVideoIntelligence({
  url: item.url,
  summary: item.summary,
  analysisText,
});

  const semanticTopicCluster = getSemanticTopicCluster(item.topic);
  const oldStatementResult = findBestOldStatement(
  existingSources || [],
  item.topic,
  item.politician
);

const bestOldStatement = oldStatementResult?.match || null;

const oldStatementScore = oldStatementResult?.score || 0;

const { oldStatementQueries, oldStatementHint } =
  buildOldStatementSearch({
    politician: item.politician,
    topic: item.topic,
    semanticTopicCluster,
  });

const semanticIntent =
  supportMatches.length > opposeMatches.length
    ? "support"
    : opposeMatches.length > supportMatches.length
    ? "oppose"
    : "neutral";

const contradictionCandidate = buildContradictionCandidate({
  semanticIntent,
  semanticTopicCluster,
  oldStatementQueries,
  contradictionProbability,
});



return {
  ...item,
    ...item,
    contradictionProbability,
    contradictionReasons,
    stanceDirection,
    supportMatches,
    opposeMatches,
    stanceConfidence,

    

    semanticTopicCluster,
oldStatementQueries,
oldStatementHint,
bestOldStatement,
oldStatementScore,

    semanticIntent,
contradictionCandidate,
dateSignals,
overallRankScore: ranking.overallRankScore,
rankLabel: ranking.rankLabel,
rankReason: ranking.rankReason,
sourceDomain: (() => {
  try {
    return new URL(item.url || "").hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
})(),

sourceLanguage: q.includes("orbán") ||
q.includes("gyurcsány") ||
q.includes("magyar")
  ? "hu"
  : q.includes("merz") ||
    q.includes("scholz") ||
    q.includes("afd")
  ? "de"
  : "en",

sourcePerspective:
  item.url?.includes("telex") ||
  item.url?.includes("444") ||
  item.url?.includes("hvg")
    ? "opposition"
    : item.url?.includes("mandiner") ||
      item.url?.includes("magyarnemzet") ||
      item.url?.includes("origo")
    ? "pro-government"
    : item.url?.includes("reuters") ||
      item.url?.includes("apnews")
    ? "international"
    : "neutral",
timelineResult: dateSignals.detectedDate
  ? {
      yearsBetween: null,
      timelineStrength: dateSignals.dateConfidence,
      timelineCategory: "unknown",
      reasoning: `Date signal detected: ${dateSignals.detectedDate}`,
    }
  : {
      yearsBetween: null,
      timelineStrength: 0,
      timelineCategory: "unknown",
      reasoning: "No timeline information available",
    },
politicalEvolution: detectPoliticalEvolution({
  semanticIntent,
  timelineCategory: "unknown",
  stanceConfidence,
}),

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