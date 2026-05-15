import PublicCard from "../ui/PublicCard";
import PublicTag from "../ui/PublicTag";

type Props = {
  topic: string;
  language: string;
  title: string;
  lead: string;
  views: number;
  viewsLabel: string;
};

export default function DetailHero({
  topic,
  language,
  title,
  lead,
  views,
  viewsLabel,
}: Props) {
  return (
    <PublicCard className="mb-8 p-8 md:p-10">
      <div className="flex flex-wrap gap-2">
        <PublicTag>{topic}</PublicTag>
        <PublicTag>{language.toUpperCase()}</PublicTag>
      </div>

      <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 dark:text-white md:text-7xl">
        {title}
      </h1>

      <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600 dark:text-slate-300">
        {lead}
      </p>

      <div className="mt-5 text-sm font-black text-slate-500 dark:text-slate-400">
        👀 {views} {viewsLabel}
      </div>
    </PublicCard>
  );
}