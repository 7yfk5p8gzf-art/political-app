import PublicCard from "../ui/PublicCard";
import PublicButton from "../ui/PublicButton";

type RelatedItem = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
  views: number | null;
};

type Props = {
  title: string;
  items: RelatedItem[];
};

export default function DetailRelated({ title, items }: Props) {
  if (!items.length) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-5 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
        {title}
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item) => (
          <PublicCard
            key={item.id}
            className="border-white/5 bg-slate-900/95 text-white"
          >
            <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              {item.topic || "Topic"}
            </div>

            <h3 className="mt-3 text-2xl font-black text-white">
              {item.politician || "Unknown"}
            </h3>

            <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-300">
              {item.old_statement || item.new_statement || ""}
            </p>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-400">
                👀 {item.views || 0}
              </span>

              {item.slug && (
                <PublicButton href={`/contradictions/${item.slug}`}>
                  Open →
                </PublicButton>
              )}
            </div>
          </PublicCard>
        ))}
      </div>
    </section>
  );
}