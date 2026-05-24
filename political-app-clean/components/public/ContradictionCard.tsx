"use client";

import Link from "next/link";
import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";
import { publicStyles } from "@/lib/publicStyles";

type Lang = "hu" | "de" | "en" | "fr";

type ContradictionCardProps = {
  id: string;
  politician: string | null;
  topic: string | null;
  oldStatement: string | null;
  newStatement: string | null;
};

export default function ContradictionCard({
  id,
  politician,
  topic,
  oldStatement,
  newStatement,
}: ContradictionCardProps) {
  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

  return (
    <Link
      href={`/contradictions/${id}`}
      className={`${publicStyles.card} block transition hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <span className={publicStyles.badge}>
          {politician || labels.unknownPolitician}
        </span>

        <span className={publicStyles.badge}>
          {topic || labels.noTopic}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {labels.old}
          </p>

          <p className="line-clamp-5 text-sm leading-7 text-slate-900 dark:text-white">
            {oldStatement || labels.noOldStatement}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {labels.new}
          </p>

          <p className="line-clamp-5 text-sm leading-7 text-slate-900 dark:text-white">
            {newStatement || labels.noNewStatement}
          </p>
        </div>
      </div>
    </Link>
  );
}