import { supabase } from "../lib/supabase";

import PublicShell from "@/components/public/PublicShell";
import TrendingContradictions from "@/components/public/TrendingContradictions";
import HomeHero from "@/components/public/HomeHero";
import HomeTopContradictions from "@/components/public/HomeTopContradictions";
import HomeSpotlight from "@/components/public/HomeSpotlight";
import PublicPageShell from "@/components/layout/PublicPageShell";

type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
  views: number | null;
};

export default async function HomePage() {
  const { data } = await supabase
    .from("contradictions")
    .select(`
      id,
      politician,
      topic,
      old_statement,
      new_statement,
      politician,

  topic,
  topic_hu,
  topic_de,
  topic_en,
  topic_fr,

  old_statement,
  old_statement_hu,
  old_statement_de,
  old_statement_en,
  old_statement_fr,

  new_statement,
  new_statement_hu,
  new_statement_de,
  new_statement_en,
  new_statement_fr,

  ai_summary,
  ai_summary_hu,
  ai_summary_de,
  ai_summary_en,
  ai_summary_fr,
      views
    `)
    .order("views", { ascending: false })
    .limit(5);

  const topItems = (data || []) as Contradiction[];
  const spotlight = topItems[0];

  return (
    <PublicPageShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <HomeHero />

        <div className="mt-10">
          <TrendingContradictions />
        </div>

        {spotlight && <HomeSpotlight item={spotlight} />}

        <HomeTopContradictions items={topItems} />
      </section>
        </PublicPageShell>
  );
}