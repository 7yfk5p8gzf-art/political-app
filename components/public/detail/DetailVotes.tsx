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
    <PublicCard className="mb-10 border-slate-200 bg-white">
      <div className="mb-5 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
        Community Vote
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <button
          onClick={() => onVote("yes")}
          disabled={voted}
          className="
            rounded-2xl
            border border-emerald-200
            bg-emerald-50
            p-6

            text-left
            transition-all duration-300

            hover:border-emerald-400
            hover:bg-emerald-100

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
            YES
          </div>

          <div className="mt-3 text-5xl font-black text-slate-950">
            {yesPercent}%
          </div>
        </button>

        <button
          onClick={() => onVote("no")}
          disabled={voted}
          className="
            rounded-2xl
            border border-rose-200
            bg-rose-50
            p-6

            text-left
            transition-all duration-300

            hover:border-rose-400
            hover:bg-rose-100

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <div className="text-sm font-black uppercase tracking-[0.2em] text-rose-800">
            NO
          </div>

          <div className="mt-3 text-5xl font-black text-slate-950">
            {noPercent}%
          </div>
        </button>
      </div>

      <div className="text-sm font-bold text-slate-500">
        Total votes: {totalVotes}
      </div>
    </PublicCard>
  );
}
