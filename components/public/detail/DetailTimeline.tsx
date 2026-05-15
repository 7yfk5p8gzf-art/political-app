import PublicCard from "../ui/PublicCard";

type Props = {
  oldLabel: string;
  newLabel: string;
  oldDate?: string | null;
  newDate?: string | null;
  oldStatement?: string | null;
  newStatement?: string | null;
};

export default function DetailTimeline({
  oldLabel,
  newLabel,
  oldDate,
  newDate,
  oldStatement,
  newStatement,
}: Props) {
  return (
    <PublicCard className="mb-8">
      <div className="relative grid gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-indigo-400/20 bg-indigo-500/10 p-6">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
            {oldLabel}
          </div>

          <div className="text-sm font-bold text-slate-400">
            {oldDate || "Ismeretlen dátum"}
          </div>

          <p className="mt-5 text-xl font-black text-white">
            {oldStatement || "-"}
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            {newLabel}
          </div>

          <div className="text-sm font-bold text-slate-400">
            {newDate || "Ismeretlen dátum"}
          </div>

          <p className="mt-5 text-xl font-black text-white">
            {newStatement || "-"}
          </p>
        </div>
      </div>
    </PublicCard>
  );
}