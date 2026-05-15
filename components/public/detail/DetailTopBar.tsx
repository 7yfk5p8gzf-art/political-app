import type { Lang } from "@/lib/i18n";
import { saveLang } from "@/lib/i18n";
import PublicButton from "../ui/PublicButton";

type Props = {
  lang: Lang;
  backLabel: string;
  onLangChange: (lang: Lang) => void;
};

export default function DetailTopBar({
  lang,
  backLabel,
  onLangChange,
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <PublicButton href="/contradictions" variant="secondary">
        ← {backLabel}
      </PublicButton>

      <div className="flex gap-2">
        {(["hu", "de", "en", "fr"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => {
              onLangChange(l);
              saveLang(l);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-black transition-all ${
              lang === l
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "bg-white/70 text-slate-800 ring-1 ring-slate-200 hover:bg-white"
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}