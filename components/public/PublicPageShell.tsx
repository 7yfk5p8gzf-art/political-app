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

    if (saved === "true") {
      setDarkMode(true);
    }
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;

    setDarkMode(next);

    localStorage.setItem("dark-mode", String(next));
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(180deg, #020617 0%, #0f172a 100%)"
          : "radial-gradient(circle at top left, rgba(59,130,246,0.14), transparent 32%), radial-gradient(circle at top right, rgba(168,85,247,0.12), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "32px 16px 64px",
        transition: "all 0.25s ease",
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
              border: "none",
              cursor: "pointer",
              fontWeight: 900,
              background: darkMode ? "#f8fafc" : "#0f172a",
              color: darkMode ? "#0f172a" : "white",
              boxShadow: darkMode
                ? "0 10px 30px rgba(255,255,255,0.08)"
                : "0 10px 30px rgba(15,23,42,0.18)",
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div
  style={{
    color: darkMode ? "#f8fafc" : "#0f172a",
  }}
>
  {children}
</div>
      </div>
    </main>
  );
}