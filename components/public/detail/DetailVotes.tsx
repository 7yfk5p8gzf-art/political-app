import PublicCard from "../ui/PublicCard";

type Props = {
  yesPercent: number;
  noPercent: number;
  totalVotes: number;
  voted: boolean;
  onVote: (type: "yes" | "no") => void;
};

export default function DetailVotes({
  yesPercent,
  noPercent,
  totalVotes,
  voted,
  onVote,
}: Props) {
  return (
    <PublicCard className="mb-10 border-white/5 bg-slate-900/95 text-white">
      <div className="mb-5 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
        Community Vote
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <button
          onClick={() => onVote("yes")}
          disabled={voted}
          className="
            rounded-2xl
            border border-emerald-400/20
            bg-emerald-500/10
            p-6

            text-left
            transition-all duration-300

            hover:scale-[1.01]
            hover:bg-emerald-500/20

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            YES
          </div>

          <div className="mt-3 text-5xl font-black text-white">
            {yesPercent}%
          </div>
        </button>

        <button
          onClick={() => onVote("no")}
          disabled={voted}
          className="
            rounded-2xl
            border border-rose-400/20
            bg-rose-500/10
            p-6

            text-left
            transition-all duration-300

            hover:scale-[1.01]
            hover:bg-rose-500/20

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <div className="text-sm font-black uppercase tracking-[0.2em] text-rose-300">
            NO
          </div>

          <div className="mt-3 text-5xl font-black text-white">
            {noPercent}%
          </div>
        </button>
      </div>

      <div className="text-sm font-bold text-slate-400">
        Total votes: {totalVotes}
      </div>
    </PublicCard>
  );
}