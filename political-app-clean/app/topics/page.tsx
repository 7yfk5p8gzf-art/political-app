"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import PublicShell from "@/components/public/PublicShell";
import TrendingContradictions from "@/components/public/TrendingContradictions";

import { supabase } from "@/lib/supabase";
import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Lang = "hu" | "de" | "en" | "fr";

type TopicRow = {
  topic: string | null;

  topic_hu?: string | null;
  topic_de?: string | null;
  topic_en?: string | null;
  topic_fr?: string | null;
};

function getTopic(item: TopicRow, lang: Lang) {
  if (lang === "hu") return item.topic_hu || item.topic;
  if (lang === "de") return item.topic_de || item.topic;
  if (lang === "en") return item.topic_en || item.topic;
  if (lang === "fr") return item.topic_fr || item.topic;

  return item.topic;
}

export default function TopicsPage() {
  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    loadTopics();
  }, [lang]);

  async function loadTopics() {
    const { data } = await supabase
      .from("contradictions")
      .select(`
        topic,
        topic_hu,
        topic_de,
        topic_en,
        topic_fr
      `)
      .not("topic", "is", null);

    const mapped = (data || [])
      .map((item) => getTopic(item as TopicRow, lang))
      .filter(Boolean);

    const uniqueTopics = Array.from(new Set(mapped));

    setTopics(uniqueTopics as string[]);
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <TrendingContradictions />

        <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            {labels.browse}
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">
            {labels.topics}
          </h1>

          <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">
            {labels.topicsDescription}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic}
              href={`/topics/${encodeURIComponent(String(topic))}`}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-400"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {labels.topic}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-950 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {topic}
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