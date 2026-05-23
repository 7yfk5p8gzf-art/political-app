"use client";

import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Lang = "hu" | "de" | "en" | "fr";

type VideoEmbedProps = {
  oldUrl?: string | null;
  newUrl?: string | null;
  oldTitle?: string;
  newTitle?: string;
};;

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

export default function VideoEmbed({
  oldUrl,
  newUrl,
  oldTitle,
  newTitle,
}: VideoEmbedProps) {
  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

  const oldEmbedUrl = oldUrl
  ? getYoutubeEmbedUrl(oldUrl)
  : null;

const newEmbedUrl = newUrl
  ? getYoutubeEmbedUrl(newUrl)
  : null;

if (!oldEmbedUrl && !newEmbedUrl) {
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

      <div className="grid gap-4 md:grid-cols-2">
  {oldEmbedUrl && (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-sm dark:border-slate-800">
      <div className="bg-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-wide text-blue-300">
        Korábbi videó
      </div>
      <div className="aspect-video">
        <iframe
          src={oldEmbedUrl}
          title={oldTitle || labels.videoEvidence}
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </div>
  )}

  {newEmbedUrl && (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-sm dark:border-slate-800">
      <div className="bg-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-wide text-blue-300">
        Új videó
      </div>
      <div className="aspect-video">
        <iframe
          src={newEmbedUrl}
          title={newTitle || labels.videoEvidence}
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </div>
  )}
</div>
    </section>
  );
}