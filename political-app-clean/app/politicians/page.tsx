import { supabase } from "../../lib/supabase";
import Link from "next/link";
import PublicShell from "@/components/public/PublicShell";
import TrendingContradictions from "@/components/public/TrendingContradictions";

type PoliticianRow = {
  politician: string | null;
};

export default async function PoliticiansPage() {
  const { data } = await supabase
    .from("contradictions")
    .select("politician")
    .not("politician", "is", null);

  const politicians = Array.from(
    new Set(
      (data || [])
        .map((item: PoliticianRow) => item.politician)
        .filter(Boolean)
    )
  );

  return (
  <PublicShell title="Politicians">
    <section className="mx-auto max-w-6xl px-4 py-10">

      <TrendingContradictions />

      <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Browse
        </p>

        <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">
          Politicians
        </h1>

        <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">
          Böngéssz politikusok szerint és fedezd fel az állításaik közötti változásokat.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {politicians.map((politician) => (
          <Link
            key={politician}
            href={`/politicians/${encodeURIComponent(String(politician))}`}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-400"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Politician
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {politician}
                </h2>
              </div>

              <div className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                →
              </div>
            </div>
          </Link>
        ))}
      </div>

    </section>
  </PublicShell>
);
}