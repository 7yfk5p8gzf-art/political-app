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
    <PublicCard className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white">
      <div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black tracking-wide">
        🔥 Spotlight
      </div>

      <h2 className="text-3xl font-black tracking-tight">
        {title}
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <PublicCard className="bg-white/10 shadow-none">
          <strong>{oldLabel}</strong>

          <p className="mt-2 text-sm leading-6">
            {oldText}
          </p>

          <small className="text-slate-300">
            {oldDate}
          </small>
        </PublicCard>

        <PublicCard className="bg-white/10 shadow-none">
          <strong>{newLabel}</strong>

          <p className="mt-2 text-sm leading-6">
            {newText}
          </p>

          <small className="text-slate-300">
            {newDate}
          </small>
        </PublicCard>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <span className="font-black">
          {voteText}
        </span>

        <PublicButton href={href}>
          {openLabel} →
        </PublicButton>
      </div>
    </PublicCard>
  );
}