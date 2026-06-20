export type ParsedPoliticalQuery = {
  rawQuery: string;
  politician: string | null;
  topic: string;
  country: string;
  language: "hu" | "de" | "en";
};

type PoliticianRecord = {
  full_name: string;
  slug: string;
  country: string;
};

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function languageFromCountry(country: string): "hu" | "de" | "en" {
  if (country === "HU") return "hu";
  if (country === "DE") return "de";
  return "en";
}
function normalizePoliticianName(name: string | null) {
  if (!name) return null;

  const normalized = normalizeText(name);

  if (normalized === "orban") return "Orbán Viktor";
  if (normalized === "olaf") return "Olaf Scholz";
  if (normalized === "meloni") return "Giorgia Meloni";
  if (normalized === "trump") return "Donald Trump";
  if (normalized === "merz") return "Friedrich Merz";

  return name;
}

export function parsePoliticalQueryFromRegistry(
  query: string,
  politicians: PoliticianRecord[]
): ParsedPoliticalQuery {
  const normalizedQuery = normalizeText(query);

  const matchedPolitician = politicians.find((politician) => {
    const fullName = normalizeText(politician.full_name);
    const surname = fullName.split(" ")[0];

    return (
      normalizedQuery.includes(fullName) ||
      normalizedQuery.includes(surname)
    );
  });

  if (matchedPolitician) {
    const normalizedName = normalizeText(matchedPolitician.full_name);
    const nameParts = matchedPolitician.full_name
  .split(" ")
  .filter(Boolean);

let topic = query;

topic = topic.replace(
  new RegExp(matchedPolitician.full_name, "gi"),
  ""
);

for (const part of nameParts) {
  topic = topic.replace(
    new RegExp(part, "gi"),
    ""
  );
}

topic = topic.trim();

    return {
      rawQuery: query,
      politician: normalizePoliticianName(matchedPolitician.full_name),
      topic: topic || query,
      country: matchedPolitician.country,
      language: languageFromCountry(matchedPolitician.country),
    };
  }

  return {
    rawQuery: query,
    politician: null,
    topic: query,
    country: "INT",
    language: "en",
  };
}

export function parsePoliticalQuery(query: string): ParsedPoliticalQuery {
  const q = query.toLowerCase();

  if (q.includes("orbán")) {
    return {
      rawQuery: query,
      politician: "Orbán Viktor",
      topic: query.replace(/orbán viktor|orbán/gi, "").trim() || query,
      country: "HU",
      language: "hu",
    };
  }

  if (q.includes("merz")) {
    return {
      rawQuery: query,
      politician: "Friedrich Merz",
      topic: query.replace(/merz|friedrich merz/gi, "").trim() || query,
      country: "DE",
      language: "de",
    };
  }

  if (q.includes("trump")) {
    return {
      rawQuery: query,
      politician: "Donald Trump",
      topic: query.replace(/trump|donald trump/gi, "").trim() || query,
      country: "US",
      language: "en",
    };
  }

  return {
    rawQuery: query,
    politician: null,
    topic: query,
    country: "INT",
    language: "en",
  };
}