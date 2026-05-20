"use client";

import Link from "next/link";
import ContradictionCard from "@/components/public/ContradictionCard";
import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Item = {
  id: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
  views: number | null;
};

export default function HomeTopContradictions({ items }: { items: Item[] }) {
  const lang = usePublicLanguage();
  const labels = getPublicLabels(lang);

  return (
    <section className="mt-14">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
          {labels.topContradictions}
        </h2>

        <Link
          href="/contradictions"
          className="text-sm font-semibold text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          {labels.viewAll}
        </Link>
      </div>

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id}>
            <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              {item.views || 0} {labels.views}
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
  );
}