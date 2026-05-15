import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function PublicCard({
  children,
  className = "",
}: Props) {
  const baseClassName = `
    group
    relative overflow-hidden

    rounded-3xl
    border border-white/10

    bg-white/90
    p-6

    backdrop-blur-xl

    shadow-[0_10px_40px_rgba(15,23,42,0.08)]

    transition-all duration-500

    hover:-translate-y-[4px]
    hover:shadow-[0_30px_90px_rgba(15,23,42,0.20)]

    dark:bg-slate-900/90
    dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)]
  `;

  return (
    <div className={`${baseClassName} ${className}`}>
      <div
        className="
          pointer-events-none
          absolute inset-0
          rounded-3xl
          opacity-70

          bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_28%)]

          transition-opacity duration-500
          group-hover:opacity-100
        "
      />

      <div
        className="
          pointer-events-none
          absolute inset-0
          opacity-0

          bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.10)_50%,transparent_80%)]

          translate-x-[-120%]
          group-hover:translate-x-[120%]
          group-hover:opacity-100

          transition-all duration-1000
        "
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}