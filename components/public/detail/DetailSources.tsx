import PublicCard from "../ui/PublicCard";
import PublicButton from "../ui/PublicButton";

type Props = {
  oldSource?: string | null;
  newSource?: string | null;
  oldLabel: string;
  newLabel: string;
  noSourceLabel: string;
};

export default function DetailSources({
  oldSource,
  newSource,
  oldLabel,
  newLabel,
  noSourceLabel,
}: Props) {
  return (
    <div className="mb-8 grid gap-5 md:grid-cols-2">
      <PublicCard className="border-white/5 bg-slate-900/95 text-white">
        <div className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
          {oldLabel}
        </div>

        {oldSource ? (
          <PublicButton href={oldSource}>
            Open source →
          </PublicButton>
        ) : (
          <p className="text-slate-400">{noSourceLabel}</p>
        )}
      </PublicCard>

      <PublicCard className="border-white/5 bg-slate-900/95 text-white">
        <div className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
          {newLabel}
        </div>

        {newSource ? (
          <PublicButton href={newSource}>
            Open source →
          </PublicButton>
        ) : (
          <p className="text-slate-400">{noSourceLabel}</p>
        )}
      </PublicCard>
    </div>
  );
}