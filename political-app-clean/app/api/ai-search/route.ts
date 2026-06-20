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
import {
  buildTopicExpansionQueries,
  scoreSearchResultV2,
} from "@/lib/ai/topicExpansionEngine";
import { loadPoliticians } from "@/lib/ai/loadPoliticians";
import { parsePoliticalQueryFromRegistry } from "@/lib/ai/queryParser";

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

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    const politicians = await loadPoliticians();
const parsedQuery = parsePoliticalQueryFromRegistry(query, politicians);
const expandedQueries = buildTopicExpansionQueries({
  topic: parsedQuery.topic || query,
  politician: null,
});

console.log("Expanded queries:", expandedQueries);
const normalizedQuery = query.trim().toLowerCase();
const { data: cachedSearch } = await supabase
  .from("ai_search_cache")
  .select("response")
  .eq("normalized_query", normalizedQuery)
  .maybeSingle();

 if (cachedSearch?.response) {
   console.log("AI search cache hit:", normalizedQuery);

  return NextResponse.json(cachedSearch.response);
 }
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
  parsedQuery.country === "HU"
) {
  localBias =
  "site:telex.hu OR site:444.hu OR site:hvg.hu OR site:mandiner.hu OR site:magyarnemzet.hu OR site:vadhajtasok.hu";
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
  parsedQuery.country === "HU"
)
{
  localTerms =
    "magyar politika közélet választás parlament";
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
const videoQueries = [
  `${effectiveQuery} ${topicTerms} site:youtube.com interview`,
  `${effectiveQuery} ${topicTerms} site:youtube.com interjú`,
  `${effectiveQuery} ${topicTerms} site:youtube.com speech`,
  `${effectiveQuery} ${topicTerms} site:youtube.com beszéd`,
  `${effectiveQuery} ${topicTerms} site:youtube.com debate`,
  `${effectiveQuery} ${topicTerms} site:youtube.com vita`,
  `${effectiveQuery} ${topicTerms} site:youtube.com parlament`,
  `${effectiveQuery} ${topicTerms} site:youtube.com Hír TV`,
  `${effectiveQuery} ${topicTerms} site:youtube.com ATV`,
  `${effectiveQuery} ${topicTerms} site:youtube.com Partizán`,
  `${effectiveQuery} ${topicTerms} site:youtube.com teljes interjú`,
  `${effectiveQuery} ${topicTerms} site:youtube.com Orbán Viktor migráció`,
];

const localQueries =
  parsedQuery.country === "HU"
    ? [
        `${effectiveQuery} ${topicTerms} site:telex.hu`,
        `${effectiveQuery} ${topicTerms} site:hvg.hu`,
        `${effectiveQuery} ${topicTerms} site:444.hu`,
        `${effectiveQuery} ${topicTerms} site:vadhajtasok.hu`,
        `${effectiveQuery} ${topicTerms} site:mandiner.hu`,
        `${effectiveQuery} ${topicTerms} site:magyarnemzet.hu`,
        `${effectiveQuery} ${topicTerms} site:24.hu`,
        `${effectiveQuery} ${topicTerms} site:portfolio.hu`,
      ]
    : [`${effectiveQuery} ${topicTerms}`];

const internationalQueries = [
  `${effectiveQuery} ${topicTerms} site:reuters.com`,
  `${effectiveQuery} ${topicTerms} site:bbc.com`,
  `${effectiveQuery} ${topicTerms} site:apnews.com`,
  `${effectiveQuery} ${topicTerms} site:euronews.com`,
  `${effectiveQuery} ${topicTerms} site:dw.com`,
  `${effectiveQuery} ${topicTerms} site:france24.com`,
  `${effectiveQuery} ${topicTerms} site:politico.com`,
  `${effectiveQuery} ${topicTerms} site:theguardian.com`,
];

const sourceQueries = [
  ...videoQueries,
  ...localQueries,
  ...internationalQueries,
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
console.log("AI Brave raw JSON:", JSON.stringify(searchJsons, null, 2));
const braveErrors = searchJsons.filter(
  (json) => json.error || json.errors || json.type
);

if (braveErrors.length > 0) {
  console.log(
    "AI Brave errors:",
    JSON.stringify(braveErrors, null, 2)
  );
}

const rawResults: BraveResult[] = searchJsons.flatMap((json) => {
  return (
    json.web?.results ||
    json.news?.results ||
    json.videos?.results ||
    []
  );
});
console.log("AI raw results count:", rawResults.length);
console.log(
  "AI raw result titles:",
  rawResults.map((x) => ({
    title: x.title,
    url: x.url,
    description: x.description,
  }))
);
const allowedDomains = [
  "telex.hu",
  "hvg.hu",
  "444.hu",
  "vadhajtasok.hu",
  "mandiner.hu",
  "magyarnemzet.hu",
  "24.hu",
  "portfolio.hu",
  "reuters.com",
  "bbc.com",
  "apnews.com",
  "euronews.com",
  "youtube.com",
  "youtu.be",
];

const allowedRawResults = rawResults.filter((item) => {
  try {
    const domain = new URL(item.url || "").hostname.replace("www.", "");

    return allowedDomains.some(
      (allowed) => domain === allowed || domain.endsWith("." + allowed)
    );
  } catch {
    return false;
  }
});
console.log(
  "ALLOWED RESULTS:",
  allowedRawResults.map((x) => x.url)
);
const topicKeywords =
  query.toLowerCase().includes("migráció") ||
  query.toLowerCase().includes("migration") ||
  query.toLowerCase().includes("bevándorlás")
    ? ["migráció", "migration", "bevándorlás", "menekült", "határ", "migrant"]
    : [];

const topicFilteredResults =
  topicKeywords.length > 0
    ? allowedRawResults.filter((item) => {
        const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();

        return topicKeywords.some((word) => text.includes(word));
      })
    : allowedRawResults
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
console.log("AI diversified results count:", diversifiedResults.length);
    const { data: existingSources } = await supabase
  .from("sources")
  .select("title, summary, url, politician, topic")
  .limit(50);

    const videoResults = Array.from(
  new Map(
    rawResults
      .filter(
        (item) =>
          item.url?.includes("youtube.com") ||
          item.url?.includes("youtu.be")
      )
      .map((item) => [item.url, item])
  ).values()
);

    console.log("AI videoResults count:", videoResults.length);
console.log(
  "AI videoResults:",
  videoResults.map((x) => ({
    title: x.title,
    url: x.url,
  }))
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
    const combinedResults = [...videos, ...articles]
  .map((item) => {
  const { contradictionProbability, contradictionReasons } =
  scoreContradiction({
  
  politician: item.politician,
  topic: item.topic,
  title: item.title,
  summary: item.summary,
});
const relevanceScore = scoreSearchResultV2({
  result: {
    title: item.title,
    description: item.summary,
    url: item.url,
    source: item.url,
  },
  politicianName: item.politician,
  topic: item.topic,
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
    relevanceScore,
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
politician:
  parsedQuery.politician ||
  item.politician ||
  null,

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

const sortedResults = combinedResults.sort(
  (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
);

const videoFinalResults = sortedResults
  .filter((x) => x.type === "video")
  .slice(0, 4);

const localFinalResults = sortedResults
  .filter(
    (x) =>
      x.type !== "video" &&
      (
        x.url.includes("telex.hu") ||
        x.url.includes("hvg.hu") ||
        x.url.includes("444.hu") ||
        x.url.includes("portfolio.hu") ||
        x.url.includes("24.hu") ||
        x.url.includes("mandiner.hu") ||
        x.url.includes("magyarnemzet.hu") ||
        x.url.includes("vadhajtasok.hu")
      )
  )
  .slice(0, 3);

const internationalFinalResults = sortedResults
  .filter(
    (x) =>
      x.type !== "video" &&
      (
        x.url.includes("reuters.com") ||
        x.url.includes("bbc.") ||
        x.url.includes("apnews.com") ||
        x.url.includes("euronews.com") ||
        x.url.includes("dw.com") ||
        x.url.includes("france24.com") ||
        x.url.includes("politico.com") ||
        x.url.includes("theguardian.com") ||
        x.url.includes("cnn.com") ||
        x.url.includes("foxnews.com")
      )
  )
  .slice(0, 3);


  
const allowedSortedResults = sortedResults.filter((item) => {
  try {
    const domain = new URL(item.url || "").hostname.replace("www.", "");

    return allowedDomains.some(
      (allowed) => domain === allowed || domain.endsWith("." + allowed)
    );
  } catch {
    return false;
  }
});

const oppositionArticles = allowedSortedResults
  .filter(
    (x) =>
      x.type === "article" &&
      (
        x.url.includes("telex.hu") ||
        x.url.includes("hvg.hu") ||
        x.url.includes("444.hu")
      )
  )
  .slice(0, 2);

const proGovernmentArticles = allowedSortedResults
  .filter(
    (x) =>
      x.type === "article" &&
      (
        x.url.includes("vadhajtasok.hu") ||
        x.url.includes("mandiner.hu") ||
        x.url.includes("magyarnemzet.hu")
      )
  )
  .slice(0, 2);

const neutralArticles = allowedSortedResults
  .filter(
    (x) =>
      x.type === "article" &&
      (
        x.url.includes("24.hu") ||
        x.url.includes("portfolio.hu")
      )
  )
  .slice(0, 1);

const finalArticles = [
  ...oppositionArticles,
  ...proGovernmentArticles,
  ...neutralArticles,
].slice(0, 5);

const finalVideos = allowedSortedResults
  .filter((x) => x.type === "video")
  .sort((a, b) => {

    const politicianName =
  (parsedQuery.politician || "").toLowerCase();
    const aText =
      `${a.title || ""} ${a.summary || ""}`.toLowerCase();

    const bText =
      `${b.title || ""} ${b.summary || ""}`.toLowerCase();

    function scoreVideo(text: string) {
      let score = 0;
      if (
  politicianName &&
  text.includes(politicianName)
) {
  score += 80;
}

      
      
      if (text.includes("migráció")) score += 25;
      if (text.includes("migration")) score += 25;
      if (text.includes("bevándorlás")) score += 25;

      if (text.includes("interjú")) score += 15;
      if (text.includes("interview")) score += 15;

      if (text.includes("beszéd")) score += 10;
      if (text.includes("speech")) score += 10;

      if (text.includes("parlament")) score += 10;

      if (text.includes("magyar péter")) score -= 80;
if (text.includes("orbán balázs")) score -= 60;
if (text.includes("shorts")) score -= 40;
if (text.includes("friss hír")) score -= 25;
if (text.includes("letartóztatni")) score -= 25;

if (text.includes("hír tv")) score += 20;
if (text.includes("atv")) score += 20;
if (text.includes("partizán")) score += 20;
if (text.includes("teljes")) score += 15;

      return score;
    }

    return scoreVideo(bText) - scoreVideo(aText);
  })
  .slice(0, 10);

const results = [...finalArticles, ...finalVideos];
if (results.length > 0) {
  await supabase.from("ai_search_cache").upsert({
    normalized_query: normalizedQuery,
    response: {
      articleQueries: [...localQueries, ...internationalQueries],
      videoQueries,
      articles: finalArticles,
      videos: finalVideos,
      results,
    },
  });
}

return NextResponse.json({
  articleQueries: [...localQueries, ...internationalQueries],
  videoQueries,
  articles: finalArticles,
  videos: finalVideos,
  results,
});
  } catch (error) {
    console.error("AI search failed:", error);

    return NextResponse.json(
      { results: [], error: "AI search failed" },
      { status: 500 }
    );
  }
}