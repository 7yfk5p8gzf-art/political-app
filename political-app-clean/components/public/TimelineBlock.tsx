"use client";

import { useEffect, useState } from "react";
import { detectBrowserLanguage, getPublicLabels } from "@/lib/getPublicLabels";

type TimelineBlockProps = {
  oldDate?: string | null;
  newDate?: string | null;
  oldStatement?: string | null;
  newStatement?: string | null;
};

export default function TimelineBlock({
  oldDate,
  newDate,
  oldStatement,
  newStatement,
}: TimelineBlockProps) {
    const [lang, setLang] = useState("en");

useEffect(() => {
  setLang(detectBrowserLanguage());

  function handleLanguageChange() {
    setLang(detectBrowserLanguage());
  }

  window.addEventListener("language-change", handleLanguageChange);

  return () => {
    window.removeEventListener("language-change", handleLanguageChange);
  };
}, []);

const labels = getPublicLabels(lang);
  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Timeline
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
        {labels.timeline}
        </h2>
      </div>

      <div className="relative border-l border-slate-700 pl-6">
        <div className="relative pb-10">
          <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-600 ring-4 ring-slate-950" />

          <p className="text-xs uppercase tracking-wide text-slate-500">
            {labels.old}
          </p>

          {oldDate && (
            <p className="mt-1 text-sm font-semibold text-blue-400">
              {oldDate}
            </p>
          )}

          <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm leading-7 text-slate-300">
              {oldStatement || "{oldStatement || labels.noSource}"}
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-red-500 ring-4 ring-slate-950" />

          <p className="text-xs uppercase tracking-wide text-slate-500">
            {labels.new}
          </p>

          {newDate && (
            <p className="mt-1 text-sm font-semibold text-red-400">
              {newDate}
            </p>
          )}

          <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm leading-7 text-slate-300">
              {newStatement || "{newStatement || labels.noSource}"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}