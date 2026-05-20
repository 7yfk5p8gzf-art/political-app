"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ContradictionCard from "@/components/public/ContradictionCard";
import PublicShell from "@/components/public/PublicShell";
import TrendingContradictions from "@/components/public/TrendingContradictions";

import { supabase } from "@/lib/supabase";
import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Lang = "hu" | "de" | "en" | "fr";

type Contradiction = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  topic_hu: string | null;
  topic_de: string | null;
  topic_en: string | null;
  topic_fr: string | null;
  old_statement: string | null;
  new_statement: string | null;
};

function getTopic(item: Contradiction, lang: Lang) {
  if (lang === "hu") return item.topic_hu || item.topic;
  if (lang === "de") return item.topic_de || item.topic;
  if (lang === "en") return item.topic_en || item.topic;
  if (lang === "fr") return item.topic_fr || item.topic;

  return item.topic;
}

export default function TopicDetailPage() {
  const params = useParams();
  const rawTopic = String(params.topic || "");
  const decodedTopic = decodeURIComponent(rawTopic);

  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

  const [items, setItems] = useState<Contradiction[]>([]);

  useEffect(() => {
    loadItems();
  }, [decodedTopic]);

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
        old_statement,
        new_statement
      `)
      .or(
        `topic.eq.${decodedTopic},topic_hu.eq.${decodedTopic},topic_de.eq.${decodedTopic},topic_en.eq.${decodedTopic},topic_fr.eq.${decodedTopic}`
      );

    setItems((data || []) as Contradiction[]);
  }

  const title = items[0] ? getTopic(items[0], lang) || decodedTopic : decodedTopic;

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <TrendingContradictions />

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            {labels.topic}
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">
            {title}
          </h1>

          <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">
            {labels.topicDetailDescription}
          </p>
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <ContradictionCard
              key={item.id}
              id={item.slug || item.id}
              politician={item.politician}
              topic={getTopic(item, lang)}
              oldStatement={item.old_statement}
              newStatement={item.new_statement}
            />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}