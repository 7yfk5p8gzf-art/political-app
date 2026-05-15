import PublicCard from "../ui/PublicCard";
import PublicButton from "../ui/PublicButton";

type Props = {
  title: string;
  oldLabel: string;
  newLabel: string;
  oldText: string;
  newText: string;
  oldDate: string;
  newDate: string;
  voteText: string;
  openLabel: string;
  href: string;
};

export default function SpotlightCard({
  title,
  oldLabel,
  newLabel,
  oldText,
  newText,
  oldDate,
  newDate,
  voteText,
  openLabel,
  href,
}: Props) {
  return (
    <PublicCard className="overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 p-8 text-white shadow-xl">
      <div className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black tracking-wide text-white">
        🔥 Spotlight
      </div>

      <h2 className="text-3xl font-black tracking-tight md:text-4xl">
        {title}
      </h2>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <PublicCard className="bg-white/10 text-white shadow-none ring-1 ring-white/10">
          <strong>{oldLabel}</strong>
          <p className="mt-2 text-sm leading-6 text-slate-100">{oldText}</p>
          <small className="text-slate-300">{oldDate}</small>
        </PublicCard>

        <PublicCard className="bg-white/10 text-white shadow-none ring-1 ring-white/10">
          <strong>{newLabel}</strong>
          <p className="mt-2 text-sm leading-6 text-slate-100">{newText}</p>
          <small className="text-slate-300">{newDate}</small>
        </PublicCard>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <span className="font-black text-white">{voteText}</span>

        <PublicButton href={href}>
          {openLabel} →
        </PublicButton>
      </div>
    </PublicCard>
  );
}