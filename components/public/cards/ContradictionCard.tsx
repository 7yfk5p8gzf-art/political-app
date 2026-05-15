import PublicCard from "../ui/PublicCard";
import PublicButton from "../ui/PublicButton";
import PublicTag from "../ui/PublicTag";

type Lang = "hu" | "de" | "en" | "fr";

type Item = {
  id: string;
  slug: string | null;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
  old_source: string | null;
  new_source: string | null;
  politician: string | null;
  topic: string | null;
  language?: string | null;
  published_at: string | null;
  views?: number | null;
};

type Labels = {
  unknown: string;
  topic: string;
  vote: string;
  noTopic: string;
  old: string;
  now: string;
  noOldStatement: string;
  noNewStatement: string;
  unknownDate: string;
  published: string;
  oldSource: string;
  newSource: string;
  open: string;
};

type Props = {
  item: Item;
  voteCount: number;
  yesPercent: number;
  lang: Lang;
  labels: Labels;
  topicLabel: string;
  summary?: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ContradictionCard({
  item,
  voteCount,
  yesPercent,
  lang,
  labels,
  topicLabel,
  summary,
}: Props) {
  const cardSlug =
    item.slug ||
    slugify(`${item.politician || "case"}-${item.topic || "topic"}`);

  return (
    <PublicCard className="border-white/5 bg-slate-900/95 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <PublicTag href={`/topics/${slugify(topicLabel || item.topic || "")}`}>
              {topicLabel || labels.noTopic} →
            </PublicTag>

            {item.language && (
              <PublicTag>{item.language.toUpperCase()}</PublicTag>
            )}

            <PublicTag>
              👍 {yesPercent}% · {voteCount}{" "}
              {lang === "de" && voteCount === 1
                ? "Stimme"
                : labels.vote}
            </PublicTag>
          </div>

          <h2 className="mt-6 text-4xl font-black tracking-tight text-white">
            {item.politician ? (
              <a
                href={`/politicians/${slugify(item.politician)}`}
                className="underline decoration-2 underline-offset-4"
              >
                {item.politician}
              </a>
            ) : (
              labels.unknown
            )}{" "}
            <span className="text-slate-400">
              – {topicLabel || labels.topic}
            </span>
          </h2>
        </div>

        <PublicButton href={`/contradictions/${cardSlug}`}>
          {labels.open} →
        </PublicButton>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <PublicCard className="border-white/5 bg-[#071133] text-white shadow-none">
          <strong className="text-2xl">{labels.old}</strong>

          <p className="mt-4 text-base leading-7 text-slate-200">
            {item.old_statement || labels.noOldStatement}
          </p>

          <small className="text-slate-400">
            {item.old_date || labels.unknownDate}
          </small>
        </PublicCard>

        <PublicCard className="border-white/5 bg-[#071133] text-white shadow-none">
          <strong className="text-2xl">{labels.now}</strong>

          <p className="mt-4 text-base leading-7 text-slate-200">
            {item.new_statement || labels.noNewStatement}
          </p>

          <small className="text-slate-400">
            {item.new_date || labels.unknownDate}
          </small>
        </PublicCard>
      </div>

      {summary && (
        <PublicCard className="mt-5 border-white/5 bg-[#101b46] text-white shadow-none">
          <div className="flex items-start gap-4">
            <span className="mt-1 text-2xl">🤖</span>

            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                AI Analysis
              </div>

              <p className="text-base leading-8 text-slate-100">
                {summary}
              </p>
            </div>
          </div>
        </PublicCard>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-sm font-bold text-slate-400">
        <span>
          {labels.published}:{" "}
          {item.published_at
            ? item.published_at.slice(0, 10)
            : "-"}
        </span>

        <span>👀 {item.views || 0}</span>

        <div className="flex gap-4">
          {item.old_source && (
            <a
              href={item.old_source}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              {labels.oldSource}
            </a>
          )}

          {item.new_source && (
            <a
              href={item.new_source}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              {labels.newSource}
            </a>
          )}
        </div>
      </div>
    </PublicCard>
  );
}