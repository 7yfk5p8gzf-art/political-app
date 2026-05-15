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
      <PublicCard className="min-h-[150px] p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex flex-wrap gap-2">
          <PublicTag>{topic}</PublicTag>
          <PublicTag>
            👍 {votes} {voteLabel}
          </PublicTag>
        </div>

        <h3 className="mt-5 text-2xl font-black tracking-tight text-black dark:text-white">
          {politician || "Unknown"}
        </h3>

        {statement && (
          <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
            {statement.slice(0, 140)}...
          </p>
        )}
      </PublicCard>
    </a>
  );
}