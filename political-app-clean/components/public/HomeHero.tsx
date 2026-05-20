"use client";

import Link from "next/link";
import AIInsightPanel from "@/components/public/AIInsightPanel";
import { getPublicLabels } from "@/lib/getPublicLabels";
import { publicText } from "@/lib/publicText";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

export default function HomeHero() {
  const lang = usePublicLanguage();
  const labels = getPublicLabels(lang);
  const text = publicText[lang as keyof typeof publicText];

  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          {labels.platformName}
        </p>

        <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-6xl">
          {labels.heroTitle}
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          {text.heroDescription}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/contradictions"
            className="rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white transition hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-200"
          >
            {labels.browseContradictions}
          </Link>

          <Link
            href="/topics"
            className="rounded-2xl border border-slate-200 px-6 py-4 font-bold text-slate-900 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-white dark:hover:border-blue-400 dark:hover:text-blue-400"
          >
            {labels.exploreTopics}
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <AIInsightPanel
          title={labels.aiInsightTitle}
          summary={text.aiInsightSummary}
        />
      </div>
    </>
  );
}