import {
  COUNTRY_SOURCES,
  INTERNATIONAL_SOURCES,
} from "@/lib/ai-search/sourceConfig";

export const ALLOWED_DOMAINS = Array.from(
  new Set([
    ...Object.values(COUNTRY_SOURCES).flatMap((country) => country.articles),
    ...INTERNATIONAL_SOURCES,
    "youtube.com",
    "youtu.be",
  ])
);