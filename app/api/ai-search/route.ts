import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
);

type SearchResult = {
  title: string;
  url: string;
  description: string;
  source?: string;
  age?: string;
  score?: number;
};
async function getTopicMemory(topic: string | null) {
  if (!topic) return null;

  const { data, error } = await supabase
    .from("topic_memory")
    .select("*")
    .eq("topic", topic)
    .maybeSingle();

  if (error) {
    console.error("Topic memory load error:", error);
    return null;
  }

  return data;
}

async function upsertTopicMemory(params: {
  topic: string | null;
  searchQuery: string;
  summary?: string | null;
  stance?: string | null;
}) {
  if (!params.topic) return;

  const existing = await getTopicMemory(params.topic);

  const previousQueries = Array.isArray(existing?.last_queries)
    ? existing.last_queries
    : [];

  const nextQueries = [
    params.searchQuery,
    ...previousQueries.filter((x: string) => x !== params.searchQuery),
  ].slice(0, 20);

  const { error } = await supabase.from("topic_memory").upsert(
    {
      politician: "general",
      topic: params.topic,
      memory_summary: params.summary || existing?.memory_summary || "",
      stance_direction: params.stance || existing?.stance_direction || "mixed",
      last_queries: nextQueries,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "topic",
    }
  );

  if (error) {
    console.error("Topic memory save error:", error);
  }
}
async function findPoliticianFromQuery(query: string) {
  const q = normalize(query);

  const { data, error } = await supabase
    .from("politicians")
    .select("*")
    .eq("active", true);

  if (error) {
    console.error("Politician lookup error:", error);
    return null;
  }

  const politicians = data || [];

  for (const politician of politicians) {
    const names = [
      politician.full_name,
      ...(Array.isArray(politician.aliases) ? politician.aliases : []),
    ]
      .filter(Boolean)
      .map((x: string) => normalize(x));

    if (names.some((name: string) => q.includes(name))) {
      return politician;
    }
  }

  return null;
}

function extractTopicFromQuery(query: string) {
  const q = normalize(query);

  const topicMap = [
    {
      canonical: "IMMIGRATION_POLICY",
      keywords: [
        "bev├índorl",
        "migr├íci├│",
        "migr├íns",
        "migration",
        "immigration",
        "asylum",
        "refugee",
        "border",
      ],
    },

    {
  canonical: "NATO_DEFENSE",
  keywords: [
    "nato",
    "defense",
    "military",
    "army",
    "weapon",
    "weapons",
    "missile",
    "security",
    "v├ędelmi",
    "katonai",
    "hadsereg",
    "fegyver",
    "rak├ęta",
  ],
},

{
  canonical: "UKRAINE_WAR",
  keywords: [
    "ukrajna",
    "orosz",
    "h├íbor├║",
    "war",
    "ukraine",
    "russia"
  ],
},

    {
      canonical: "ECONOMY",
      keywords: [
        "gazdas├íg",
        "infl├íci├│",
        "├írak",
        "economy",
        "inflation",
        "tax",
        "gdp",
      ],
    },

    {
      canonical: "EU_POLITICS",
      keywords: [
        "eu",
        "european union",
        "brussels",
        "eur├│pai uni├│",
        "bizotts├íg",
      ],
    },
  ];

  for (const topic of topicMap) {
    if (
      topic.keywords.some((keyword) =>
        q.includes(keyword)
      )
    ) {
      return topic.canonical;
    }
  }

  return q
    .split(" ")
    .slice(0, 3)
    .join("_")
    .toUpperCase();
}

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
      error: "Hi├ínyzik a BRAVE_API_KEY env variable.",
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

async function autoSaveSources(params: {
  articles: any[];
  videos: any[];
  meta: any;
  detectedPolitician: any;
  detectedTopic: string;
}) {
  const bestArticle = params.articles?.[0];
  const bestVideo = params.videos?.[0];

  const items = [
    bestArticle
      ? {
          title: bestArticle.title || "AI found article",
          final_score: bestArticle.final_score || 0,
          url: bestArticle.url,
          article_url: bestArticle.url,
          video_url: null,
          type: "article",
          source_type: "article",
        }
      : null,
    bestVideo
      ? {
          title: bestVideo.title || "AI found video",
          final_score: bestVideo.final_score || 0,
          url: bestVideo.url,
          article_url: null,
          video_url: bestVideo.url,
          type: "video",
          source_type: "video",
        }
      : null,
  ].filter(Boolean);

  for (const item of items as any[]) {
    if (!item.url) continue;
    if (
  item.url.includes("youtube.com/results?search") ||
  item.url.includes("google.com/search")
) {
  continue;
}

if (
  typeof item.final_score === "number" &&
  item.final_score < 45
) {
  continue;
}

    const { data: existing } = await supabase
      .from("sources")
      .select("id")
      .eq("url", item.url)
      .maybeSingle();

    if (existing) continue;

    const { error } = await supabase.from("sources").insert({
      title: item.title,
      url: item.url,
      article_url: item.article_url,
      video_url: item.video_url,
      type: item.type,
      source_type: item.source_type,
      language:
        params.detectedPolitician?.language ||
        params.meta.language ||
        "hu",
      summary: params.meta.summary || "",
      ai_summary: params.meta.summary || "",
      politician:
        params.detectedPolitician?.full_name ||
        params.meta.politician ||
        "",
      topic: params.detectedTopic,
      country:
        params.detectedPolitician?.country ||
        params.meta.country ||
        "",
      quote_text:
        params.meta.transcript_quote ||
        params.meta.quote_candidate ||
        null,
      source_date: params.meta.date || null,
      status: "draft",
    });

    if (error) {
      console.error("Auto source save error:", error);
    }
  }
}
async function saveContradictionSeed(params: {
  meta: any;
  detectedPolitician: any;
  detectedTopic: string;
}) {
  const meta = params.meta || {};
  console.log("CONTRADICTION CHECK:", {
  probability: meta.contradiction_probability,
  same_topic: meta.same_topic,
  opposite_meaning: meta.opposite_meaning,
  strength: meta.contradiction_strength,
});

  if (
    meta.contradiction_probability < 60 ||
    !meta.same_topic 
    
  ) {
    return;
  }

  console.log("CONTRADICTION SEED DETECTED:", {
    politician: meta.politician || params.detectedPolitician?.full_name,
    topic: meta.cluster_topic || params.detectedTopic,
    probability: meta.contradiction_probability,
  });

  await supabase.from("contradiction_memory").insert({
    politician:
      meta.politician ||
      params.detectedPolitician?.full_name ||
      "",

    topic:
      meta.cluster_topic ||
      params.detectedTopic,

    old_stance:
      meta.old_stance || "unclear",

    new_stance:
      meta.new_stance || "unclear",

    contradiction_strength:
      meta.contradiction_strength || "possible",

    contradiction_probability:
      meta.contradiction_probability || 0,

    contradiction_reason:
      meta.contradiction_reason || "",

    timeline_hint:
      meta.timeline_hint || "",

    created_at: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || !String(query).trim()) {
      return NextResponse.json(
        {
          articles: [],
          videos: [],
          summary: "Nincs keres├ęs megadva.",
          politician: "",
          topic: "",
          country: "",
          date: "",
        },
        { status: 400 }
      );
    }

    const cleanQuery = String(query).trim();

const cacheKey = normalize(cleanQuery);
const detectedTopic = extractTopicFromQuery(cleanQuery);
const detectedPolitician = await findPoliticianFromQuery(cleanQuery);
console.log(
  "DETECTED POLITICIAN:",
  detectedPolitician?.full_name || "NONE"
);


const { data: cached } = await supabase
  .from("ai_search_cache")
  .select("response, created_at")
  .eq("normalized_query", cacheKey)
  .maybeSingle();

const CACHE_TTL_HOURS = 24;

if (cached?.response && cached?.created_at) {
  const cacheAge =
    Date.now() - new Date(cached.created_at).getTime();

  const cacheAgeHours =
    cacheAge / (1000 * 60 * 60);

  if (cacheAgeHours < CACHE_TTL_HOURS) {
    console.log(
      "AI SEARCH CACHE HIT:",
      cacheKey,
      `(${cacheAgeHours.toFixed(1)}h old)`
    );

    return NextResponse.json(cached.response);
  }

  console.log("AI SEARCH CACHE EXPIRED:", cacheKey);
}

let semanticCache: any = null;

if (detectedPolitician?.slug) {
  const { data } = await supabase
    .from("ai_search_cache")
    .select("response, created_at, query, canonical_topic, politician_slug")
    .eq("canonical_topic", detectedTopic)
    .eq("politician_slug", detectedPolitician.slug)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  semanticCache = data;
}
if (false && semanticCache?.response && semanticCache?.created_at) {

  const semanticAge =
    Date.now() - new Date(semanticCache.created_at).getTime();

  const semanticAgeHours =
    semanticAge / (1000 * 60 * 60);

  if (semanticAgeHours < CACHE_TTL_HOURS) {
    console.log(
      "AI SEARCH SEMANTIC CACHE HIT:",
      detectedTopic,
      `from query: ${semanticCache.query}`,
      `(${semanticAgeHours.toFixed(1)}h old)`
    );

    return NextResponse.json({
      ...semanticCache.response,
      semantic_cache_hit: true,
      semantic_cache_source_query: semanticCache.query,
      semantic_cache_topic: detectedTopic,
    });
  }
}

const topicMemory = await getTopicMemory(detectedTopic);
const { data: localSources } = await supabase
  .from("sources")
  .select("*")
  .ilike("politician", `%${detectedPolitician?.full_name || ""}%`)
  .limit(5);

console.log(
  "LOCAL SOURCE MATCHES:",
  localSources?.length || 0
);

const expandedQuery = cleanQuery
  .replace(/bev├índorl├ís/gi, "bev├índorl├ís migr├íci├│ illeg├ílis migr├íci├│ migr├íns")
  .replace(/migr├íci├│/gi, "migr├íci├│ bev├índorl├ís illeg├ílis migr├íci├│ migr├íns")
  .replace(
  /\bmigration\b/gi,
  detectQueryLanguageContext(cleanQuery).lang === "hu"
    ? "bev├índorl├ís migr├íci├│ illeg├ílis migr├íci├│ migr├íns migration"
    : detectQueryLanguageContext(cleanQuery).lang === "de"
    ? "Migration Fl├╝chtlinge Einwanderung Asyl migration"
    : "immigration migrants border asylum migration"
)
.replace(
  /\bimmigration\b/gi,
  detectQueryLanguageContext(cleanQuery).lang === "hu"
    ? "bev├índorl├ís migr├íci├│ illeg├ílis migr├íci├│ migr├íns immigration"
    : detectQueryLanguageContext(cleanQuery).lang === "de"
    ? "Migration Fl├╝chtlinge Einwanderung Asyl immigration"
    : "immigration migrants border asylum"
);

const expanded = expandSearchQueries(expandedQuery);

const articleQueries = expanded.articleQueries.slice(0, 4);
const videoQueries = expanded.videoQueries.slice(0, 3);


    const articleSearches = await Promise.all(
      articleQueries.map((q) => braveSearch(q, 4))
    );

    const videoSearches = await Promise.all(
      videoQueries.map((q) => braveSearch(q, 4))
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
    const prioritizedLocalUrls = new Set(
  (localSources || [])
    .map((s: any) => s.url)
    .filter(Boolean)
);

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
    local_priority: prioritizedLocalUrls.has(item.url),
    score: scoreResult(item, cleanQuery),
    quality_score: scoreSourceQuality(item),

    source_trust_type: trust.source_trust_type,
    source_trust_score: trust.source_trust_score,

    final_score:
  scoreResult(item, cleanQuery) * 0.5 +
  scoreSourceQuality(item) * 0.3 +
  trust.source_trust_score * 0.2 +
  (prioritizedLocalUrls.has(item.url) ? 25 : 0),
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

    let existingProfile: any = null;

if (detectedPolitician?.full_name) {
  const { data } = await supabase
    .from("politician_profiles")
    .select("*")
    .eq("politician", detectedPolitician.full_name)
    .maybeSingle();

  existingProfile = data;
}
      const aiPrompt = `
Elemezd ezt a politikai forr├ískeres├ęst.

Nagyon fontos:
A keres├ęs teljes jelent├ęs├ęt vedd figyelembe, ne csak a szem├ęly nev├ęt.
A tal├ílatok akkor j├│k, ha kapcsol├│dnak a t├ęm├íhoz, ├ęvhez, esem├ęnyhez vagy ├íll├şt├íshoz is.
Kor├íbbi politikus mem├│ria profil:
${existingProfile ? JSON.stringify(existingProfile, null, 2) : "Nincs kor├íbbi profil."}
Kor├íbbi t├ęma mem├│ria:
${topicMemory ? JSON.stringify(topicMemory, null, 2) : "Nincs kor├íbbi t├ęma mem├│ria."}

Haszn├íld a kor├íbbi t├ęma mem├│ri├ít is:
- ha volt m├ír ilyen t├ęma, vedd figyelembe a kor├íbbi keres├ęseket
- ├ęp├şts r├í a kor├íbbi ├Âsszefoglal├│ra
- ne csak ism├ęteld a r├ęgi tal├ílatokat
- jav├ştsd a keres├ęsi javaslatokat a mem├│ria alapj├ín
Felismert politikus registry alapj├ín:
${detectedPolitician ? JSON.stringify(detectedPolitician, null, 2) : "Nincs biztos politikus tal├ílat."}


Keres├ęs:
"${cleanQuery}"

Cikk tal├ílatok:
${JSON.stringify(articles, null, 2)}

Vide├│ tal├ílatok:
${JSON.stringify(videos, null, 2)}

Feladat:
- Adj r├Âvid magyar ├Âsszefoglal├│t.
- Tippeld meg a politikust/szem├ęlyt.
- Tippeld meg a t├ęm├ít.
- Tippeld meg az orsz├ígot/r├ęgi├│t.
- Ha l├ítszik d├ítum, add vissza YYYY-MM-DD form├íban, k├╝l├Ânben ├╝res string.
- Adj egy jobb keres├ęsi javaslatot r├ęgebbi ellent├ętes ├íll├şt├ís keres├ęs├ęhez.
- Gener├ílj k├╝l├Ân keres├ęsi javaslatot:
  - r├ęgebbi ├íll├şt├ís keres├ęs├ęre
  - ├║jabb ├íll├şt├ís keres├ęs├ęre
  - lehets├ęges ellentmond├ís keres├ęs├ęre

- A keres├ęsek legyenek:
  - r├Âvidek
  - konkr├ętak
  - YouTube/bar├íts├ígosak
  - politikai nyilatkozat keres├ęsre optimaliz├íltak
- Ha a tal├ílatok gyeng├ęk, ezt mondd ki r├Âviden.
- Tippeld meg, hogy van-e lehets├ęges politikai ellentmond├ís.
- Adj 0-100 contradiction_probability ├ęrt├ęket.
- Az ellentmond├íst csak akkor ├ęrt├ękeld magasra, ha ugyanarr├│l a konkr├ęt t├ęm├ír├│l, policy-r├│l vagy ├şg├ęretr┼Ĺl sz├│l.
- Ne adj magas ├ęrt├ęket, ha csak ugyanaz a politikus ├ęs ugyanaz az ├íltal├ínos t├ęma szerepel.
- Vizsg├íld meg:
  - same_topic: ugyanaz a konkr├ęt t├ęma?
  - opposite_meaning: t├ęnyleg ellent├ętes jelent├ęs?
  - opposite_meaning legyen true ha:
  - Hat├írozd meg az ├íll├íspont ir├íny├ít is:
  - K├ęsz├şts magasabb szint┼▒ klaszter elemz├ęst is:
  - Elemezd az id┼Ĺbeli politikai ir├ínyv├íltoz├íst is:
  - K├ęsz├şts politikus mem├│ria-profilt is:
  - K├ęsz├şts hosszabb t├ív├║ mem├│ria snapshotot is:
  - K├ęsz├şts politikai graph elemz├ęst is:
  - graph_node_type: statement | policy | event | rhetoric
  - graph_relationship: reinforce | contradict | evolve | react
  - contradiction_edge_strength: weak | medium | strong
  - narrative_transition: stable | escalating | reversing | fragmenting
- reinforce = er┼Ĺs├şti a kor├íbbi ├íll├şt├ísokat
- contradict = szembemegy vel├╝k
- evolve = fokozatos v├íltoz├ís
- react = aktu├ílis esem├ęnyre reag├íl
  - memory_snapshot: r├Âvid AI mem├│ria ├Âsszefoglal├│
  - long_term_direction: stabil hossz├║ t├ív├║ politikai ir├íny
  - volatility_level: low | medium | high
  - narrative_pattern: recurring | shifting | reactive | strategic
- recurring = visszat├ęr┼Ĺ politikai narrat├şva
- reactive = esem├ęnyekre reag├íl├│ kommunik├íci├│
- strategic = tudatos hossz├║ t├ív├║ strat├ęgiai kommunik├íci├│
  - Mindig t├Âltsd ki az ├Âsszes politician profile mez┼Ĺt.
- Ha bizonytalan vagy, akkor is adj becs├╝lt ├ęrt├ęket.
- Soha ne hagyd ├╝resen ezeket:
  - politician_profile_summary
  - stance_stability
  - ideological_direction
  - rhetoric_style
  - contradiction_history_level
  - politician_profile_summary: r├Âvid AI profil
  - stance_stability: stable | evolving | unstable
  - ideological_direction: conservative | liberal | nationalist | globalist | mixed | unclear
  - rhetoric_style: aggressive | diplomatic | populist | technocratic | mixed
  - contradiction_history_level: low | medium | high
- stable = hossz├║ ideje k├Âvetkezetes ├íll├íspont
- unstable = gyakori ir├ínyv├ílt├ís
- evolving = fokozatos politikai v├íltoz├ís
  - timeline_position: past | transition | current
  - stance_weight: 0-100
  - historical_relevance: low | medium | high
  - overall_stance_evolution: r├Âvid ├Âsszefoglal├│ az ├íll├íspont id┼Ĺbeli v├íltoz├ís├ír├│l
- transition = ├ítmeneti vagy v├íltoz├│ politikai ├íll├íspont
- stance_weight = mennyire er┼Ĺs ├ęs egy├ęrtelm┼▒ az adott ├íll├íspont
- historical_relevance legyen high ha az ├íll├şt├ís fontos politikai fordulatot jelez
  - cluster_topic: a f┼Ĺ politikai t├ęma r├Âvid neve
  - timeline_group: early | middle | recent
  - stance_signature: support | oppose | mixed | unstable
- unstable = az ├íll├íspont id┼Ĺben t├Âbbsz├Âr v├íltozik
- mixed = egyszerre t├Âbbf├ęle ├íll├íspont jelenik meg
  - old_stance: support | oppose | neutral | unclear
  - new_stance: support | oppose | neutral | unclear
- support = t├ímogatja az adott policy-t, szervezetet, d├Ânt├ęst vagy ├íll├şt├íst
- oppose = ellenzi, t├ímadja, elutas├ştja vagy visszavonn├í
- neutral = le├şr├│, technikai vagy kiegyens├║lyozott ├íll├şt├ís
- unclear = nincs el├ęg adat
- Ha old_stance ├ęs new_stance egym├ís ellent├ęte ugyanazon konkr├ęt t├ęm├íban, akkor opposite_meaning legyen true.
  - az egyik ├íll├şt├ís t├ímogat valamit, a m├ísik ellenzi
  - az egyik n├Âvel├ęst akar, a m├ísik cs├Âkkent├ęst
  - az egyik bel├ęp├ęst/t├ímogat├íst mond, a m├ísik kil├ęp├ęst/elutas├şt├íst
  - az egyik "igen", a m├ísik egy├ęrtelm┼▒ "nem"
  - az egyik ├íll├şt├ís ir├ínya politikailag vagy tartalmilag ford├ştott
- Ne legyen true csak az├ęrt, mert m├ís a hangnem vagy m├ís szavakat haszn├íl.
- Ha bizonytalan, ink├íbb false legyen.
  - context_shift: megv├íltozott a helyzet vagy kontextus?
  - time_gap_relevant: az id┼Ĺbeli k├╝l├Ânbs├ęg fontos?
- Ha csak hangnem v├íltozott, de a tartalom nem ellent├ętes, akkor contradiction_strength legyen weak vagy possible.
- Ha az egyik ├íll├şt├ís ÔÇťkritiz├ílÔÇŁ, a m├ísik pedig ÔÇťt├ímogatÔÇŁ, akkor csak akkor strong, ha ugyanarra a konkr├ęt ├╝gyre vonatkozik.
- R├Âviden ├şrd le az ok├ít contradiction_reason mez┼Ĺben.
- Adj r├Âvid timeline_hint javaslatot fontos ├ęvekkel vagy id┼Ĺszakokkal.
- Adj 0-100 ai_confidence ├ęrt├ęket arr├│l, mennyire megb├şzhat├│ az elemz├ęsed.
- Add meg a source_intent mez┼Ĺben, hogy a tal├ílatok f┼Ĺleg interj├║, besz├ęd, nyilatkozat, riport, v├ęlem├ęny, propaganda, vita vagy ismeretlen jelleg┼▒ek.
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
  "possible_contradiction_search": "",
"timeline_compare_hint": "",
"transcript_quote": "",
  "transcript_quote": "",
"timestamp": "",
"quote_precision": "low",
"contradiction_strength": "possible",
"same_topic": false,
"opposite_meaning": false,
"old_stance": "unclear",
"new_stance": "unclear",
"stance_shift": "none",
"cluster_topic": "",
"timeline_group": "recent",
"stance_signature": "mixed",
"timeline_position": "current",
"stance_weight": 50,
"historical_relevance": "medium",
"overall_stance_evolution": "",
"politician_profile_summary": "",
"stance_stability": "evolving",
"ideological_direction": "mixed",
"rhetoric_style": "mixed",
"contradiction_history_level": "medium",
"memory_snapshot": "",
"long_term_direction": "",
"volatility_level": "medium",
"narrative_pattern": "recurring",
"graph_node_type": "statement",
"graph_relationship": "evolve",
"contradiction_edge_strength": "medium",
"narrative_transition": "escalating",
"context_shift": "",
"time_gap_relevant": false,
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
    console.log("TOPIC MEMORY SAVE TRY:", {
  detectedTopic,
  metaTopic: meta.topic,
  cleanQuery,
});

await upsertTopicMemory({
  topic: detectedTopic,
  searchQuery: cleanQuery,
  summary: meta.summary || null,
  stance: meta.stance_signature || meta.new_stance || null,
  
});
    if (meta.politician) {
  await supabase
    .from("politician_profiles")
    .upsert(
      {
        politician: meta.politician,
        country: meta.country || null,
        language: meta.language || null,

        profile_summary:
          meta.politician_profile_summary || "",

        stance_stability:
          meta.stance_stability || "evolving",

        ideological_direction:
          meta.ideological_direction || "mixed",

        rhetoric_style:
          meta.rhetoric_style || "mixed",

        contradiction_history_level:
          meta.contradiction_history_level || "medium",

        memory_snapshot:
          meta.memory_snapshot || "",

        long_term_direction:
          meta.long_term_direction || "",

        volatility_level:
          meta.volatility_level || "medium",

        narrative_pattern:
          meta.narrative_pattern || "recurring",

        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "politician,country",
      }
    );
}

await autoSaveSources({
  articles,
  videos,
  meta,
  detectedPolitician,
  detectedTopic,
});
await saveContradictionSeed({
  meta,
  detectedPolitician,
  detectedTopic,
});
    const responsePayload = {
      articles,
      videos,
      summary:
        meta.summary ||
        `Tal├íltam ${articles.length} relev├íns cikket ├ęs ${videos.length} relev├íns vide├│t a teljes keres├ęs alapj├ín.`,
      politician: meta.politician || "",
      detected_politician: detectedPolitician
  ? {
      id: detectedPolitician.id,
      full_name: detectedPolitician.full_name,
      slug: detectedPolitician.slug,
      country: detectedPolitician.country,
      party: detectedPolitician.party,
      ideology: detectedPolitician.ideology,
      language: detectedPolitician.language,
    }
  : null,
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
possible_contradiction_search:
  `${meta.politician || cleanQuery} old statement vs new statement`,

timeline_compare_hint:
  `${meta.politician || cleanQuery} earlier vs current position`,
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
  same_topic: meta.same_topic || false,
opposite_meaning: meta.opposite_meaning || false,
old_stance: meta.old_stance || "unclear",
new_stance: meta.new_stance || "unclear",
stance_shift: meta.stance_shift || "none",
cluster_topic: meta.cluster_topic || "",
timeline_group: meta.timeline_group || "recent",
stance_signature: meta.stance_signature || "mixed",
timeline_position:
  meta.timeline_position || "current",

stance_weight:
  meta.stance_weight || 50,

historical_relevance:
  meta.historical_relevance || "medium",

overall_stance_evolution:
  meta.overall_stance_evolution || "",
  politician_profile_summary:
  meta.politician_profile_summary || "",

stance_stability:
  meta.stance_stability || "evolving",

ideological_direction:
  meta.ideological_direction || "mixed",

rhetoric_style:
  meta.rhetoric_style || "mixed",

contradiction_history_level:
  meta.contradiction_history_level || "medium",
  memory_snapshot:
  meta.memory_snapshot || "",

long_term_direction:
  meta.long_term_direction || "",

volatility_level:
  meta.volatility_level || "medium",

narrative_pattern:
  meta.narrative_pattern || "recurring",
  graph_node_type:
  meta.graph_node_type || "statement",

graph_relationship:
  meta.graph_relationship || "evolve",

contradiction_edge_strength:
  meta.contradiction_edge_strength || "medium",

narrative_transition:
  meta.narrative_transition || "stable",
context_shift: meta.context_shift || "",
time_gap_relevant:
  meta.time_gap_relevant || false,
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
    };
    await supabase.from("ai_search_cache").upsert(
  {
    query: cleanQuery,
    normalized_query: cacheKey,
    canonical_topic: detectedTopic,
    politician_slug: detectedPolitician?.slug || null,
    response: responsePayload,
    created_at: new Date().toISOString(),
  },
  {
    onConflict: "query",
  }
);

return NextResponse.json(responsePayload);
  } catch (error: any) {
    return NextResponse.json(
      {
        articles: [],
        videos: [],
        summary: "AI keres├ęsi hiba.",
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
    q.includes("orb├ín") ||
    q.includes("orban") ||
    q.includes("gyurcs├íny") ||
    q.includes("gyurcsany") ||
    q.includes("magyar") ||
    q.includes("fidesz") ||
    q.includes("tisza")
  ) {
    return {
      lang: "hu",
      country: "HU",
      speech: "besz├ęd",
      interview: "interj├║",
      statement: "nyilatkozat",
      transcript: "├ítirat",
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


const trustedDomains: Record<string, number> = {
  "reuters.com": 95,
  "apnews.com": 92,
  "bbc.com": 90,
  "nytimes.com": 88,
  "politico.com": 85,

  "whitehouse.gov": 95,
  "gov.hu": 92,
  "bundesregierung.de": 92,
  "bundestag.de": 90,
  "europa.eu": 90,

  "cnn.com": 75,
  "foxnews.com": 70,

  "youtube.com": 35,
  "tiktok.com": 20,
  "facebook.com": 20,
  "rumble.com": 15,
};

for (const domain in trustedDomains) {
  if (text.includes(domain)) {
    return {
      source_trust_type: "domain",
      source_trust_score: trustedDomains[domain],
    };
  }
}
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
    text.includes("pesti sr├ícok")
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

