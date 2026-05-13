import { NextResponse } from "next/server";

type SearchResult = {
  title: string;
  url: string;
  description: string;
  source?: string;
  age?: string;
  score?: number;
};

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function extractImportantWords(query: string) {
  return normalize(query)
    .split(" ")
    .filter((word) => word.length >= 3)
    .filter(
      (word) =>
        ![
          "the",
          "and",
          "for",
          "with",
          "about",
          "statement",
          "interview",
          "speech",
          "video",
          "cikk",
          "article",
        ].includes(word)
    );
}

function scoreResult(item: SearchResult, query: string) {
  const importantWords = extractImportantWords(query);
  const text = normalize(`${item.title} ${item.description} ${item.url}`);

  let score = 0;

  importantWords.forEach((word) => {
    if (text.includes(word)) score += 8;
  });

  const matchedWords = importantWords.filter((word) => text.includes(word));
  const coverage = importantWords.length
    ? matchedWords.length / importantWords.length
    : 0;

  score += Math.round(coverage * 40);

  if (coverage < 0.6) score -= 35;

  if (text.includes("youtube.com") || text.includes("youtu.be")) score += 8;
  if (text.includes("interview")) score += 5;
  if (text.includes("statement")) score += 5;
  if (text.includes("speech")) score += 5;
  if (text.includes("official")) score += 4;
  if (text.includes("reuters")) score += 4;
  if (text.includes("bbc")) score += 4;
  if (text.includes("euronews")) score += 4;
  if (text.includes("guardian")) score += 3;

  return score;
}

function resultMatchesQuery(item: SearchResult, query: string) {
  const importantWords = extractImportantWords(query);
  const text = normalize(`${item.title} ${item.description} ${item.url}`);

  if (importantWords.length === 0) return true;

  const matchedWords = importantWords.filter((word) => text.includes(word));
  const coverage = matchedWords.length / importantWords.length;
  

  return coverage >= 0.5;
}

async function braveSearch(query: string, count = 10) {
  const key = process.env.BRAVE_API_KEY;

  if (!key) {
    return {
      ok: false,
      error: "Hiányzik a BRAVE_API_KEY env variable.",
      results: [] as SearchResult[],
    };
  }

  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(
      query
    )}&count=${count}&freshness=py&extra_snippets=true`,
    {
      headers: {
        "X-Subscription-Token": key,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return {
      ok: false,
      error: `Brave API hiba: ${res.status}`,
      results: [] as SearchResult[],
    };
  }

  const data = await res.json();

  const results: SearchResult[] =
    data.web?.results?.map((item: any) => ({
      title: item.title || "",
      url: item.url || "",
      description: item.description || "",
      source: item.profile?.name || item.meta_url?.hostname || "",
      age: item.age || "",
    })) || [];

  return {
    ok: true,
    error: "",
    results,
  };
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || !String(query).trim()) {
      return NextResponse.json(
        {
          articles: [],
          videos: [],
          summary: "Nincs keresés megadva.",
          politician: "",
          topic: "",
          country: "",
          date: "",
        },
        { status: 400 }
      );
    }

    const cleanQuery = String(query).trim();

const expandedQuery = cleanQuery
  .replace(/bevándorlás/gi, "bevándorlás migráció illegális migráció migráns")
  .replace(/migráció/gi, "migráció bevándorlás illegális migráció migráns")
  .replace(
  /\bmigration\b/gi,
  detectQueryLanguageContext(cleanQuery).lang === "hu"
    ? "bevándorlás migráció illegális migráció migráns migration"
    : detectQueryLanguageContext(cleanQuery).lang === "de"
    ? "Migration Flüchtlinge Einwanderung Asyl migration"
    : "immigration migrants border asylum migration"
)
.replace(
  /\bimmigration\b/gi,
  detectQueryLanguageContext(cleanQuery).lang === "hu"
    ? "bevándorlás migráció illegális migráció migráns immigration"
    : detectQueryLanguageContext(cleanQuery).lang === "de"
    ? "Migration Flüchtlinge Einwanderung Asyl immigration"
    : "immigration migrants border asylum"
);

const expanded = expandSearchQueries(expandedQuery);

const articleQueries = expanded.articleQueries;
const videoQueries = expanded.videoQueries;


    const articleSearches = await Promise.all(
      articleQueries.map((q) => braveSearch(q, 6))
    );

    const videoSearches = await Promise.all(
      videoQueries.map((q) => braveSearch(q, 6))
    );

    const allArticleResults = articleSearches.flatMap((r) => r.results);
    const allVideoResults = videoSearches.flatMap((r) => r.results);

    const uniqueByUrl = (items: SearchResult[]) => {
      const map = new Map<string, SearchResult>();

      items.forEach((item) => {
        if (!item.url) return;
        if (!map.has(item.url)) map.set(item.url, item);
      });

      return Array.from(map.values());
    };

    const articles = uniqueByUrl(allArticleResults)
      .filter(
        (item) =>
          !item.url.includes("youtube.com") &&
          !item.url.includes("youtu.be") &&
          resultMatchesQuery(item, cleanQuery)
      )
      .map((item) => {
  const trust = detectSourceTrust(item);

  return {
    ...item,
    score: scoreResult(item, cleanQuery),
    quality_score: scoreSourceQuality(item),

    source_trust_type: trust.source_trust_type,
    source_trust_score: trust.source_trust_score,

    final_score:
      scoreResult(item, cleanQuery) * 0.5 +
      scoreSourceQuality(item) * 0.3 +
      trust.source_trust_score * 0.2,
  };
})
      .sort((a, b) => (b.final_score || 0) - (a.final_score || 0))
      .slice(0, 5);

    const videos = uniqueByUrl(allVideoResults)
      .filter(
        (item) =>
          (item.url.includes("youtube.com") || item.url.includes("youtu.be")) &&
          resultMatchesQuery(item, cleanQuery)
      )
      .map((item) => {
  const trust = detectSourceTrust(item);

  return {
    ...item,
    score: scoreResult(item, cleanQuery),
    quality_score: scoreSourceQuality(item),

    source_trust_type: trust.source_trust_type,
    source_trust_score: trust.source_trust_score,

    final_score:
      scoreResult(item, cleanQuery) * 0.45 +
      scoreSourceQuality(item) * 0.35 +
      trust.source_trust_score * 0.2,
  };
})
      .sort((a, b) => (b.final_score || 0) - (a.final_score || 0))
      .slice(0, 5);

    const aiPrompt = `
Elemezd ezt a politikai forráskeresést.

Nagyon fontos:
A keresés teljes jelentését vedd figyelembe, ne csak a személy nevét.
A találatok akkor jók, ha kapcsolódnak a témához, évhez, eseményhez vagy állításhoz is.

Keresés:
"${cleanQuery}"

Cikk találatok:
${JSON.stringify(articles, null, 2)}

Videó találatok:
${JSON.stringify(videos, null, 2)}

Feladat:
- Adj rövid magyar összefoglalót.
- Tippeld meg a politikust/személyt.
- Tippeld meg a témát.
- Tippeld meg az országot/régiót.
- Ha látszik dátum, add vissza YYYY-MM-DD formában, különben üres string.
- Adj egy jobb keresési javaslatot régebbi ellentétes állítás kereséséhez.
- Generálj külön keresési javaslatot:
  - régebbi állítás keresésére
  - újabb állítás keresésére
  - lehetséges ellentmondás keresésére

- A keresések legyenek:
  - rövidek
  - konkrétak
  - YouTube/barátságosak
  - politikai nyilatkozat keresésre optimalizáltak
- Ha a találatok gyengék, ezt mondd ki röviden.
- Tippeld meg, hogy van-e lehetséges politikai ellentmondás.
- Adj 0-100 contradiction_probability értéket.
- Röviden írd le az okát contradiction_reason mezőben.
- Adj rövid timeline_hint javaslatot fontos évekkel vagy időszakokkal.
- Adj 0-100 ai_confidence értéket arról, mennyire megbízható az elemzésed.
- Add meg a source_intent mezőben, hogy a találatok főleg interjú, beszéd, nyilatkozat, riport, vélemény, propaganda, vita vagy ismeretlen jellegűek.
If available, extract an exact transcript quote from the article or video.

If a video timestamp is available, return it in HH:MM:SS format.

Do not invent quotes or timestamps.

quote_precision:
- high = exact quote/transcript
- medium = partial/paraphrased quote
- low = uncertain or inferred

contradiction_strength:
- strong = directly opposite statements
- possible = position noticeably changed
- weak = same topic but contradiction unclear
Adj vissza CSAK tiszta JSON-t:

{
  "summary": "",
  "politician": "",
  "topic": "",
  "country": "",
  "language": "",
  "date": "",
  "source_quality": "",
  "relevance_score": 0,
  "best_article_url": "",
  "best_video_url": "",
  "quote_candidate": "",
  "older_search_suggestion": "",
  "transcript_quote": "",
"timestamp": "",
"quote_precision": "low",
"contradiction_strength": "possible",
  "newer_search_suggestion": "",
"contradiction_search_suggestion": ""
"contradiction_probability": 0,
"contradiction_reason": "",
"timeline_hint": "",
"ai_confidence": 0,
"source_intent": "",
transcript_quote,
timestamp,
quote_precision,
contradiction_strength,
  
  "warning": ""
}
`;

    let meta: any = {};

    if (process.env.OPENAI_API_KEY) {
      const aiRes = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5.3-chat-latest",
          input: aiPrompt,
          text: {
            format: {
              type: "json_object",
            },
          },
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();

        const text =
          aiData.output_text ||
          aiData.output
            ?.flatMap((o: any) => o.content || [])
            ?.find((c: any) => c.text)?.text ||
          "{}";

        try {
          meta = JSON.parse(text);
        } catch {
          meta = {};
        }
        const bestVideoUrl = meta.best_video_url || "";

if (bestVideoUrl) {
  const transcript = await getYouTubeTranscript(bestVideoUrl);

  if (transcript) {
    const bestMatch = findBestTranscriptMatch(
      transcript,
      cleanQuery
    );

    if (bestMatch && bestMatch.score > 0) {
      meta.transcript_quote = bestMatch.text;
      meta.timestamp = bestMatch.timestamp;

      meta.quote_precision =
        bestMatch.score > 0.6
          ? "high"
          : bestMatch.score > 0.3
          ? "medium"
          : "low";
    }
  }
}
      }
    }

    return NextResponse.json({
      articles,
      videos,
      summary:
        meta.summary ||
        `Találtam ${articles.length} releváns cikket és ${videos.length} releváns videót a teljes keresés alapján.`,
      politician: meta.politician || "",
      topic: meta.topic || "",
      country: meta.country || "",
language: meta.language || "",
date: meta.date || "",
source_quality: meta.source_quality || "",
relevance_score: meta.relevance_score || 0,
best_article_url: meta.best_article_url || "",
best_video_url: meta.best_video_url || "",
quote_candidate: meta.quote_candidate || "",
older_search_suggestion: meta.older_search_suggestion || "",
newer_search_suggestion: meta.newer_search_suggestion || "",
transcript_quote: meta.transcript_quote || "",
timestamp: meta.timestamp || "",
quote_precision: meta.quote_precision || "low",
contradiction_strength: meta.contradiction_strength || "possible",
contradiction_search_suggestion:
  meta.contradiction_search_suggestion || "",
  contradiction_probability:
  meta.contradiction_probability || 0,

contradiction_reason:
  meta.contradiction_reason || "",
  timeline_hint:
  meta.timeline_hint || "",
  ai_confidence:
  meta.ai_confidence || 0,
  source_intent:
  meta.source_intent || "",
warning: meta.warning || "",
      debug: {
        query: cleanQuery,
        articleQueries,
        videoQueries,
        articleSearchOk: articleSearches.every((r) => r.ok),
        videoSearchOk: videoSearches.every((r) => r.ok),
        articleErrors: articleSearches.map((r) => r.error).filter(Boolean),
        videoErrors: videoSearches.map((r) => r.error).filter(Boolean),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        articles: [],
        videos: [],
        summary: "AI keresési hiba.",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
function extractYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/
  );
  return match?.[1] || null;
}

function decodeHtml(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function formatTimestamp(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

async function getYouTubeTranscript(videoUrl: string) {
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) return null;

  const languages = ["hu", "en", "de"];

  for (const lang of languages) {
    try {
      const res = await fetch(
        `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}`
      );

      const xml = await res.text();

      if (!xml || !xml.includes("<text")) continue;

      const parts = [...xml.matchAll(/<text start="([^"]+)"[^>]*>(.*?)<\/text>/g)];

      const transcript = parts.map((part) => ({
        start: Number(part[1]),
        timestamp: formatTimestamp(Number(part[1])),
        text: decodeHtml(part[2].replace(/<[^>]+>/g, " ")).trim(),
      }));

      if (transcript.length > 0) {
        return transcript;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function findBestTranscriptMatch(
  transcript: { start: number; timestamp: string; text: string }[],
  query: string
) {
  const cleanQuery = query.toLowerCase();

  let best = null as null | {
    timestamp: string;
    text: string;
    score: number;
  };

  for (const row of transcript) {
    const text = row.text.toLowerCase();

    const words = cleanQuery
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const hits = words.filter((w) => text.includes(w)).length;
    const score = words.length ? hits / words.length : 0;

    if (!best || score > best.score) {
      best = {
        timestamp: row.timestamp,
        text: row.text,
        score,
      };
    }
  }

  return best;
}
function scoreSourceQuality(item: {
  title?: string;
  url?: string;
  source?: string;
  description?: string;
}) {
  const text = `${item.title || ""} ${item.url || ""} ${item.source || ""} ${
    item.description || ""
  }`.toLowerCase();

  let score = 50;

  const strongSources = [
    "reuters",
    "apnews",
    "associated press",
    "whitehouse.gov",
    "gov.",
    "parliament",
    "bundestag",
    "europa.eu",
    "c-span",
    "congress.gov",
    "senate.gov",
    "house.gov",
    "bbc",
    "theguardian",
    "nytimes",
    "politico",
  ];

  const weakSources = [
    "opinion",
    "reaction",
    "commentary",
    "shorts",
    "tiktok",
    "facebook",
    "rumble",
    "breaking",
    "shocking",
    "destroys",
    "exposed",
    "must watch",
  ];

  for (const s of strongSources) {
    if (text.includes(s)) score += 15;
  }

  for (const s of weakSources) {
    if (text.includes(s)) score -= 20;
  }

  if (text.includes("full speech")) score += 20;
  if (text.includes("interview")) score += 15;
  if (text.includes("transcript")) score += 15;
  if (text.includes("statement")) score += 15;
  if (text.includes("official")) score += 15;

  if (text.includes("clip")) score -= 10;
  if (text.includes("highlights")) score -= 10;

  return Math.max(0, Math.min(100, score));
}
function expandSearchQueries(query: string) {
  const base = query.trim();
  const context = detectQueryLanguageContext(query);

  const variants = [
    base,
    `${base} ${context.speech}`,
`${base} ${context.interview}`,
`${base} ${context.statement}`,
`${base} ${context.transcript}`,
    `${base} full speech`,
    `${base} press conference`,
    `${base} ${context.official}`,
    `${base} policy`,
  ];

  const videoQueries = [
    `${base} video`,
    `${base} ${context.interview} youtube`,
`${base} ${context.speech} youtube`,
    `${base} full interview`,
    `${base} live`,
  ];

  const contradictionQueries = [
    `${base} previous statement`,
    `${base} changed position`,
    `${base} contradiction`,
    `${base} then vs now`,
    `${base} old statement`,
  ];

  return {
    articleQueries: [...new Set(variants)],
    videoQueries: [...new Set(videoQueries)],
    contradictionQueries: [...new Set(contradictionQueries)],
  };
}
function detectQueryLanguageContext(query: string) {
  const q = query.toLowerCase();

  if (
    q.includes("orbán") ||
    q.includes("orban") ||
    q.includes("gyurcsány") ||
    q.includes("gyurcsany") ||
    q.includes("magyar") ||
    q.includes("fidesz") ||
    q.includes("tisza")
  ) {
    return {
      lang: "hu",
      country: "HU",
      speech: "beszéd",
      interview: "interjú",
      statement: "nyilatkozat",
      transcript: "átirat",
      official: "site:gov.hu OR site:kormany.hu OR site:parlament.hu",
    };
  }

  if (
    q.includes("merz") ||
    q.includes("scholz") ||
    q.includes("afd") ||
    q.includes("bundestag") ||
    q.includes("deutschland")
  ) {
    return {
      lang: "de",
      country: "DE",
      speech: "Rede",
      interview: "Interview",
      statement: "Aussage",
      transcript: "Transkript",
      official: "site:bundestag.de OR site:bundesregierung.de",
    };
  }

  return {
    lang: "en",
    country: "US",
    speech: "speech",
    interview: "interview",
    statement: "statement",
    transcript: "transcript",
    official: "site:whitehouse.gov OR site:congress.gov OR site:senate.gov OR site:house.gov",
  };
}
function detectSourceTrust(item: {
  title?: string;
  url?: string;
  source?: string;
  description?: string;
}) {
  const text = `${item.title || ""} ${item.url || ""} ${item.source || ""} ${
    item.description || ""
  }`.toLowerCase();

  if (
    text.includes("gov.hu") ||
    text.includes("kormany.hu") ||
    text.includes("parlament.hu") ||
    text.includes("bundestag.de") ||
    text.includes("bundesregierung.de") ||
    text.includes("whitehouse.gov") ||
    text.includes("congress.gov") ||
    text.includes("senate.gov") ||
    text.includes("house.gov")
  ) {
    return {
      source_trust_type: "official",
      source_trust_score: 95,
    };
  }

  if (
    text.includes("reuters") ||
    text.includes("apnews") ||
    text.includes("associated press") ||
    text.includes("bbc") ||
    text.includes("theguardian") ||
    text.includes("nytimes") ||
    text.includes("politico") ||
    text.includes("zdf") ||
    text.includes("ard") ||
    text.includes("spiegel") ||
    text.includes("faz")
  ) {
    return {
      source_trust_type: "major_media",
      source_trust_score: 85,
    };
  }

  if (
    text.includes("origo") ||
    text.includes("magyar nemzet") ||
    text.includes("pravda") ||
    text.includes("mandiner") ||
    text.includes("pesti srácok")
  ) {
    return {
      source_trust_type: "partisan_media",
      source_trust_score: 55,
    };
  }

  if (
    text.includes("youtube") ||
    text.includes("tiktok") ||
    text.includes("facebook") ||
    text.includes("rumble")
  ) {
    return {
      source_trust_type: "platform",
      source_trust_score: 35,
    };
  }

  return {
    source_trust_type: "unknown",
    source_trust_score: 45,
  };
}