"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";
import {
  getTranslatedSummary,
  getTranslatedTopic,
  type PublicLang,
} from "@/lib/publicTranslations";

type Item = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  topic_hu?: string | null;
  topic_de?: string | null;
  topic_en?: string | null;
  topic_fr?: string | null;
  ai_summary: string | null;
  ai_summary_hu?: string | null;
  ai_summary_de?: string | null;
  ai_summary_en?: string | null;
  ai_summary_fr?: string | null;
  views: number | null;
};

export default function TrendingContradictions() {
  const lang = usePublicLanguage() as PublicLang;
  const labels = getPublicLabels(lang);

  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const { data } = await supabase
      .from("contradictions")
      .select(`
        id,
        slug,
        politician,
        topic,
        topic_hu,
        topic_de,
        topic_en,
        topic_fr,
        ai_summary,
        ai_summary_hu,
        ai_summary_de,
        ai_summary_en,
        ai_summary_fr,
        views
      `)
      .order("views", { ascending: false })
      .limit(3);

    setItems((data || []) as Item[]);
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {labels.trendingTitle}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {labels.trendingTitle}
          </h2>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item, index) => {
          const summary = getTranslatedSummary(item, lang);
          const topic = getTranslatedTopic(item, lang);

          return (
            <Link
              key={item.id}
              href={`/contradictions/${item.slug || item.id}`}
              className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                  #{index + 1}
                </span>

                <span className="text-xs text-slate-500">
                  {item.views || 0} {labels.views}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.politician && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {item.politician}
                  </span>
                )}

                {topic && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {topic}
                  </span>
                )}
              </div>

              <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
                {summary || labels.noAiSummary}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}