import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export default function PublicSection({
  children,
  title,
  subtitle,
}: Props) {
  return (
    <section className="mb-10">
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}