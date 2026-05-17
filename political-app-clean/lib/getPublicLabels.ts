import { publicLabels, type PublicLang } from "./publicLabels";

export function getPublicLabels(lang?: string) {
  const normalized = (lang || "en").toLowerCase();

  if (normalized.startsWith("hu")) {
    return publicLabels.hu;
  }

  if (normalized.startsWith("de")) {
    return publicLabels.de;
  }

  if (normalized.startsWith("fr")) {
    return publicLabels.fr;
  }

  return publicLabels.en;
}

export function detectBrowserLanguage(): PublicLang {
  if (typeof window === "undefined") {
    return "en";
  }

  const lang = navigator.language.toLowerCase();

  if (lang.startsWith("hu")) {
    return "hu";
  }

  if (lang.startsWith("de")) {
    return "de";
  }

  if (lang.startsWith("fr")) {
    return "fr";
  }

  return "en";
}