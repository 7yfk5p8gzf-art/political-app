"use client";

import type { ReactNode } from "react";
import AdminBackButton from "@/components/admin/AdminBackButton";

type AdminShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  showBack?: boolean;
};

export default function AdminShell({
  eyebrow,
  title,
  description,
  children,
  showBack = true,
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-black px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        {showBack && <AdminBackButton />}

        <p className="mt-8 mb-3 text-xs uppercase tracking-[0.35em] text-neutral-500">
          {eyebrow}
        </p>

        <h1 className="text-4xl font-bold">{title}</h1>

        {description && (
          <p className="mt-3 text-neutral-400">{description}</p>
        )}

        {children}
      </div>
    </main>
  );
}