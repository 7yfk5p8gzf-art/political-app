import ContradictionCard from "@/components/public/ContradictionCard";
import { supabase } from "../../../../lib/supabase";
import PublicShell from "@/components/public/PublicShell";
import TrendingContradictions from "@/components/public/TrendingContradictions";

type PageProps = {
  params: Promise<{
    topic: string;
  }>;
};

type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
};

export default async function TopicDetailPage({ params }: PageProps) {
  const { topic } = await params;

  const decodedTopic = decodeURIComponent(topic);

  const { data } = await supabase
    .from("contradictions")
    .select(`
      id,
      politician,
      topic,
      old_statement,
      new_statement
    `)
    .eq("topic", decodedTopic);

  const items = (data || []) as Contradiction[];

  return (
  <PublicShell title={decodedTopic}>
    <section className="mx-auto max-w-6xl px-4 py-10">

      <TrendingContradictions />

      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Topic
        </p>

        <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">
          {decodedTopic}
        </h1>

        <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">
          Politikai ellentmondások és állításváltozások ehhez a témához kapcsolódva.
        </p>
      </div>

      <div className="space-y-6">
        {items.map((item) => (
          <ContradictionCard
            key={item.id}
            id={item.id}
            politician={item.politician}
            topic={item.topic}
            oldStatement={item.old_statement}
            newStatement={item.new_statement}
          />
        ))}
      </div>

    </section>
  </PublicShell>
);
}