"use client";

import { useLanguage, type Lang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getPublicLabels } from "@/lib/getPublicLabels";

const languages: Lang[] = ["hu", "en", "de", "fr"];

export default function PublicHeader() {
  const { lang, setLang } = useLanguage();
  const { user, logout } = useAuth();

  const labels = getPublicLabels(lang);

  function changeLanguage(item: Lang) {
    setLang(item);
    localStorage.setItem("lang", item);
    window.dispatchEvent(new Event("language-change"));
  }

  return (
    <header className="border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="/" className="text-xl font-bold tracking-tight">
          {labels.platformName}
        </a>

        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-6 text-sm text-neutral-300">
            <a href="/contradictions" className="hover:text-white">
              {labels.contradictions}
            </a>

            <a href="/topics" className="hover:text-white">
              {labels.topics}
            </a>

            <a href="/politicians" className="hover:text-white">
              {labels.politicians}
            </a>

            <a href="/admin" className="hover:text-white">
              Admin
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {languages.map((item) => (
              <button
                key={item}
                onClick={() => changeLanguage(item)}
                className={`rounded-lg px-2 py-1 text-xs font-bold uppercase transition ${
                  lang === item
                    ? "bg-white text-black"
                    : "bg-white/10 text-neutral-300 hover:bg-white/20"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-300">{user.email}</span>

              <button
                onClick={logout}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                {labels.logout}
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            >
              {labels.login}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}