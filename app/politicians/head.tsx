import { siteImageUrl, siteUrl } from '@/lib/siteConfig';

export default function Head() {
  return (
    <>
      <title>Politicians | Political Compare</title>

      <meta
        name="description"
        content="Explore politicians, political contradictions, public statements and community voting across multiple countries and topics."
      />

      <meta
        property="og:title"
        content="Politicians | Political Compare"
      />

      <meta
        property="og:description"
        content="Explore politicians, political contradictions, public statements and community voting across multiple countries and topics."
      />

      <meta
        property="og:image"
        content={siteImageUrl}
      />

      <meta
        property="og:url"
        content={`${siteUrl}/politicians`}
      />

      <meta name="twitter:card" content="summary_large_image" />

      <meta
        name="twitter:title"
        content="Politicians | Political Compare"
      />

      <meta
        name="twitter:description"
        content="Explore politicians, political contradictions, public statements and community voting across multiple countries and topics."
      />

      <meta
        name="twitter:image"
        content={siteImageUrl}
      />
    </>
  );
}
