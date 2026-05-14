"use client";

import { useEffect, useState, type ReactNode } from "react";

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
      style={{
        minHeight: "100vh",
        padding: "32px 16px 64px",
      }}
    >
      <div
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
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid var(--card-border)",
              cursor: "pointer",
              fontWeight: 900,
              background: "var(--card-bg)",
              color: "var(--text-main)",
              backdropFilter: "blur(10px)",
              boxShadow: "var(--shadow-main)",
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {children}
      </div>
    </main>
  );
}