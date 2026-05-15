import PublicCard from "../ui/PublicCard";
import PublicButton from "../ui/PublicButton";
import PublicTag from "../ui/PublicTag";

export default function ContradictionCard() {
  return (
    <PublicCard className="relative overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          <PublicTag>Migration</PublicTag>
          <PublicTag>DE</PublicTag>
        </div>

        <PublicButton href="#">
          Open →
        </PublicButton>
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <PublicCard className="bg-slate-50 shadow-none dark:bg-slate-900/60">
          <strong>BEFORE</strong>
          <p className="mt-2 text-sm">
            Example old statement...
          </p>
        </PublicCard>

        <PublicCard className="bg-slate-50 shadow-none dark:bg-slate-900/60">
          <strong>NOW</strong>
          <p className="mt-2 text-sm">
            Example new statement...
          </p>
        </PublicCard>
      </div>
    </PublicCard>
  );
}