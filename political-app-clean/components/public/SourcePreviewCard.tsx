"use client";

import { publicStyles } from "@/lib/publicStyles";

type Props = {
  title?: string | null;
  summary?: string | null;
  source?: string | null;
  date?: string | null;
  type?: "article" | "video";
  url?: string | null;
};

export default function SourcePreviewCard({
  title,
  summary,
  source,
  date,
  type = "article",
  url,
}: Props) {
  return (
    <div className={publicStyles.card}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={publicStyles.badge}>
          {type === "video" ? "🎥 VIDEO" : "📰 ARTICLE"}
        </span>

        {date && (
          <span className={publicStyles.muted}>
            {date}
          </span>
        )}
      </div>

      <h3 className="mb-3 text-xl font-bold text-slate-950 dark:text-white">
        {title || "Untitled source"}
      </h3>

      <p className="mb-5 text-sm leading-7 text-slate-700 dark:text-slate-300">
        {summary || "No summary available."}
      </p>

      <div className="flex items-center justify-between gap-3">
        <span className={publicStyles.muted}>
          {source || "Unknown source"}
        </span>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={publicStyles.secondaryButton}
          >
            Open Source
          </a>
        )}
      </div>
    </div>
  );
}