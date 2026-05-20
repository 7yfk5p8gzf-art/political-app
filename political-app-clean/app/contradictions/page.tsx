"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PublicShell from "@/components/public/PublicShell";
import { supabase } from "@/lib/supabase";
import TrendingContradictions from "@/components/public/TrendingContradictions";
import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Lang = "hu" | "de" | "en" | "fr";

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
  ai_summary_hu: string | null;
  ai_summary_de: string | null;
  ai_summary_en: string | null;
  ai_summary_fr: string | null;
  status: string | null;
  created_at: string | null;
  views: number | null;
};

function getSummary(item: Contradiction, lang: Lang) {
  if (lang === "hu") return item.ai_summary_hu || item.ai_summary;
  if (lang === "de") return item.ai_summary_de || item.ai_summary;
  if (lang === "en") return item.ai_summary_en || item.ai_summary;
  if (lang === "fr") return item.ai_summary_fr || item.ai_summary;

  return item.ai_summary;
}

export default function PublicContradictionsPage() {
  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

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
        "id, slug, politician, topic, old_statement, new_statement, old_date, new_date, ai_summary, ai_summary_hu, ai_summary_de, ai_summary_en, ai_summary_fr, status, created_at, views"
      )
      .eq("status", "published")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Public contradictions load error:", error);
      setItems([]);
    } else {
      setItems((data || []) as Contradiction[]);
    }

    setLoading(false);
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) => {
      const summary = getSummary(item, lang);

      return [
        item.politician,
        item.topic,
        item.old_statement,
        item.new_statement,
        summary,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [items, search, lang]);

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <TrendingContradictions />

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            {labels.contradictions}
          </p>

          <h1 className="text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
            {labels.contradictions}
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
            {labels.contradictionsDescription}
          </p>

          <div className="mt-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {labels.loading}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {labels.noResults}
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredItems.map((item) => {
              const href = item.slug
                ? `/contradictions/${item.slug}`
                : `/contradictions/${item.id}`;

              const summary = getSummary(item, lang);

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
                        {item.views} {labels.views}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {labels.old}
                      </p>

                      <p className="text-sm text-slate-900 dark:text-white">
                        {item.old_statement || labels.noOldStatement}
                      </p>

                      {item.old_date && (
                        <p className="mt-3 text-xs text-slate-500">
                          {item.old_date}
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {labels.new}
                      </p>

                      <p className="text-sm text-slate-900 dark:text-white">
                        {item.new_statement || labels.noNewStatement}
                      </p>

                      {item.new_date && (
                        <p className="mt-3 text-xs text-slate-500">
                          {item.new_date}
                        </p>
                      )}
                    </div>
                  </div>

                  {summary && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {summary}
                    </p>
                  )}

                  <div className="mt-5 flex justify-end">
                    <Link
                      href={href}
                      className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-200"
                    >
                      {labels.details}
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