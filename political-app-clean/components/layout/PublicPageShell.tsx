"use client";

import { ReactNode } from "react";

import { publicStyles } from "@/lib/publicStyles";

export default function PublicPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className={publicStyles.page}>
      

      <div className={publicStyles.container}>
        {children}
      </div>
    </main>
  );
}