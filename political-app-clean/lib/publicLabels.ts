export type PublicLang = "hu" | "en" | "de" | "fr";

export const publicLabels = {
  hu: {
    trending: "Népszerű ellentmondások",
    timeline: "Idővonal",
    aiAnalysis: "AI elemzés",
    sources: "Források",
    related: "Hasonló esetek",

    communityVote: "Közösségi szavazás",
    contradictionQuestion: "Ez valódi ellentmondás?",
    yes: "Igen",
    no: "Nem",
    totalVotes: "Összes szavazat",

    old: "Korábban",
    new: "Most",
    oldSource: "Korábbi forrás",
    newSource: "Új forrás",

    views: "megtekintés",
    noSource: "Nincs forrás",
    openVideo: "Videó megnyitása",

    heroTitle:
      "Hasonlítsd össze a politikai állításokat. Találd meg az ellentmondásokat.",
    browseContradictions: "Ellentmondások böngészése",
    exploreTopics: "Témák böngészése",
    topContradictions: "Top ellentmondások",

    confidence: "Biztonság",
    severity: "Súlyosság",
    reviewStatus: "Ellenőrzési státusz",

    backToContradictions: "Vissza az ellentmondásokhoz",
    contradictionTitle: "Politikai ellentmondás",
    platformName: "Politikai Összehasonlító Platform",

heroDescription:
  "Nyilvános platform régi és új politikai állítások összehasonlítására, közösségi szavazással, AI elemzésekkel és forrásalapú ellentmondásokkal.",

aiInsightTitle: "Miért érdekes ez a platform?",

aiInsightSummary:
  "Az AI segít összekapcsolni a régi és új politikai állításokat, kiemelni a lehetséges ellentmondásokat, és gyorsabban megtalálni a fontos mintákat.",

spotlight: "Kiemelt eset",

viewAll: "Összes megtekintése →",
  },

  en: {
    trending: "Trending contradictions",
    timeline: "Timeline",
    aiAnalysis: "AI analysis",
    sources: "Sources",
    related: "Related contradictions",

    communityVote: "Community vote",
    contradictionQuestion: "Is this a contradiction?",
    yes: "Yes",
    no: "No",
    totalVotes: "Total votes",

    old: "Earlier",
    new: "Now",
    oldSource: "Earlier source",
    newSource: "New source",

    views: "views",
    noSource: "No source",
    openVideo: "Open video",

    heroTitle: "Compare political statements. Find contradictions.",
    browseContradictions: "Browse contradictions",
    exploreTopics: "Explore topics",
    topContradictions: "Top contradictions",

    confidence: "Confidence",
    severity: "Severity",
    reviewStatus: "Review status",

    backToContradictions: "Back to contradictions",
    contradictionTitle: "Political contradiction",
    platformName: "Political Comparison Platform",
heroDescription:
  "Public platform for comparing old and new political statements, community voting, AI summaries and source-based contradictions.",
aiInsightTitle: "Why is this platform interesting?",
aiInsightSummary:
  "AI helps connect old and new political statements, highlight possible contradictions, and find important patterns faster.",
spotlight: "Spotlight",
viewAll: "View all →",
  },

  de: {
    trending: "Beliebte Widersprüche",
    timeline: "Zeitlinie",
    aiAnalysis: "KI-Analyse",
    sources: "Quellen",
    related: "Ähnliche Fälle",

    communityVote: "Community-Abstimmung",
    contradictionQuestion: "Ist das ein Widerspruch?",
    yes: "Ja",
    no: "Nein",
    totalVotes: "Stimmen gesamt",

    old: "Früher",
    new: "Jetzt",
    oldSource: "Frühere Quelle",
    newSource: "Neue Quelle",

    views: "Aufrufe",
    noSource: "Keine Quelle",
    openVideo: "Video öffnen",

    heroTitle: "Politische Aussagen vergleichen. Widersprüche finden.",
    browseContradictions: "Widersprüche ansehen",
    exploreTopics: "Themen entdecken",
    topContradictions: "Top-Widersprüche",

    confidence: "Sicherheit",
    severity: "Schweregrad",
    reviewStatus: "Prüfstatus",

    backToContradictions: "Zurück zu den Widersprüchen",
    contradictionTitle: "Politischer Widerspruch",
    platformName: "Politische Vergleichsplattform",

heroDescription:
  "Öffentliche Plattform zum Vergleichen alter und neuer politischer Aussagen mit Community-Abstimmungen, KI-Analysen und quellenbasierten Widersprüchen.",

aiInsightTitle: "Warum ist diese Plattform interessant?",

aiInsightSummary:
  "Die KI hilft dabei, alte und neue politische Aussagen zu verbinden, mögliche Widersprüche hervorzuheben und wichtige Muster schneller zu erkennen.",

spotlight: "Im Fokus",

viewAll: "Alle anzeigen →",
  },

  fr: {
    trending: "Contradictions populaires",
    timeline: "Chronologie",
    aiAnalysis: "Analyse IA",
    sources: "Sources",
    related: "Cas similaires",

    communityVote: "Vote de la communauté",
    contradictionQuestion: "Est-ce une contradiction ?",
    yes: "Oui",
    no: "Non",
    totalVotes: "Votes au total",

    old: "Avant",
    new: "Maintenant",
    oldSource: "Source précédente",
    newSource: "Nouvelle source",

    views: "vues",
    noSource: "Aucune source",
    openVideo: "Ouvrir la vidéo",

    heroTitle:
      "Comparez les déclarations politiques. Trouvez les contradictions.",
    browseContradictions: "Parcourir les contradictions",
    exploreTopics: "Explorer les sujets",
    topContradictions: "Principales contradictions",

    confidence: "Confiance",
    severity: "Gravité",
    reviewStatus: "Statut de révision",

    backToContradictions: "Retour aux contradictions",
    contradictionTitle: "Contradiction politique",
    platformName: "Plateforme de comparaison politique",

heroDescription:
  "Plateforme publique pour comparer les anciennes et nouvelles déclarations politiques avec votes communautaires, analyses IA et contradictions basées sur des sources.",

aiInsightTitle: "Pourquoi cette plateforme est-elle intéressante ?",

aiInsightSummary:
  "L'IA aide à relier les anciennes et nouvelles déclarations politiques, à mettre en évidence les contradictions possibles et à trouver plus rapidement les tendances importantes.",

spotlight: "À la une",

viewAll: "Voir tout →",
  },
} as const;