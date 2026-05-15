import PublicCard from "../ui/PublicCard";
import PublicTag from "../ui/PublicTag";

type Props = {
  href: string;
  topic: string;
  votes: number;
  voteLabel: string;
  politician: string | null;
  statement?: string | null;
};

export default function PoliticianMiniCard({
  href,
  topic,
  votes,
  voteLabel,
  politician,
  statement,
}: Props) {
  return (
    <a href={href} className="block no-underline">
      <PublicCard className="group min-h-[180px] border-white/5 bg-slate-900/95 text-white hover:scale-[1.02]">
        <div className="flex flex-wrap gap-2">
          <PublicTag>{topic}</PublicTag>
          <PublicTag>
            👍 {votes} {voteLabel}
          </PublicTag>
        </div>

        <h3 className="mt-6 text-4xl font-black tracking-tight text-white transition-all duration-300 group-hover:text-slate-100">
          {politician || "Unknown"}
        </h3>

        {statement && (
          <p className="mt-4 text-lg leading-8 text-slate-300 transition-all duration-300 group-hover:text-slate-200">
            {statement.slice(0, 140)}...
          </p>
        )}
      </PublicCard>
    </a>
  );
}