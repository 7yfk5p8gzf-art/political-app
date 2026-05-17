type AIInsightPanelProps = {
  title?: string;
  summary?: string | null;
};

export default function AIInsightPanel({
  title,
  summary,
}: AIInsightPanelProps) {
  if (!summary) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
          AI
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            AI Insight
          </p>

          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            {title || "AI elemzés"}
          </h2>
        </div>
      </div>

      <p className="mt-5 text-base leading-8 text-slate-700 dark:text-slate-300">
        {summary}
      </p>
    </section>
  );
}