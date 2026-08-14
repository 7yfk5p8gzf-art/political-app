"use client";

import { useEffect, useState, type ReactNode } from "react";
import { publicStyles } from "@/lib/publicStyles";
import PublicHeader from "@/components/layout/PublicHeader";

export default function PublicPageShell({
  children,
}: {
  children: ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dark-mode");

    const enabled = saved === "true";

    setDarkMode(enabled);

    if (enabled) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;

    setDarkMode(next);

    localStorage.setItem("dark-mode", String(next));

    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return (
    <main className={`${publicStyles.page} min-h-screen px-4 pb-16 pt-4 text-[var(--text-main)] sm:px-6`} style={{ background: "var(--page-bg)" }}>
      <div className="mx-auto w-full max-w-[1180px]">
        <div
          style={{
            position: "fixed",
            right: 18,
            bottom: 18,
            zIndex: 9999,
          }}
        >
          <button
  type="button"
  aria-label="Téma váltása"
  onClick={toggleDarkMode}
  className={`${publicStyles.buttonSecondary} px-3 py-2 text-xs`}
  style={{
              
              backdropFilter: "blur(10px)",
              boxShadow: "var(--shadow-main)",
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <PublicHeader />

<div className="mt-6">
  {children}
</div>
      </div>
    </main>
  );
}
