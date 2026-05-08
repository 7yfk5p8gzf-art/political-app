export type Lang = "hu" | "de" | "en" | "fr";

export const supportedLangs: Lang[] = ["hu", "de", "en", "fr"];

export function detectBrowserLang(): Lang {
  if (typeof window === "undefined") return "hu";

  const saved = localStorage.getItem("app_lang") as Lang | null;
  if (saved && supportedLangs.includes(saved)) return saved;

  const browserLang = navigator.language.slice(0, 2).toLowerCase();

  if (supportedLangs.includes(browserLang as Lang)) {
    return browserLang as Lang;
  }

  return "hu";
}

export function saveLang(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem("app_lang", lang);
}

export const t = {
  hu: {
    login: "Belépés",
    logout: "Kilépés",
    contradictions: "Ellentmondások",
    latest: "Legfrissebb ellentmondások",
    top: "Legnagyobb ellentmondások",
    open: "Megnyitás",
    search: "Keresés politikus, téma vagy állítás szerint...",
    old: "RÉGEN",
    now: "MOST",
    votes: "szavazat",
    copyLink: "Link másolása",
aiAnalysis: "AI elemzés",
sources: "Források",
isContradiction: "Ez szerinted ellentmondás?",
    logoutButton: "Kilépés",
menuContradictions: "Ellentmondások",
    heroTitle: "Ki mit mondott régen — és mit mond most?",
heroLead:
  "Forrásalapú politikai összehasonlítások dátumokkal, AI-elemzéssel, videókkal és közösségi szavazással.",
publicBeta: "Public beta",
publishedCases: "publikált ügy",
politicians: "politikus",
topics: "téma",
latestShort: "Legfrissebbek",
  },

  de: {
    login: "Anmelden",
    logout: "Abmelden",
    contradictions: "Widersprüche",
    latest: "Neueste Widersprüche",
    top: "Größte Widersprüche",
    open: "Öffnen",
    search: "Suche nach Politiker, Thema oder Aussage...",
    old: "FRÜHER",
    now: "JETZT",
    votes: "Stimmen",
    copyLink: "Link kopieren",
aiAnalysis: "KI-Analyse",
sources: "Quellen",
isContradiction: "Ist das deiner Meinung nach ein Widerspruch?",
    logoutButton: "Abmelden",
menuContradictions: "Widersprüche",
    heroTitle: "Wer hat früher etwas anderes gesagt — und was sagt er heute?",
heroLead:
  "Quellenbasierte politische Vergleiche mit Daten, KI-Analyse, Videos und Community-Abstimmungen.",
publicBeta: "Public beta",
publishedCases: "veröffentlichte Fälle",
politicians: "Politiker",
topics: "Themen",
latestShort: "Neueste",
  },

  en: {
    login: "Login",
    logout: "Logout",
    contradictions: "Contradictions",
    latest: "Latest contradictions",
    top: "Top contradictions",
    open: "Open",
    search: "Search by politician, topic or statement...",
    old: "THEN",
    now: "NOW",
    votes: "votes",
    copyLink: "Copy link",
aiAnalysis: "AI analysis",
sources: "Sources",
isContradiction: "Do you think this is a contradiction?",
    logoutButton: "Logout",
menuContradictions: "Contradictions",
    heroTitle: "Who said something different before — and what do they say now?",
heroLead:
  "Source-based political comparisons with dates, AI analysis, videos and community voting.",
publicBeta: "Public beta",
publishedCases: "published cases",
politicians: "politicians",
topics: "topics",
latestShort: "Latest",
  },

  fr: {
    login: "Connexion",
    logout: "Déconnexion",
    contradictions: "Contradictions",
    latest: "Dernières contradictions",
    top: "Plus grandes contradictions",
    open: "Ouvrir",
    search: "Rechercher par politicien, sujet ou déclaration...",
    old: "AVANT",
    now: "MAINTENANT",
    votes: "votes",
    copyLink: "Copier le lien",
aiAnalysis: "Analyse IA",
sources: "Sources",
isContradiction: "Pensez-vous que c'est une contradiction ?",
    logoutButton: "Déconnexion",
menuContradictions: "Contradictions",
    heroTitle: "Qui disait autre chose avant — et que dit-il maintenant ?",
heroLead:
  "Comparaisons politiques basées sur des sources avec dates, analyses IA, vidéos et votes communautaires.",
publicBeta: "Public beta",
publishedCases: "cas publiés",
politicians: "politiciens",
topics: "sujets",
latestShort: "Derniers",
  },
};