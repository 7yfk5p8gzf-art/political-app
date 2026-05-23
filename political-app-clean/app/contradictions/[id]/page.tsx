"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import EvidenceQuoteCard from "@/components/public/EvidenceQuoteCard";

import PublicShell from "@/components/public/PublicShell";
import ShareButtons from "@/components/public/ShareButtons";
import VoteSection from "@/components/public/VoteSection";
import RelatedContradictions from "@/components/public/RelatedContradictions";
import SourceCards from "@/components/public/SourceCards";
import AIAnalysisCard from "@/components/public/AIAnalysisCard";
import TimelineBlock from "@/components/public/TimelineBlock";
import VideoEmbed from "@/components/public/VideoEmbed";

import { supabase } from "@/lib/supabase";
import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";
import {
  getTranslatedNewStatement,
  getTranslatedOldStatement,
  getTranslatedSummary,
  getTranslatedTopic,
  type PublicLang,
} from "@/lib/publicTranslations";

type Contradiction = {
  id: string;
  slug: string | null;
  politician: string | null;

  topic: string | null;
  topic_hu: string | null;
  topic_de: string | null;
  topic_en: string | null;
  topic_fr: string | null;

  old_statement: string | null;
  old_statement_hu: string | null;
  old_statement_de: string | null;
  old_statement_en: string | null;
  old_statement_fr: string | null;

  new_statement: string | null;
  new_statement_hu: string | null;
  new_statement_de: string | null;
  new_statement_en: string | null;
  new_statement_fr: string | null;

  ai_summary: string | null;
  ai_summary_hu: string | null;
  ai_summary_de: string | null;
  ai_summary_en: string | null;
  ai_summary_fr: string | null;

  old_date: string | null;
  new_date: string | null;
  views: number | null;
  old_source: string | null;
  new_source: string | null;
  old_video_url: string | null;
  new_video_url: string | null;
  confidence_score: number | null;
  severity_score: number | null;
  review_status: string | null;
  transcript_quote?: string | null;
timestamp?: string | null;
quote_precision?: string | null;
old_transcript_quote?: string | null;
old_timestamp?: string | null;
old_quote_precision?: string | null;

new_transcript_quote?: string | null;
new_timestamp?: string | null;
new_quote_precision?: string | null;
};

export default function ContradictionDetailPage() {
  const params = useParams();

  const lang = usePublicLanguage() as PublicLang;
  const labels = getPublicLabels(lang);

  const [item, setItem] = useState<Contradiction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, []);

  async function loadItem() {
    setLoading(true);

    const rawId = String(params.id || "");
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        rawId
      );

    let query = supabase
      .from("contradictions")
      .select(`
        id,
        slug,
        politician,

        topic,
        topic_hu,
        topic_de,
        topic_en,
        topic_fr,

        old_statement,
        old_statement_hu,
        old_statement_de,
        old_statement_en,
        old_statement_fr,

        new_statement,
        new_statement_hu,
        new_statement_de,
        new_statement_en,
        new_statement_fr,

        ai_summary,
        ai_summary_hu,
        ai_summary_de,
        ai_summary_en,
        ai_summary_fr,

        old_date,
        new_date,
        views,
        old_source,
        new_source,
        old_video_url,
        new_video_url,
        confidence_score,
        severity_score,
        review_status
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
      setItem(data as Contradiction | null);

      if (data?.id) {
        await supabase
          .from("contradictions")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", data.id);
      }
    }

    setLoading(false);
  }

  const translatedTopic = item ? getTranslatedTopic(item, lang) : null;
  const translatedOldStatement = item
    ? getTranslatedOldStatement(item, lang)
    : null;
  const translatedNewStatement = item
    ? getTranslatedNewStatement(item, lang)
    : null;
  const translatedSummary = item ? getTranslatedSummary(item, lang) : null;

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
          url={`/contradictions/${item.slug || item.id}`}
          title={`${item.politician || labels.politician} - ${
            translatedTopic || labels.contradictionTitle
          }`}
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
              {labels.loading}
            </p>
          </div>
        ) : !item ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
            <p className="text-red-700 dark:text-red-300">
              {labels.noResults}
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

              {translatedTopic && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {translatedTopic}
                </span>
              )}

              {typeof item.views === "number" && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {item.views} {labels.views}
                </span>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-6xl">
              {item.politician || labels.contradictionTitle}

              {translatedTopic ? (
                <span className="block text-blue-600 dark:text-blue-400">
                  {translatedTopic}
                </span>
              ) : null}
            </h1>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {labels.old}
                </p>

                <p className="text-sm leading-7 text-slate-900 dark:text-white">
                  {translatedOldStatement || labels.noOldStatement}
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
                  {translatedNewStatement || labels.noNewStatement}
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
              oldStatement={translatedOldStatement}
              newStatement={translatedNewStatement}
            />

            <AIAnalysisCard
              summary={translatedSummary}
              confidenceScore={item.confidence_score}
              severityScore={item.severity_score}
              reviewStatus={item.review_status}
            />

            <VideoEmbed
  oldUrl={item.old_video_url}
  newUrl={item.new_video_url}
  oldTitle={`${item.politician || labels.politician} - korábbi videó`}
  newTitle={`${item.politician || labels.politician} - új videó`}
/>
<EvidenceQuoteCard
  oldQuote={item.old_transcript_quote}
oldTimestamp={item.old_timestamp}
oldPrecision={item.old_quote_precision}

newQuote={item.new_transcript_quote}
newTimestamp={item.new_timestamp}
newPrecision={item.new_quote_precision}
/>

            <SourceCards
              oldSource={item.old_source}
              newSource={item.new_source}
              oldVideoUrl={item.old_video_url}
              newVideoUrl={item.new_video_url}
            />

            <VoteSection contradictionId={item.id} />

            <RelatedContradictions
              currentId={item.id}
              politician={item.politician}
              topic={getTranslatedTopic(item, lang as PublicLang)}
            />
          </article>
        )}
      </section>
    </PublicShell>
  );
}