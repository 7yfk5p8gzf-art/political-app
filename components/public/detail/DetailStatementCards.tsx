import PublicCard from "../ui/PublicCard";

type Props = {
  oldLabel: string;
  newLabel: string;
  oldStatement?: string | null;
  newStatement?: string | null;
  noOldStatement: string;
  noNewStatement: string;
};

export default function DetailStatementCards({
  oldLabel,
  newLabel,
  oldStatement,
  newStatement,
  noOldStatement,
  noNewStatement,
}: Props) {
  return (
    <div className="mb-8 grid gap-5 md:grid-cols-2">
      <PublicCard className="border-indigo-400/20 bg-indigo-950/90 text-white">
        <div className="mb-4 inline-flex rounded-full bg-indigo-500/20 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-200">
          ◀ {oldLabel}
        </div>

        <p className="text-2xl font-black leading-9">
          {oldStatement || noOldStatement}
        </p>
      </PublicCard>

      <PublicCard className="border-emerald-400/20 bg-emerald-950/90 text-white">
        <div className="mb-4 inline-flex rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
          ▶ {newLabel}
        </div>

        <p className="text-2xl font-black leading-9">
          {newStatement || noNewStatement}
        </p>
      </PublicCard>
    </div>
  );
}