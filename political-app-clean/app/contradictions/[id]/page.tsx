"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PublicShell from "@/components/public/PublicShell";
import { supabase } from "@/lib/supabase";
import ShareButtons from "@/components/public/ShareButtons";
import VoteSection from "@/components/public/VoteSection";
import RelatedContradictions from "@/components/public/RelatedContradictions";
import SourceCards from "@/components/public/SourceCards";
import AIAnalysisCard from "@/components/public/AIAnalysisCard";
import TimelineBlock from "@/components/public/TimelineBlock";
import VideoEmbed from "@/components/public/VideoEmbed";

import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";


type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
  ai_summary: string | null;
  views: number | null;
  old_source: string | null;
new_source: string | null;
old_video_url: string | null;
new_video_url: string | null;
confidence_score: number | null;
severity_score: number | null;
review_status: string | null;
};

export default function ContradictionDetailPage() {
  const params = useParams();

  const [item, setItem] = useState<Contradiction | null>(null);
const [loading, setLoading] = useState(true);
const lang = usePublicLanguage();

useEffect(() => {
  loadItem();
}, []);

  async function loadItem() {
  setLoading(true);
  const rawId = String(params.id || "");
const isUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);

  let query = supabase
  .from("contradictions")
  .select(`
    old_source,
    confidence_score,
    severity_score,
    review_status,
    new_source,
    old_video_url,
    new_video_url,
    id,
    politician,
    topic,
    old_statement,
    new_statement,
    old_date,
    new_date,
    ai_summary,
    views
  `);

if (isUuid) {
  query = query.eq("id", rawId);
} else {
  query = query.eq("slug", rawId);
}

const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Contradiction detail load error:", error.message);
      setItem(null);
    } else {
      setItem(data);
      if (data?.id) {
  await supabase
    .from("contradictions")
    .update({ views: (data.views || 0) + 1 })
    .eq("id", data.id);
}
    }

    setLoading(false);
  }
  
  const labels = getPublicLabels(lang);

  return (
    <PublicShell
  title={
    item?.politician
      ? `${item.politician} - ${labels.contradictionTitle}`
      : labels.contradictionTitle
  }
>
      {item && (
  <ShareButtons
    url={`/contradictions/${item.id}`}
    title={`${item.politician || "Politician"} - ${item.topic || "Contradiction"}`}
  />
)}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <Link
          href="/contradictions"
          className="inline-flex items-center text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          ← {labels.backToContradictions}
        </Link>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-slate-600 dark:text-slate-300">
              Betöltés...
            </p>
          </div>
        ) : !item ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
            <p className="text-red-700 dark:text-red-300">
              Nem található az oldal.
            </p>
          </div>
        ) : (
          <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap gap-2">
              {item.politician && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {item.politician}
                </span>
              )}

              {item.topic && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {item.topic}
                </span>
              )}

              {typeof item.views === "number" && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {item.views} {labels.views}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
  {item?.politician || labels.contradictionTitle}

  {item?.topic ? (
    <span className="block text-blue-400">
      {item.topic}
    </span>
  ) : null}
</h1>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {labels.old}
                </p>

                <p className="text-sm leading-7 text-slate-900 dark:text-white">
                  {item.old_statement || "Nincs régi állítás."}
                </p>

                {item.old_date && (
                  <p className="mt-4 text-xs text-slate-500">
                    {item.old_date}
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {labels.new}
                </p>

                <p className="text-sm leading-7 text-slate-900 dark:text-white">
                  {item.new_statement || "Nincs új állítás."}
                </p>

                {item.new_date && (
                  <p className="mt-4 text-xs text-slate-500">
                    {item.new_date}
                  </p>
                )}
              </div>
            </div>
            <TimelineBlock
  oldDate={item.old_date}
  newDate={item.new_date}
  oldStatement={item.old_statement}
  newStatement={item.new_statement}
/>

            <AIAnalysisCard
  summary={item.ai_summary}
  confidenceScore={item.confidence_score}
  severityScore={item.severity_score}
  reviewStatus={item.review_status}
/>
<VideoEmbed
  url={item.new_video_url || item.old_video_url}
  title={`${item.politician || "Politician"} video evidence`}
/>
            <SourceCards
  oldSource={item.old_source}
  newSource={item.new_source}
  oldVideoUrl={item.old_video_url}
  newVideoUrl={item.new_video_url}
/>
            {item.id && (
  <VoteSection contradictionId={item.id} />
)}


<RelatedContradictions
  currentId={item.id}
  politician={item.politician}
  topic={item.topic}
/>
          </article>
        )}
      </section>
    </PublicShell>
  );
}