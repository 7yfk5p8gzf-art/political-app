"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ContradictionCard from "@/components/public/ContradictionCard";
import PublicShell from "@/components/public/PublicShell";
import TrendingContradictions from "@/components/public/TrendingContradictions";

import { supabase } from "@/lib/supabase";
import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";
import {
  getTranslatedNewStatement,
  getTranslatedOldStatement,
  getTranslatedTopic,
  type PublicLang,
} from "@/lib/publicTranslations";

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
  old_statement_hu: string | null;
  old_statement_de: string | null;
  old_statement_en: string | null;
  old_statement_fr: string | null;

  new_statement: string | null;
  new_statement_hu: string | null;
  new_statement_de: string | null;
  new_statement_en: string | null;
  new_statement_fr: string | null;
};

export default function PoliticianDetailPage() {
  const params = useParams();
  const rawPolitician = String(params.politician || "");
  const decodedPolitician = decodeURIComponent(rawPolitician);

  const lang = usePublicLanguage() as PublicLang;
  const labels = getPublicLabels(lang);

  const [items, setItems] = useState<Contradiction[]>([]);

  useEffect(() => {
    loadItems();
  }, [decodedPolitician]);

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
        old_statement_hu,
        old_statement_de,
        old_statement_en,
        old_statement_fr,

        new_statement,
        new_statement_hu,
        new_statement_de,
        new_statement_en,
        new_statement_fr
      `)
      .eq("politician", decodedPolitician);

    setItems((data || []) as Contradiction[]);
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <TrendingContradictions />

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            {labels.politician}
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">
            {decodedPolitician}
          </h1>

          <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">
            {labels.politicianDetailDescription}
          </p>
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <ContradictionCard
              key={item.id}
              id={item.slug || item.id}
              politician={item.politician}
              topic={getTranslatedTopic(item, lang) || null}
              oldStatement={getTranslatedOldStatement(item, lang) || null}
              newStatement={getTranslatedNewStatement(item, lang) || null}
            />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}