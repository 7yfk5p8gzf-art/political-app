"use client";

import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type AIAnalysisCardProps = {
  summary?: string | null;
  confidenceScore?: number | null;
  severityScore?: number | null;
  reviewStatus?: string | null;
};

export default function AIAnalysisCard({
  summary,
  confidenceScore,
  severityScore,
  reviewStatus,
}: AIAnalysisCardProps) {
  const lang = usePublicLanguage();

  if (!summary && !confidenceScore && !severityScore && !reviewStatus) {
    return null;
  }

  const labels = getPublicLabels(lang);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {labels.aiAnalysis}
      </p>

      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
        {labels.aiAnalysis}
      </h2>

      {summary && (
        <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
          {summary}
        </p>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {typeof confidenceScore === "number" && (
          <div className="rounded-xl bg-white p-4 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {labels.confidence}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
              {confidenceScore}%
            </p>
          </div>
        )}

        {typeof severityScore === "number" && (
          <div className="rounded-xl bg-white p-4 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {labels.severity}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
              {severityScore}%
            </p>
          </div>
        )}

        {reviewStatus && (
          <div className="rounded-xl bg-white p-4 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {labels.reviewStatus}
            </p>

            <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
              {reviewStatus}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}