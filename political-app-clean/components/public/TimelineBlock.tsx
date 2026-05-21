"use client";

import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Lang = "hu" | "de" | "en" | "fr";

type TimelineBlockProps = {
  oldDate?: string | null;
  newDate?: string | null;
  oldStatement?: string | null;
  newStatement?: string | null;
};

export default function TimelineBlock({
  oldDate,
  newDate,
  oldStatement,
  newStatement,
}: TimelineBlockProps) {
  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          {labels.timeline}
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
          {labels.timeline}
        </h2>
      </div>

      <div className="relative border-l border-slate-200 pl-6 dark:border-slate-800">
        <div className="relative pb-10">
          <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-950" />

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {labels.old}
          </p>

          {oldDate && (
            <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
              {oldDate}
            </p>
          )}

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
              {oldStatement || labels.noOldStatement}
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-red-500 ring-4 ring-white dark:ring-slate-950" />

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {labels.new}
          </p>

          {newDate && (
            <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
              {newDate}
            </p>
          )}

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
              {newStatement || labels.noNewStatement}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}