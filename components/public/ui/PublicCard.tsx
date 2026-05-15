import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function PublicCard({
  children,
  className,
}: Props) {
  return (
    <div
      className={clsx(
        `
        rounded-3xl
        border border-white/40
        bg-white/90
        p-6
        shadow-[0_10px_40px_rgba(15,23,42,0.08)]
        backdrop-blur-xl
        transition-all duration-300

        hover:-translate-y-[2px]
        hover:shadow-[0_18px_60px_rgba(15,23,42,0.12)]

        dark:border-white/10
        dark:bg-slate-900/90
        dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]
        `,
        className
      )}
    >
      {children}
    </div>
  );
}