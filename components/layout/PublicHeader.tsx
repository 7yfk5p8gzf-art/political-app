"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { detectBrowserLang, saveLang, type Lang } from "@/lib/i18n";

export default function PublicHeader() {
  const [lang, setLang] = useState<Lang>("hu");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLang(detectBrowserLang());
  }, []);

  function changeLang(nextLang: Lang) {
    setLang(nextLang);
    saveLang(nextLang);
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-50 mb-8 border-b border-slate-800 bg-slate-950/95 px-4 py-3 text-white shadow-lg shadow-slate-950/10 backdrop-blur md:rounded-2xl md:px-6">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4">
        <Link href="/" className="min-w-0" onClick={() => setOpen(false)}>
          <div className="truncate text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Political Intelligence</div>
          <div className="truncate text-lg font-black tracking-tight text-white md:text-xl">Contradiction Platform</div>
        </Link>

        <button type="button" aria-expanded={open} aria-controls="public-navigation" aria-label="Menü megnyitása" onClick={() => setOpen((value) => !value)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200 md:hidden">
          {open ? "Bezárás" : "Menü"}
        </button>

        <nav id="public-navigation" className={`${open ? "flex" : "hidden"} absolute left-3 right-3 top-[calc(100%+8px)] flex-col gap-1 rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-2xl md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          {[['/', 'Kezdőlap'], ['/contradictions', 'Ellentmondások'], ['/topics', 'Témák'], ['/politicians', 'Politikusok']].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-bold ${pathname === href || (href !== '/' && pathname.startsWith(href)) ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              {label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl bg-amber-400 px-4 py-2 text-center text-sm font-black text-slate-950 hover:bg-amber-300">Belépés</Link>
          <div className="flex gap-1 border-t border-slate-800 pt-2 md:ml-2 md:border-0 md:pt-0">
            {(["hu", "de", "en", "fr"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                aria-label={`Nyelv: ${l.toUpperCase()}`}
                onClick={() => changeLang(l)}
                className={
                  lang === l
                    ? "rounded-lg bg-amber-400 px-2.5 py-1.5 text-xs font-black text-slate-950"
                    : "rounded-lg px-2.5 py-1.5 text-xs font-black text-slate-400 hover:bg-white/10 hover:text-white"
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
