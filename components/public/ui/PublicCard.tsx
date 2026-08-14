import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function PublicCard({
  children,
  className = "",
}: Props) {
  const baseClassName = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)] dark:border-slate-700 dark:bg-slate-900';

  return (
    <div className={`${baseClassName} ${className}`}>
      {children}
    </div>
  );
}
