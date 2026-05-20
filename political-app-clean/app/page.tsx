import { supabase } from "../lib/supabase";

import PublicShell from "@/components/public/PublicShell";
import TrendingContradictions from "@/components/public/TrendingContradictions";
import HomeHero from "@/components/public/HomeHero";
import HomeTopContradictions from "@/components/public/HomeTopContradictions";
import HomeSpotlight from "@/components/public/HomeSpotlight";

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
      views
    `)
    .order("views", { ascending: false })
    .limit(5);

  const topItems = (data || []) as Contradiction[];
  const spotlight = topItems[0];

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <HomeHero />

        <div className="mt-10">
          <TrendingContradictions />
        </div>

        {spotlight && <HomeSpotlight item={spotlight} />}

        <HomeTopContradictions items={topItems} />
      </section>
    </PublicShell>
  );
}