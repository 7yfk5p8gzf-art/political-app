const COUNTRY_VIDEO_SOURCES: Record<string, string[]> = {
  HU: ["youtube.com", "hirado.hu", "hirtv.hu", "atv.hu", "partizanmedia.hu"],
  DE: ["youtube.com", "zdf.de", "tagesschau.de", "phoenix.de", "n-tv.de", "welt.de"],
  AT: ["youtube.com", "orf.at", "derstandard.at"],
  IT: ["youtube.com", "la7.it", "rainews.it", "mediaset.it"],
  FR: ["youtube.com", "france24.com", "bfmtv.com", "francetvinfo.fr"],
  ES: ["youtube.com", "rtve.es", "elpais.com", "elmundo.es"],
  NL: ["youtube.com", "nos.nl", "nu.nl"],
  PL: ["youtube.com", "tvn24.pl", "polsatnews.pl"],
  US: ["youtube.com", "c-span.org", "foxnews.com", "cnn.com", "nbcnews.com"],
};
export function buildVideoQueries({
  effectiveQuery,
  topicTerms,
  country,
}: {
  effectiveQuery: string;
  topicTerms: string;
  country?: string | null;
}) {
  const common = [
  `${effectiveQuery} ${topicTerms} site:youtube.com/watch`,
  `${effectiveQuery} ${topicTerms} site:youtube.com`,
  `${effectiveQuery} ${topicTerms} youtube interview`,
  `${effectiveQuery} ${topicTerms} youtube speech`,
  `${effectiveQuery} ${topicTerms} youtube press conference`,
];
  const countryKey = (country || "").toUpperCase();

const videoSources =
  COUNTRY_VIDEO_SOURCES[countryKey] || ["youtube.com"];

const countrySourceQueries = videoSources.map(
  (domain) =>
    `${effectiveQuery} ${topicTerms} site:${domain} video`
);

  if (country === "DE") {
    return [
      `${effectiveQuery} ${topicTerms} interview`,
      `${effectiveQuery} ${topicTerms} rede`,
      `${effectiveQuery} ${topicTerms} pressekonferenz`,
      `${effectiveQuery} ${topicTerms} debatte`,
      `${effectiveQuery} ${topicTerms} phoenix`,
      `${effectiveQuery} ${topicTerms} tagesschau video`,
      `${effectiveQuery} ${topicTerms} zdf video`,
      `${effectiveQuery} ${topicTerms} n-tv video`,
      `${effectiveQuery} ${topicTerms} site:youtube.com`,
      `${effectiveQuery} ${topicTerms} site:zdf.de video`,
      `${effectiveQuery} ${topicTerms} site:tagesschau.de video`,
      `${effectiveQuery} ${topicTerms} site:n-tv.de video`,
      `${effectiveQuery} ${topicTerms} bundestag`,
      `${effectiveQuery} ${topicTerms} zdf video`,
`${effectiveQuery} ${topicTerms} zdf mediathek`,
`${effectiveQuery} ${topicTerms} tagesschau video`,
`${effectiveQuery} ${topicTerms} ard video`,
`${effectiveQuery} ${topicTerms} ard mediathek`,
`${effectiveQuery} ${topicTerms} phoenix video`,
`${effectiveQuery} ${topicTerms} n-tv video`,
`${effectiveQuery} ${topicTerms} welt video`,
`${effectiveQuery} ${topicTerms} youtube`,

    ];
  }

  if (country === "FR") {
    return [
      `${effectiveQuery} ${topicTerms} interview`,
      `${effectiveQuery} ${topicTerms} discours`,
      `${effectiveQuery} ${topicTerms} débat`,
      `${effectiveQuery} ${topicTerms} conférence de presse`,
      `${effectiveQuery} ${topicTerms} vidéo`,
      `${effectiveQuery} ${topicTerms} bfmtv`,
      `${effectiveQuery} ${topicTerms} franceinfo`,
      `${effectiveQuery} ${topicTerms} france24`,
      `${effectiveQuery} ${topicTerms} site:youtube.com`,
      `${effectiveQuery} ${topicTerms} site:bfmtv.com video`,
      `${effectiveQuery} ${topicTerms} site:franceinfo.fr video`,
      `${effectiveQuery} ${topicTerms} site:france24.com video`,
    ];
  }

  if (country === "IT") {
  return [
    `${effectiveQuery} ${topicTerms} intervista`,
    `${effectiveQuery} ${topicTerms} discorso`,
    `${effectiveQuery} ${topicTerms} dibattito`,
    `${effectiveQuery} ${topicTerms} conferenza stampa`,
    `${effectiveQuery} ${topicTerms} video`,
    `${effectiveQuery} ${topicTerms} migranti video`,
    `${effectiveQuery} ${topicTerms} immigrazione video`,
    `${effectiveQuery} ${topicTerms} rai`,
    `${effectiveQuery} ${topicTerms} rainews`,
    `${effectiveQuery} ${topicTerms} mediaset`,
    `${effectiveQuery} ${topicTerms} tgcom24`,
    `${effectiveQuery} ${topicTerms} la7`,
    `${effectiveQuery} ${topicTerms} il giornale video`,
    `${effectiveQuery} ${topicTerms} site:youtube.com`,
    `${effectiveQuery} ${topicTerms} site:rainews.it video`,
    `${effectiveQuery} ${topicTerms} site:tgcom24.mediaset.it video`,
    `${effectiveQuery} ${topicTerms} site:ilgiornale.it video`,
    `${effectiveQuery} ${topicTerms} site:la7.it video`,
    `${effectiveQuery} ${topicTerms} intervista`,
`${effectiveQuery} ${topicTerms} video`,
`${effectiveQuery} ${topicTerms} youtube`,
`${effectiveQuery} ${topicTerms} tgcom24 video`,
`${effectiveQuery} ${topicTerms} rainews video`,
`${effectiveQuery} ${topicTerms} la7 video`,
`${effectiveQuery} ${topicTerms} mediaset video`,
`${effectiveQuery} ${topicTerms} conferenza stampa`,
`${effectiveQuery} ${topicTerms} dibattito`,
`${effectiveQuery} ${topicTerms} discorso`,
`${effectiveQuery} ${topicTerms} intervista tv`,
`${effectiveQuery} ${topicTerms} site:youtube.com`,
  ];
}

  if (country === "UK") {
    return [
      `${effectiveQuery} ${topicTerms} interview`,
      `${effectiveQuery} ${topicTerms} speech`,
      `${effectiveQuery} ${topicTerms} debate`,
      `${effectiveQuery} ${topicTerms} press conference`,
      `${effectiveQuery} ${topicTerms} bbc`,
      `${effectiveQuery} ${topicTerms} sky news`,
      `${effectiveQuery} ${topicTerms} site:youtube.com`,
    ];
  }

  if (country === "HU") {
    return [
      `${effectiveQuery} ${topicTerms} interjú`,
      `${effectiveQuery} ${topicTerms} beszéd`,
      `${effectiveQuery} ${topicTerms} vita`,
      `${effectiveQuery} ${topicTerms} sajtótájékoztató`,
      `${effectiveQuery} ${topicTerms} videó`,
      `${effectiveQuery} ${topicTerms} ATV`,
      `${effectiveQuery} ${topicTerms} Partizán`,
      `${effectiveQuery} ${topicTerms} Hír TV`,
      `${effectiveQuery} ${topicTerms} site:youtube.com`,
    ];
  }

  return [
  ...common,
  ...countrySourceQueries,
];
}