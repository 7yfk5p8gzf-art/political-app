import ContradictionCard from "@/components/public/ContradictionCard";
import { supabase } from "../lib/supabase";

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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
          Political Comparison Platform
        </p>

        <h1 className="mt-5 max-w-4xl text-6xl font-black leading-tight">
          Compare political statements. Find contradictions.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-neutral-400">
          Public platform for comparing old and new political statements,
          community voting, AI summaries and source-based contradictions.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="/contradictions"
            className="rounded-2xl bg-white px-6 py-4 font-bold text-black"
          >
            Browse contradictions
          </a>

          <a
            href="/topics"
            className="rounded-2xl border border-white/20 px-6 py-4 font-bold"
          >
            Explore topics
          </a>
        </div>
      </section>
      {spotlight && (
  <section className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8">
    <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
      Spotlight
    </p>

    <h2 className="mt-3 text-3xl font-bold">
      {spotlight.politician} · {spotlight.topic}
    </h2>

    <p className="mt-3 text-sm text-neutral-400">
      {spotlight.views || 0} views
    </p>

    <div className="mt-6">
      <ContradictionCard
        id={spotlight.id}
        politician={spotlight.politician}
        topic={spotlight.topic}
        oldStatement={spotlight.old_statement}
        newStatement={spotlight.new_statement}
      />
    </div>
  </section>
)}

      <section className="mt-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            Top contradictions
          </h2>

          <a
            href="/contradictions"
            className="text-sm text-neutral-400 hover:text-white"
          >
            View all →
          </a>
        </div>

        <div className="space-y-6">
          {topItems.map((item) => (
            <div key={item.id}>
              <div className="mb-2 text-sm text-neutral-500">
                {item.views || 0} views
              </div>

              <ContradictionCard
                id={item.id}
                politician={item.politician}
                topic={item.topic}
                oldStatement={item.old_statement}
                newStatement={item.new_statement}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}