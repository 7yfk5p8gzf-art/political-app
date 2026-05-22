"use client";

import ContradictionCard from "@/components/public/ContradictionCard";
import { usePublicLanguage } from "@/lib/usePublicLanguage";
import { getPublicLabels } from "@/lib/getPublicLabels";
import {
  getTranslatedTopic,
  getTranslatedOldStatement,
  getTranslatedNewStatement,
  type PublicLang,
} from "@/lib/publicTranslations";

type Props = {
  item: {
    id: string;
    politician: string | null;
    topic: string | null;
    old_statement: string | null;
    new_statement: string | null;
    views: number | null;
  };
};

export default function HomeSpotlight({ item }: Props) {
  const lang = usePublicLanguage();
  const labels = getPublicLabels(lang);
  const translatedTopic = getTranslatedTopic(item, lang as PublicLang);

const translatedOldStatement =
  getTranslatedOldStatement(item, lang as PublicLang);

const translatedNewStatement =
  getTranslatedNewStatement(item, lang as PublicLang);
  



  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
        {labels.spotlight}
      </p>

      <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
        {item.politician} · {translatedTopic}
      </h2>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        {item.views || 0} {labels.views}
      </p>

      <div className="mt-6">
        <ContradictionCard
  id={item.id}
  politician={item.politician}
  topic={translatedTopic || ""}
  oldStatement={translatedOldStatement || ""}
  newStatement={translatedNewStatement || ""}
/>
      </div>
    </section>
  );
}