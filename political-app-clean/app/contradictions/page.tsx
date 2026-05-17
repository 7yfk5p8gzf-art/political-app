"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PublicShell from "@/components/public/PublicShell";
import { supabase } from "@/lib/supabase";
import TrendingContradictions from "@/components/public/TrendingContradictions";

type Contradiction = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
  ai_summary: string | null;
  status: string | null;
  created_at: string | null;
  views: number | null;
};

export default function PublicContradictionsPage() {
  const [items, setItems] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contradictions")
      .select(
        "id, slug, politician, topic, old_statement, new_statement, old_date, new_date, ai_summary, status, created_at, views"
      )
      .eq("status", "published")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Public contradictions load error:", error);
      setItems([]);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) => {
      return [
        item.politician,
        item.topic,
        item.old_statement,
        item.new_statement,
        item.ai_summary,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [items, search]);

  return (
    <PublicShell title="Politikai ellentmondások">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <TrendingContradictions />
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Public contradictions
          </p>

          <h1 className="text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
            Politikai ellentmondások
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
            Régi és új állítások összehasonlítása, forrásokkal, dátumokkal és
            AI összegzéssel.
          </p>

          <div className="mt-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Keresés politikusra, témára vagy állításra..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            Betöltés...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            Nincs találat.
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredItems.map((item) => {
              const href = item.slug
                ? `/contradictions/${item.slug}`
                : `/contradictions/${item.id}`;

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="mb-4 flex flex-wrap gap-2">
                    {item.politician && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {item.politician}
                      </span>
                    )}

                    {item.topic && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.topic}
                      </span>
                    )}

                    {typeof item.views === "number" && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {item.views} megtekintés
                      </span>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Korábban
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white">
                        {item.old_statement || "Nincs régi állítás megadva."}
                      </p>
                      {item.old_date && (
                        <p className="mt-3 text-xs text-slate-500">
                          {item.old_date}
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Most
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white">
                        {item.new_statement || "Nincs új állítás megadva."}
                      </p>
                      {item.new_date && (
                        <p className="mt-3 text-xs text-slate-500">
                          {item.new_date}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.ai_summary && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.ai_summary}
                    </p>
                  )}

                  <div className="mt-5 flex justify-end">
                    <Link
                      href={href}
                      className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-200"
                    >
                      Részletek
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PublicShell>
  );
}