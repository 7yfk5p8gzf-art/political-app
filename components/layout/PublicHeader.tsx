"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { detectBrowserLang, saveLang, type Lang } from "@/lib/i18n";

export default function PublicHeader() {
  const [lang, setLang] = useState<Lang>("hu");

  useEffect(() => {
    setLang(detectBrowserLang());
  }, []);

  function changeLang(nextLang: Lang) {
    setLang(nextLang);
    saveLang(nextLang);
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-50 mb-6 rounded-3xl border border-white/10 bg-slate-950/70 px-6 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <Link href="/" className="group block">
          <div className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
            Political Intelligence
          </div>

          <div className="mt-1 text-2xl font-black tracking-tight text-white">
            Contradiction Platform
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-3">
          <Link href="/" className="rounded-full px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
            Home
          </Link>

          <Link href="/contradictions" className="rounded-full px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
            Contradictions
          </Link>

          <Link href="/topics" className="rounded-full px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
            Topics
          </Link>

          <Link href="/politicians" className="rounded-full px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
            Politicians
          </Link>

          <Link href="/login" className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-900 hover:bg-slate-200">
            Login / Register
          </Link>

          <div className="ml-2 flex gap-2">
            {(["hu", "de", "en", "fr"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={
                  lang === l
                    ? "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-indigo-500/30"
                    : "rounded-xl bg-white/90 px-4 py-2 text-sm font-black text-slate-900 hover:bg-white"
                }
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}