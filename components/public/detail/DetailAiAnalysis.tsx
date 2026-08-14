import PublicCard from "../ui/PublicCard";

type Props = {
  summary: string;
};

export default function DetailAiAnalysis({ summary }: Props) {
  return (
    <PublicCard className="mb-8 border-amber-200 bg-amber-50/70">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-200 text-sm font-black text-amber-900 ring-1 ring-amber-300">
          AI
        </div>

        <div>
          <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-amber-800">
            AI Analysis
          </div>

          <p className="text-lg leading-8 text-slate-800">
            {summary}
          </p>
        </div>
      </div>
    </PublicCard>
  );
}
