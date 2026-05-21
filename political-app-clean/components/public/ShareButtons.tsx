"use client";

import { useState } from "react";

import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Lang = "hu" | "de" | "en" | "fr";

type ShareButtonsProps = {
  url: string;
  title: string;
};

export default function ShareButtons({
  url,
  title,
}: ShareButtonsProps) {
  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-lg transition hover:scale-110"
        aria-label="Share on Facebook"
      >
        f
      </a>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-black font-bold text-white shadow-lg transition hover:scale-110"
        aria-label="Share on X"
      >
        X
      </a>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 font-bold text-white shadow-lg transition hover:scale-110"
        aria-label="Share on WhatsApp"
      >
        W
      </a>

      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-600 font-bold text-white shadow-lg transition hover:scale-110"
        aria-label="Share on Telegram"
      >
        T
      </a>

      <a
        href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-600 font-bold text-white shadow-lg transition hover:scale-110"
        aria-label="Share on Reddit"
      >
        R
      </a>

      <button
        onClick={copyLink}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-950 font-bold text-white shadow-lg transition hover:scale-110 dark:border-slate-600 dark:bg-white dark:text-slate-950"
        aria-label={labels.copyLink}
      >
        {copied ? "✓" : "⧉"}
      </button>
    </div>
  );
}