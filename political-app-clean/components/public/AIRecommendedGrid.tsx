import ContradictionCard from "./ContradictionCard";

type Item = {
  id: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
};

type AIRecommendedGridProps = {
  title?: string;
  items: Item[];
};

export default function AIRecommendedGrid({
  title,
  items,
}: AIRecommendedGridProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
          AI
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            AI Recommendations
          </p>

          <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
            {title || "Ajánlott esetek"}
          </h2>
        </div>
      </div>

      <div className="grid gap-6">
        {items.map((item) => (
          <ContradictionCard
            key={item.id}
            id={item.id}
            politician={item.politician}
            topic={item.topic}
            oldStatement={item.old_statement}
            newStatement={item.new_statement}
          />
        ))}
      </div>
    </section>
  );
}