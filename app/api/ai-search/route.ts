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

  if (coverage < 0.4) score -= 30;

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

  return coverage >= 0.45;
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

    const articleQueries = [
      `"${cleanQuery}"`,
      `${cleanQuery} article news source`,
      `${cleanQuery} official statement interview speech`,
    ];

    const videoQueries = [
      `${cleanQuery} site:youtube.com`,
      `${cleanQuery} site:youtu.be`,
      `${cleanQuery} interview statement speech video`,
    ];

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
      .map((item) => ({
        ...item,
        score: scoreResult(item, cleanQuery),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5);

    const videos = uniqueByUrl(allVideoResults)
      .filter(
        (item) =>
          (item.url.includes("youtube.com") || item.url.includes("youtu.be")) &&
          resultMatchesQuery(item, cleanQuery)
      )
      .map((item) => ({
        ...item,
        score: scoreResult(item, cleanQuery),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
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
- Ha a találatok gyengék, ezt mondd ki röviden.

Adj vissza CSAK tiszta JSON-t:

{
  "summary": "",
  "politician": "",
  "topic": "",
  "country": "",
  "date": "",
  "older_search_suggestion": ""
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
      date: meta.date || "",
      older_search_suggestion: meta.older_search_suggestion || "",
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