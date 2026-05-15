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
      <PublicCard className="hover:-translate-y-0.5 transition-transform">
        <div className="flex flex-wrap gap-2">
          <PublicTag>{topic}</PublicTag>
          <PublicTag>👍 {votes} {voteLabel}</PublicTag>
        </div>

        <h3 className="mt-4 text-2xl font-black text-black dark:text-white">
          {politician || "Unknown"}
        </h3>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {statement ? `${statement.slice(0, 120)}...` : ""}
        </p>
      </PublicCard>
    </a>
  );
}