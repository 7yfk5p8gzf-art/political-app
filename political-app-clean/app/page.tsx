import ContradictionCard from "@/components/public/ContradictionCard";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import PublicShell from "@/components/public/PublicShell";
import TrendingContradictions from "@/components/public/TrendingContradictions";

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
  <PublicShell title="Political Comparison Platform">
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Political Comparison Platform
        </p>

        <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-6xl">
          Compare political statements. Find contradictions.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Public platform for comparing old and new political statements,
          community voting, AI summaries and source-based contradictions.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/contradictions"
            className="rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white transition hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-200"
          >
            Browse contradictions
          </Link>

          <Link
            href="/topics"
            className="rounded-2xl border border-slate-200 px-6 py-4 font-bold text-slate-900 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-white dark:hover:border-blue-400 dark:hover:text-blue-400"
          >
            Explore topics
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <TrendingContradictions />
      </div>

      {spotlight && (
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Spotlight
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
            {spotlight.politician} · {spotlight.topic}
          </h2>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
            Top contradictions
          </h2>

          <Link
            href="/contradictions"
            className="text-sm font-semibold text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            View all →
          </Link>
        </div>

        <div className="space-y-6">
          {topItems.map((item) => (
            <div key={item.id}>
              <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">
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
    </section>
  </PublicShell>
);
}