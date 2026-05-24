export type DateExtractionInput = {
  title?: string | null;
  summary?: string | null;
  url?: string | null;
};

export type DateExtractionResult = {
  detectedYear: number | null;
  detectedDate: string | null;
  dateConfidence: number;
  dateReason: string;
};

export function extractDateSignals(
  input: DateExtractionInput
): DateExtractionResult {
  const text = `
${input.title || ""}
${input.summary || ""}
${input.url || ""}
`;

  const yearMatch = text.match(/\b(19|20)\d{2}\b/);

  if (yearMatch) {
    const year = Number(yearMatch[0]);

    return {
      detectedYear: year,
      detectedDate: `${year}-01-01`,
      dateConfidence: 50,
      dateReason: "Year detected in source text",
    };
  }

  return {
    detectedYear: null,
    detectedDate: null,
    dateConfidence: 0,
    dateReason: "No date signal detected",
  };
}