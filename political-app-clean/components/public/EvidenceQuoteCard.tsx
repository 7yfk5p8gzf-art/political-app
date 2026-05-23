"use client";

type EvidenceQuoteCardProps = {
  quote?: string | null;
  timestamp?: string | null;
  precision?: string | null;
};

export default function EvidenceQuoteCard({
  quote,
  timestamp,
  precision,
}: EvidenceQuoteCardProps) {
  if (!quote && !timestamp) {
  quote = "AI evidence quote preview";
  timestamp = "00:00";
}

  return (
    <section className="mt-8 rounded-3xl border border-blue-900/40 bg-blue-950/20 p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-400">
        Evidence moment
      </p>

      <h2 className="mt-2 text-2xl font-bold text-white">
        Key quote / timestamp
      </h2>

      {quote && (
        <blockquote className="mt-5 rounded-2xl border-l-4 border-blue-500 bg-slate-950/60 p-5 text-lg font-semibold leading-8 text-white">
          “{quote}”
        </blockquote>
      )}

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        {timestamp && (
          <span className="rounded-full bg-blue-600 px-4 py-2 font-bold text-white">
            ⏱ {timestamp}
          </span>
        )}

        {precision && (
          <span className="rounded-full bg-slate-800 px-4 py-2 font-semibold text-slate-200">
            Precision: {precision}
          </span>
        )}
      </div>
    </section>
  );
}