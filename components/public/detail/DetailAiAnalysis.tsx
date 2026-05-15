import PublicCard from "../ui/PublicCard";

type Props = {
  summary: string;
};

export default function DetailAiAnalysis({ summary }: Props) {
  return (
    <PublicCard className="mb-8 border-white/5 bg-slate-900/95 text-white">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-500/20 text-2xl ring-1 ring-indigo-400/20">
          🤖
        </div>

        <div>
          <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-indigo-300">
            AI Analysis
          </div>

          <p className="text-lg leading-8 text-slate-200">
            {summary}
          </p>
        </div>
      </div>
    </PublicCard>
  );
}