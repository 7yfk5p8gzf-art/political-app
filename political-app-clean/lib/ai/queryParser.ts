export type ParsedPoliticalQuery = {
  rawQuery: string;
  politician: string | null;
  topic: string;
  country: "HU" | "DE" | "US" | "INT";
  language: "hu" | "de" | "en";
};

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