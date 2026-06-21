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
    `${effectiveQuery} ${topicTerms} interview`,
    `${effectiveQuery} ${topicTerms} debate`,
    `${effectiveQuery} ${topicTerms} speech`,
    `${effectiveQuery} ${topicTerms} press conference`,
    `${effectiveQuery} ${topicTerms} video`,
    `${effectiveQuery} ${topicTerms} youtube`,
    `${effectiveQuery} ${topicTerms} site:youtube.com`,
  ];

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

  return common;
}