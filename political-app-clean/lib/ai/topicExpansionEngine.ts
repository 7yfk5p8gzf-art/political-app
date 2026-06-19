export type PoliticianForSearch = {
  full_name: string;
  aliases?: string[] | null;
  country?: string | null;
  language?: string | null;
};

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function unique(list: string[]) {
  return Array.from(new Set(list.map(cleanText))).filter(Boolean);
}

export function buildTopicExpansionQueries(params: {
  topic: string;
  politician: PoliticianForSearch | null;
}) {
  const topic = cleanText(params.topic);
  const politician = params.politician;

  const names = unique([
    politician?.full_name || "",
    ...(politician?.aliases || []),
  ]);

  const mainName = names[0] || "";

  const intentWordsHu = [
    "mondta",
    "nyilatkozta",
    "ígérte",
    "korábban",
    "állította",
    "interjú",
    "beszéd",
    "videó",
  ];

  const contradictionWordsHu = [
    "régen",
    "most",
    "ellentmondás",
    "korábbi nyilatkozat",
    "változott az álláspontja",
  ];

  const yearHints = [
    "2010",
    "2014",
    "2018",
    "2022",
    "2023",
    "2024",
    "2025",
  ];

  const queries: string[] = [];

  if (mainName) {
    queries.push(`"${mainName}" "${topic}"`);
    queries.push(`"${mainName}" ${topic} mondta`);
    queries.push(`"${mainName}" ${topic} nyilatkozta`);
    queries.push(`"${mainName}" ${topic} interjú`);
    queries.push(`"${mainName}" ${topic} videó`);
    queries.push(`"${mainName}" ${topic} korábban`);
    queries.push(`"${mainName}" ${topic} ígérte`);

    for (const word of intentWordsHu) {
      queries.push(`"${mainName}" "${topic}" ${word}`);
    }

    for (const word of contradictionWordsHu) {
      queries.push(`"${mainName}" "${topic}" ${word}`);
    }

    for (const year of yearHints) {
      queries.push(`"${mainName}" "${topic}" ${year}`);
    }
  } else {
    queries.push(`"${topic}"`);
    queries.push(`${topic} mondta`);
    queries.push(`${topic} interjú`);
    queries.push(`${topic} korábban`);
  }

  return unique(queries).slice(0, 18);
}
export type SearchResultForScoring = {
  title?: string;
  description?: string;
  url?: string;
  source?: string;
};

export function scoreSearchResultV2(params: {
  result: SearchResultForScoring;
  politicianName?: string;
  topic?: string;
}) {
  const text = [
    params.result.title,
    params.result.description,
    params.result.url,
    params.result.source,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const politician = (params.politicianName || "").toLowerCase();
  const topic = (params.topic || "").toLowerCase();

  let score = 0;

  if (politician && text.includes(politician)) score += 20;
  if (topic && text.includes(topic)) score += 15;

  if (text.includes("interjú") || text.includes("interview")) score += 10;
  if (text.includes("beszéd") || text.includes("speech")) score += 10;
  if (text.includes("nyilatkozat") || text.includes("statement")) score += 10;
  if (text.includes("videó") || text.includes("video") || text.includes("youtube")) score += 10;

  if (
    text.includes("reuters") ||
    text.includes("bbc") ||
    text.includes("euronews") ||
    text.includes("apnews")
  ) {
    score += 5;
  }

  const isVideo =
  text.includes("youtube.com") ||
  text.includes("youtu.be") ||
  text.includes("video") ||
  text.includes("videó");

if (
  text.includes("friss") ||
  text.includes("breaking") ||
  text.includes("latest") ||
  text.includes("today") ||
  text.includes("élő") ||
  text.includes("élő közvetítés")
) {
  score -= 30;
}

if (!isVideo && text.includes("live")) {
  score -= 30;
}

if (isVideo && text.includes("live")) {
  score -= 10;
}
if (
  text.includes("speech") ||
  text.includes("beszéd") ||
  text.includes("interjú") ||
  text.includes("interview")
) {
  score += 15;
}

if (
  text.includes("youtube.com") ||
  text.includes("youtu.be")
) {
  score += 10;
}

if (
  text.includes("parlament") ||
  text.includes("parliament") ||
  text.includes("országgyűlés")
) {
  score += 15;
}

  if (politician && text.includes(politician) && topic && !text.includes(topic)) {
    score -= 15;
  }

  if (
    text.includes("sport") ||
    text.includes("celeb") ||
    text.includes("bulvár") ||
    text.includes("entertainment")
  ) {
    score -= 10;
  }
  if (
  text.includes("index.hu") ||
  text.includes("index.hu/")
) {
  score -= 25;
}

  return score;
}