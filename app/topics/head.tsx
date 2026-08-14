import { siteImageUrl, siteUrl } from '@/lib/siteConfig';

export default function Head() {
  return (
    <>
      <title>Political Topics | Political Compare</title>

      <meta
        name="description"
        content="Explore political topics, debates and contradictions across politicians, countries and public statements."
      />

      <meta
        property="og:title"
        content="Political Topics | Political Compare"
      />

      <meta
        property="og:description"
        content="Explore political topics, debates and contradictions across politicians, countries and public statements."
      />

      <meta
        property="og:image"
        content={siteImageUrl}
      />

      <meta
        property="og:url"
        content={`${siteUrl}/topics`}
      />

      <meta name="twitter:card" content="summary_large_image" />

      <meta
        name="twitter:title"
        content="Political Topics | Political Compare"
      />

      <meta
        name="twitter:description"
        content="Explore political topics, debates and contradictions across politicians, countries and public statements."
      />

      <meta
        name="twitter:image"
        content={siteImageUrl}
      />
    </>
  );
}
