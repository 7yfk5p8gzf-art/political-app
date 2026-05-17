"use client";

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
  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Sources
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
          Források
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Korábbi forrás
          </p>

          <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
            {oldSource || "Nincs forrás"}
          </p>

          {oldVideoUrl && (
            <a
              href={oldVideoUrl}
              target="_blank"
              className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Videó megnyitása
            </a>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Új forrás
          </p>

          <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
            {newSource || "Nincs forrás"}
          </p>

          {newVideoUrl && (
            <a
              href={newVideoUrl}
              target="_blank"
              className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Videó megnyitása
            </a>
          )}
        </div>
      </div>
    </section>
  );
}