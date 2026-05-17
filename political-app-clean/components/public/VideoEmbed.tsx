"use client";

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

export default function VideoEmbed({
  url,
  title,
}: VideoEmbedProps) {
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
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Video evidence
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
          Videó bizonyíték
        </h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-sm dark:border-slate-800">
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={title || "YouTube video"}
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}