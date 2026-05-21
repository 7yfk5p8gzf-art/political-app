"use client";

import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Lang = "hu" | "de" | "en" | "fr";

type SourceCardsProps = {
  oldSource?: string | null;
  newSource?: string | null;
  oldVideoUrl?: string | null;
  newVideoUrl?: string | null;
};

export default function SourceCards({
  oldSource,
  newSource,
  oldVideoUrl,
  newVideoUrl,
}: SourceCardsProps) {
  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          {labels.sources}
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
          {labels.sources}
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {labels.oldSource}
          </p>

          <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
            {oldSource || labels.noSource}
          </p>

          {oldVideoUrl && (
            <a
              href={oldVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-200"
            >
              {labels.openVideo}
            </a>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {labels.newSource}
          </p>

          <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
            {newSource || labels.noSource}
          </p>

          {newVideoUrl && (
            <a
              href={newVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-200"
            >
              {labels.openVideo}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}