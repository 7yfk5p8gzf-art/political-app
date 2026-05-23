"use client";

import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Lang = "hu" | "de" | "en" | "fr";

type AIAnalysisCardProps = {
  summary?: string | null;
  confidenceScore?: number | null;
  severityScore?: number | null;
  reviewStatus?: string | null;
};

function getReviewStatusLabel(
  status: string,
  labels: ReturnType<typeof getPublicLabels>
) {
  switch (status.toLowerCase()) {
    case "draft":
      return labels.draft;

    case "review":
      return labels.review;

    case "published":
      return labels.published;

    default:
      return status;
  }
}

export default function AIAnalysisCard({
  summary,
  confidenceScore,
  severityScore,
  reviewStatus,
}: AIAnalysisCardProps) {
  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

  if (
    !summary &&
    typeof confidenceScore !== "number" &&
    typeof severityScore !== "number" &&
    !reviewStatus
  ) {
    return null;
  }

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
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

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {typeof confidenceScore === "number" &&
confidenceScore > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {labels.confidence}
            </p>

            <p className="mt-3 text-3xl font-black text-blue-600 dark:text-blue-400">
              {confidenceScore}%
            </p>
          </div>
        )}

        {typeof severityScore === "number" &&
severityScore > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {labels.severity}
            </p>

            <p className="mt-3 text-3xl font-black text-red-600 dark:text-red-400">
              {severityScore}%
            </p>
          </div>
        )}
        {typeof severityScore === "number" &&
severityScore > 0 && (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Contradiction strength
    </p>

    <div className="mt-3">
      {severityScore >= 80 ? (
        <div className="inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
          🔴 Strong contradiction
        </div>
      ) : severityScore >= 55 ? (
        <div className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white">
          🟠 Possible contradiction
        </div>
      ) : severityScore >= 30 ? (
        <div className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white">
          🔵 Position shift
        </div>
      ) : (
        <div className="inline-flex rounded-full bg-slate-500 px-4 py-2 text-sm font-bold text-white">
          ⚪ Context changed
        </div>
      )}
    </div>
  </div>
)}

        {reviewStatus && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {labels.reviewStatus}
            </p>

            <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">
              {getReviewStatusLabel(reviewStatus, labels)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}