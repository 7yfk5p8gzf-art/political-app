type CountryCode = "HU" | "DE" | "FR" | "IT" | "ES" | "NL" | "PL" | "AT" | "US";

const COUNTRY_TOPIC_TERMS: Record<string, Record<string, string[]>> = {
  migration: {
    HU: ["migráció", "bevándorlás", "migráns", "menekült", "határ"],
    DE: ["migration", "einwanderung", "flüchtlinge", "asyl", "grenze"],
    AT: ["migration", "einwanderung", "flüchtlinge", "asyl", "grenze"],
    IT: ["migrazione", "immigrazione", "migranti", "sbarchi", "confini"],
    FR: ["immigration", "migrants", "frontières", "asile"],
    ES: ["inmigración", "migrantes", "frontera", "asilo"],
    NL: ["immigratie", "migranten", "asiel", "grens"],
    PL: ["imigracja", "migranci", "azyl", "granica"],
    US: ["immigration", "migrants", "border", "asylum"],
  },
};

function detectTopic(query: string) {
  const q = query.toLowerCase();

  if (
    q.includes("migration") ||
    q.includes("migráció") ||
    q.includes("bevándorlás") ||
    q.includes("immigration") ||
    q.includes("immigrazione") ||
    q.includes("migrazione") ||
    q.includes("einwanderung") ||
    q.includes("flücht") ||
    q.includes("asyl") ||
    q.includes("inmigración") ||
    q.includes("imigracja") ||
    q.includes("immigratie")
  ) {
    return "migration";
  }

  return null;
}

export function getTopicKeywords(query: string, country?: string | null) {
  const topic = detectTopic(query);

  if (!topic) return [];

  const countryKey = (country || "").toUpperCase() as CountryCode;

  const countryTerms =
    COUNTRY_TOPIC_TERMS[topic]?.[countryKey] || [];

  const fallbackTerms = [
    "migration",
    "immigration",
    "migrant",
    "migrants",
    "border",
  ];

  return Array.from(new Set([...countryTerms, ...fallbackTerms]));
}

export function getLocalizedTopicTerms(query: string, country?: string | null) {
  return getTopicKeywords(query, country).join(" ");
}