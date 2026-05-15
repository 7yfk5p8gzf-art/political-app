import type { ReactNode } from "react";
import PublicCard from "../ui/PublicCard";

type Props = {
  badge?: string;
  title: string;
  description?: string;
  rightContent?: ReactNode;
};

export default function PublicHero({
  badge,
  title,
  description,
  rightContent,
}: Props) {
  return (
    <PublicCard className="relative overflow-hidden p-8 md:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          {badge && (
            <div className="mb-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-black tracking-wide text-white dark:bg-slate-100 dark:text-slate-900">
              {badge}
            </div>
          )}

          <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-slate-50 md:text-6xl">
            {title}
          </h1>

          {description && (
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {rightContent && (
          <div className="grid gap-4">
            {rightContent}
          </div>
        )}
      </div>
    </PublicCard>
  );
}