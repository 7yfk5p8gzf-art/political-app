"use client";

type EvidenceQuoteCardProps = {
  oldQuote?: string | null;
  oldTimestamp?: string | null;
  oldPrecision?: string | null;

  newQuote?: string | null;
  newTimestamp?: string | null;
  newPrecision?: string | null;
  oldVideoUrl?: string | null;
newVideoUrl?: string | null;
};

export default function EvidenceQuoteCard({
  oldQuote,
  oldTimestamp,
  oldPrecision,
  oldVideoUrl,

  newQuote,
  newTimestamp,
  newPrecision,
  newVideoUrl,
}: EvidenceQuoteCardProps) {
  if (!oldQuote && !oldTimestamp) {
  oldQuote = "Old evidence quote preview";
  oldTimestamp = "00:00";
}

if (!newQuote && !newTimestamp) {
  newQuote = "New evidence quote preview";
  newTimestamp = "01:42";
}
function timestampToSeconds(value?: string | null) {
  if (!value) return 0;

  const parts = value.split(":").map(Number);

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
}

function buildYoutubeTimestampUrl(url?: string | null, timestamp?: string | null) {
  if (!url || !timestamp) return null;

  const seconds = timestampToSeconds(timestamp);

  if (!seconds) return url;

  return `${url}${url.includes("?") ? "&" : "?"}t=${seconds}s`;
}

const oldJumpUrl = buildYoutubeTimestampUrl(oldVideoUrl, oldTimestamp);
const newJumpUrl = buildYoutubeTimestampUrl(newVideoUrl, newTimestamp);

  return (
  <section className="mt-8 rounded-3xl border border-blue-900/40 bg-blue-950/20 p-6">
    <p className="text-xs font-bold uppercase tracking-wide text-blue-400">
      Evidence moments
    </p>

    <h2 className="mt-2 text-2xl font-bold text-white">
      Timeline evidence
    </h2>

    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-400">
          OLD POSITION
        </p>
        {oldQuote && (



    
          <blockquote className="mt-4 rounded-2xl border-l-4 border-blue-500 bg-black/30 p-5 text-lg font-semibold leading-8 text-white">
            “{oldQuote}”
          </blockquote>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          {oldTimestamp && (
  oldJumpUrl ? (
    <a
      href={oldJumpUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-500"
    >
      ⏱ {oldTimestamp}
    </a>
  ) : (
    <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white">
      ⏱ {oldTimestamp}
    </span>
  )
)}

          {oldPrecision && (
            <span className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200">
              {oldPrecision}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-red-400">
          NEW POSITION
        </p>

        <blockquote className="mt-4 rounded-2xl border-l-4 border-red-500 bg-black/30 p-5 text-lg font-semibold leading-8 text-white">
          “New evidence quote preview”
        </blockquote>

        <div className="mt-5 flex flex-wrap gap-3">
          {newTimestamp && (
  newJumpUrl ? (
    <a
      href={newJumpUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
    >
      ⏱ {newTimestamp}
    </a>
  ) : (
    <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
      ⏱ {newTimestamp}
    </span>
  )
)}

          <span className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200">
            medium
          </span>
        </div>
      </div>
    </div>
  </section>
);
}