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
    <main
  className={publicStyles.page}
  style={{
    minHeight: "100vh",
    padding: "32px 16px 64px",
    background: "var(--page-bg)",
    color: "var(--text-main)",
  }}
>
      <div
  className={publicStyles.shell}
  style={{
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
  }}
>
        <div
          style={{
            position: "fixed",
            right: 18,
            bottom: 18,
            zIndex: 9999,
          }}
        >
          <button
  onClick={toggleDarkMode}
  className={publicStyles.buttonSecondary}
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