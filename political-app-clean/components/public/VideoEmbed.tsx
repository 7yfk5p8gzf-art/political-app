"use client";

import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Lang = "hu" | "de" | "en" | "fr";

type VideoEmbedProps = {
  url?: string | null;
  title?: string;
};

function getYoutubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");

      if (!id) return null;

      const start =
        parsed.searchParams.get("t") ||
        parsed.searchParams.get("start");

      return `https://www.youtube.com/embed/${id}${
        start ? `?start=${start.replace("s", "")}` : ""
      }`;
    }

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      const start = parsed.searchParams.get("t");

      return `https://www.youtube.com/embed/${id}${
        start ? `?start=${start.replace("s", "")}` : ""
      }`;
    }

    return null;
  } catch {
    return null;
  }
}

export default function VideoEmbed({ url, title }: VideoEmbedProps) {
  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

  if (!url) {
    return null;
  }

  const embedUrl = getYoutubeEmbedUrl(url);

  if (!embedUrl) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          {labels.videoEvidence}
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
          {labels.videoEvidence}
        </h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-sm dark:border-slate-800">
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={title || labels.videoEvidence}
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}