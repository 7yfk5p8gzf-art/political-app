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
    <PublicCard className="relative overflow-hidden p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <PublicTag href={`/topics/${slugify(topicLabel || item.topic || "")}`}>
              {topicLabel || labels.noTopic} →
            </PublicTag>

            {item.language && <PublicTag>{item.language.toUpperCase()}</PublicTag>}

            <PublicTag>
              👍 {yesPercent}% · {voteCount}{" "}
              {lang === "de" && voteCount === 1 ? "Stimme" : labels.vote}
            </PublicTag>
          </div>

          <h2 className="mt-5 text-2xl font-black tracking-tight text-black dark:text-white">
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
            <span className="text-slate-500 dark:text-slate-400">
              – {topicLabel || labels.topic}
            </span>
          </h2>
        </div>

        <PublicButton href={`/contradictions/${cardSlug}`}>
          {labels.open} →
        </PublicButton>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <PublicCard className="bg-slate-100 text-slate-950 shadow-none dark:bg-slate-800 dark:text-slate-50">
          <strong>{labels.old}</strong>
          <p className="mt-2 text-sm leading-6">
            {item.old_statement || labels.noOldStatement}
          </p>
          <small className="text-slate-500 dark:text-slate-400">
            {item.old_date || labels.unknownDate}
          </small>
        </PublicCard>

        <PublicCard className="bg-slate-100 text-slate-950 shadow-none dark:bg-slate-800 dark:text-slate-50">
          <strong>{labels.now}</strong>
          <p className="mt-2 text-sm leading-6">
            {item.new_statement || labels.noNewStatement}
          </p>
          <small className="text-slate-500 dark:text-slate-400">
            {item.new_date || labels.unknownDate}
          </small>
        </PublicCard>
      </div>

      {summary && (
  <PublicCard className="mt-4 bg-slate-100 text-slate-950 shadow-none dark:bg-slate-800 dark:text-slate-50">
    <div className="flex items-start gap-3">
      <span className="mt-1 text-lg">🤖</span>

      <div>
        <div className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          AI Analysis
        </div>

        <p className="line-clamp-4 text-sm leading-7">
          {summary}
        </p>
      </div>
    </div>
  </PublicCard>
)}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm font-bold text-slate-600 dark:border-slate-800 dark:text-slate-400">
        <span>
          {labels.published}:{" "}
          {item.published_at ? item.published_at.slice(0, 10) : "-"}
        </span>

        <span>👀 {item.views || 0}</span>

        <div className="flex gap-3">
          {item.old_source && (
            <a href={item.old_source} target="_blank" rel="noreferrer">
              {labels.oldSource}
            </a>
          )}

          {item.new_source && (
            <a href={item.new_source} target="_blank" rel="noreferrer">
              {labels.newSource}
            </a>
          )}
        </div>
      </div>
    </PublicCard>
  );
}