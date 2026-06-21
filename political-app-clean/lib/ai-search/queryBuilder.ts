export function buildVideoQueries({
  effectiveQuery,
  topicTerms,
  country,
}: {
  effectiveQuery: string;
  topicTerms: string;
  country?: string | null;
}) {
  if (country === "DE") {
    return [
      `${effectiveQuery} ${topicTerms} interview`,
      `${effectiveQuery} ${topicTerms} rede`,
      `${effectiveQuery} ${topicTerms} pressekonferenz`,
      `${effectiveQuery} ${topicTerms} debatte`,
      `${effectiveQuery} ${topicTerms} migration video`,
      `${effectiveQuery} ${topicTerms} asyl video`,
      `${effectiveQuery} ${topicTerms} flüchtlinge video`,
      `${effectiveQuery} ${topicTerms} youtube`,
      `${effectiveQuery} ${topicTerms} site:youtube.com`,
      `${effectiveQuery} ${topicTerms} site:zdf.de video`,
      `${effectiveQuery} ${topicTerms} site:phoenix.de`,
      `${effectiveQuery} ${topicTerms} site:tagesschau.de video`,
    ];
  }
if (country === "FR") {
  return [
    `${effectiveQuery} ${topicTerms} interview`,
    `${effectiveQuery} ${topicTerms} discours`,
    `${effectiveQuery} ${topicTerms} débat`,
    `${effectiveQuery} ${topicTerms} conférence de presse`,
    `${effectiveQuery} ${topicTerms} vidéo`,
    `${effectiveQuery} ${topicTerms} youtube`,
    `${effectiveQuery} ${topicTerms} site:youtube.com`,
    `${effectiveQuery} ${topicTerms} site:france24.com video`,
    `${effectiveQuery} ${topicTerms} site:bfmtv.com video`,
    `${effectiveQuery} ${topicTerms} site:francetvinfo.fr video`,
  ];
}
  return [
    `${effectiveQuery} ${topicTerms} interview`,
    `${effectiveQuery} ${topicTerms} interjú`,
    `${effectiveQuery} ${topicTerms} speech`,
    `${effectiveQuery} ${topicTerms} beszéd`,
    `${effectiveQuery} ${topicTerms} debate`,
    `${effectiveQuery} ${topicTerms} vita`,
    `${effectiveQuery} ${topicTerms} video`,
    `${effectiveQuery} ${topicTerms} youtube`,
    `${effectiveQuery} ${topicTerms} site:youtube.com`,
    `${effectiveQuery} ${topicTerms} ATV`,
    `${effectiveQuery} ${topicTerms} Partizán`,
    `${effectiveQuery} ${topicTerms} Hír TV`,
  ];
}