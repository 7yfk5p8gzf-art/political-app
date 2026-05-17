"use client";

import type { ReactNode } from "react";

type PublicShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export default function PublicShell({
  eyebrow,
  title,
  description,
  children,
}: PublicShellProps) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10">
        {eyebrow && (
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-3 text-4xl font-bold">{title}</h1>

        {description && (
          <p className="mt-3 text-neutral-400">{description}</p>
        )}
      </div>

      {children}
    </main>
  );
}