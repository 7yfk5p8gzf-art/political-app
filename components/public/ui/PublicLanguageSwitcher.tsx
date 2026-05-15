import type { Lang } from "@/lib/i18n";

type Props = {
  lang: Lang;
  onChange: (lang: Lang) => void;
};

export default function PublicLanguageSwitcher({
  lang,
  onChange,
}: Props) {
  return (
    <div className="flex gap-2">
      {(["hu", "de", "en", "fr"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={
            lang === l
              ? `
                rounded-xl
                bg-indigo-600
                px-4 py-2

                text-sm font-black text-white

                shadow-[0_10px_30px_rgba(79,70,229,0.35)]
              `
              : `
                rounded-xl
                border border-slate-300
                bg-white/80
                px-4 py-2

                text-sm font-black text-slate-800

                transition-all duration-300

                hover:bg-white
              `
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}