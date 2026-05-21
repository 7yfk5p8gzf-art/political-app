export type PublicLang = "hu" | "de" | "en" | "fr";

export type TranslatablePublicItem = {
  topic?: string | null;
  topic_hu?: string | null;
  topic_de?: string | null;
  topic_en?: string | null;
  topic_fr?: string | null;

  ai_summary?: string | null;
  ai_summary_hu?: string | null;
  ai_summary_de?: string | null;
  ai_summary_en?: string | null;
  ai_summary_fr?: string | null;

  old_statement?: string | null;
  old_statement_hu?: string | null;
  old_statement_de?: string | null;
  old_statement_en?: string | null;
  old_statement_fr?: string | null;

  new_statement?: string | null;
  new_statement_hu?: string | null;
  new_statement_de?: string | null;
  new_statement_en?: string | null;
  new_statement_fr?: string | null;
};

export function getTranslatedTopic(
  item: TranslatablePublicItem,
  lang: PublicLang
) {
  if (lang === "hu") return item.topic_hu || item.topic;
  if (lang === "de") return item.topic_de || item.topic;
  if (lang === "en") return item.topic_en || item.topic;
  if (lang === "fr") return item.topic_fr || item.topic;

  return item.topic;
}

export function getTranslatedSummary(
  item: TranslatablePublicItem,
  lang: PublicLang
) {
  if (lang === "hu") return item.ai_summary_hu || item.ai_summary;
  if (lang === "de") return item.ai_summary_de || item.ai_summary;
  if (lang === "en") return item.ai_summary_en || item.ai_summary;
  if (lang === "fr") return item.ai_summary_fr || item.ai_summary;

  return item.ai_summary;
}

export function getTranslatedOldStatement(
  item: TranslatablePublicItem,
  lang: PublicLang
) {
  if (lang === "hu") return item.old_statement_hu || item.old_statement;
  if (lang === "de") return item.old_statement_de || item.old_statement;
  if (lang === "en") return item.old_statement_en || item.old_statement;
  if (lang === "fr") return item.old_statement_fr || item.old_statement;

  return item.old_statement;
}

export function getTranslatedNewStatement(
  item: TranslatablePublicItem,
  lang: PublicLang
) {
  if (lang === "hu") return item.new_statement_hu || item.new_statement;
  if (lang === "de") return item.new_statement_de || item.new_statement;
  if (lang === "en") return item.new_statement_en || item.new_statement;
  if (lang === "fr") return item.new_statement_fr || item.new_statement;

  return item.new_statement;
}