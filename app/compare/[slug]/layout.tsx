import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let title = "Politikai összehasonlító";
  let description = "Régi és új nyilatkozatok összehasonlítása források alapján.";

  if (supabaseUrl && supabaseKey) {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/contradictions?id=eq.${slug}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();
    const item = data?.[0];

    if (item) {
      title = `${item.politician || "Ismeretlen"}: régen mást mondott, mint most?`;
      description =
        item.ai_summary ||
        `${item.old_statement || ""} / ${item.new_statement || ""}`;
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const ogImageUrl = `${baseUrl}/api/og/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function CompareSlugLayout({ children }: Props) {
  return children;
}
