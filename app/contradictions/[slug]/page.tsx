"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, saveLang, t, type Lang } from "@/lib/i18n";
import FloatingShareSidebar from "../../../src/components/FloatingShareSidebar";
import AiAnalysisCard from "@/components/public/AiAnalysisCard";
import SourceCards from "@/components/public/SourceCards";
import VoteSection from "@/components/public/VoteSection";
import RelatedContradictions from "@/components/public/RelatedContradictions";

type Item = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  language: string | null;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
  old_source: string | null;
  new_source: string | null;
  old_video_url: string | null;
  new_video_url: string | null;
  ai_summary: string | null;
  ai_summary_hu: string | null;
  ai_summary_de: string | null;
  ai_summary_en: string | null;
  ai_summary_fr: string | null;
  status: string | null;
  confidence_score?: number | null;
severity_score?: number | null;
review_status?: string | null;
timeline_data?: any;
draft_data?: any;
  views?: number | null;
  
};

type RelatedItem = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
  views: number | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
  vote_type: "yes" | "no";
};

const labels = {
  hu: {
    back: "Vissza",
    noTopic: "Nincs téma",
    unknown: "Ismeretlen",
    topic: "téma",
    lead: "Régi és új állítás összehasonlítása dátummal, forrással, videóval, AI-elemzéssel és közösségi szavazással.",
    oldTimeline: "RÉGEN",
    newTimeline: "MOST",
    noOldStatement: "Nincs régi állítás",
    noNewStatement: "Nincs új állítás",
    noAi: "Ehhez még nincs AI elemzés.",
    noSource: "Nincs forrás megadva.",
    notFoundText: "Lehet, hogy még draft/review státuszban van, vagy törölve lett.",
    voteError: "Szavazási hiba: ",
    copied: "Link kimásolva",
    shareTextFallbackPolitician: "Politikus",
    shareTextFallbackTopic: "ellentmondás",
    shareText: "régen mást mondott, mint most?",
    videoEvidence: "🎥 Videós bizonyíték",
    related: "Kapcsolódó ellentmondások",
    views: "megtekintés",
  },
  de: {
    back: "Zurück",
    noTopic: "Kein Thema",
    unknown: "Unbekannt",
    topic: "Thema",
    lead: "Vergleich früherer und aktueller Aussagen mit Datum, Quelle, Video, KI-Analyse und Community-Abstimmung.",
    oldTimeline: "FRÜHER",
    newTimeline: "JETZT",
    noOldStatement: "Keine frühere Aussage",
    noNewStatement: "Keine neue Aussage",
    noAi: "Dazu gibt es noch keine KI-Analyse.",
    noSource: "Keine Quelle angegeben.",
    notFoundText: "Möglicherweise ist der Beitrag noch im Draft/Review-Status oder wurde gelöscht.",
    voteError: "Fehler bei der Abstimmung: ",
    copied: "Link kopiert",
    shareTextFallbackPolitician: "Politiker",
    shareTextFallbackTopic: "Widerspruch",
    shareText: "hat früher etwas anderes gesagt als heute?",
    videoEvidence: "🎥 Video-Beweis",
    related: "Verwandte Widersprüche",
    views: "Aufrufe",
  },
  en: {
    back: "Back",
    noTopic: "No topic",
    unknown: "Unknown",
    topic: "topic",
    lead: "Comparison of old and new statements with dates, sources, video, AI analysis and community voting.",
    oldTimeline: "BEFORE",
    newTimeline: "NOW",
    noOldStatement: "No old statement",
    noNewStatement: "No new statement",
    noAi: "There is no AI analysis for this yet.",
    noSource: "No source provided.",
    notFoundText: "It may still be in draft/review status or it may have been deleted.",
    voteError: "Voting error: ",
    copied: "Link copied",
    shareTextFallbackPolitician: "Politician",
    shareTextFallbackTopic: "contradiction",
    shareText: "did they say something different before than now?",
    videoEvidence: "🎥 Video evidence",
    related: "Related contradictions",
    views: "views",
  },
  fr: {
    back: "Retour",
    noTopic: "Aucun sujet",
    unknown: "Inconnu",
    topic: "sujet",
    lead: "Comparaison des anciennes et nouvelles déclarations avec date, source, vidéo, analyse IA et vote communautaire.",
    oldTimeline: "AVANT",
    newTimeline: "MAINTENANT",
    noOldStatement: "Aucune ancienne déclaration",
    noNewStatement: "Aucune nouvelle déclaration",
    noAi: "Il n’y a pas encore d’analyse IA pour ce cas.",
    noSource: "Aucune source indiquée.",
    notFoundText: "Le contenu est peut-être encore en brouillon/revue ou a été supprimé.",
    voteError: "Erreur de vote : ",
    copied: "Lien copié",
    shareTextFallbackPolitician: "Politicien",
    shareTextFallbackTopic: "contradiction",
    shareText: "a-t-il dit autre chose avant que maintenant ?",
    videoEvidence: "🎥 Preuve vidéo",
    related: "Contradictions liées",
    views: "vues",
  },
};

export default function ContradictionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [item, setItem] = useState<Item | null>(null);
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [lang, setLang] = useState<Lang>("hu");

  useEffect(() => {
    setLang(detectBrowserLang());
    load();
  }, [slug]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contradictions")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) {
      console.error(error);
      setItem(null);
      setLoading(false);
      return;
    }

    setItem(data);

    await supabase
      .from("contradictions")
      .update({
        views: (data.views || 0) + 1,
      })
      .eq("id", data.id);

    const { data: voteData } = await supabase
      .from("contradiction_votes")
      .select("*")
      .eq("contradiction_id", data.id);

    setVotes((voteData || []) as Vote[]);

    const { data: relatedData } = await supabase
      .from("contradictions")
      .select("id, slug, politician, topic, old_statement, new_statement, views")
      .eq("status", "published")
      .is("deleted_at", null)
      .neq("id", data.id)
      .limit(50);

    const related = ((relatedData || []) as RelatedItem[])
      .filter((relatedItem) => {
        const samePolitician =
          relatedItem.politician &&
          data.politician &&
          relatedItem.politician === data.politician;

        const sameTopic =
          relatedItem.topic && data.topic && relatedItem.topic === data.topic;

        return samePolitician || sameTopic;
      })
      .slice(0, 4);

    setRelatedItems(related);

    const localVote = localStorage.getItem(`vote_${data.id}`);
    setVoted(Boolean(localVote));

    setLoading(false);
  }

  async function vote(type: "yes" | "no") {
    if (!item || voted) return;

    const { error } = await supabase.from("contradiction_votes").insert({
      contradiction_id: item.id,
      vote_type: type,
    });

    if (error) {
      alert(labels[lang].voteError + error.message);
      return;
    }

    localStorage.setItem(`vote_${item.id}`, type);
    setVoted(true);
    await load();
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert(labels[lang].copied);
  }

  function getShareText() {
    return `${item?.politician || labels[lang].shareTextFallbackPolitician} – ${
      item?.topic || labels[lang].shareTextFallbackTopic
    }: ${labels[lang].shareText}`;
  }

  function shareUrl(
    platform: "x" | "facebook" | "whatsapp" | "telegram" | "reddit"
  ) {
    const publicUrl = `https://political-app-six.vercel.app/contradictions/${slug}`;
    const url = encodeURIComponent(publicUrl);
    const text = encodeURIComponent(getShareText());

    const links = {
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${text}`,
    };

    window.open(links[platform], "_blank", "noopener,noreferrer");
  }

  function getYouTubeEmbedUrl(url: string | null) {
    if (!url) return null;

    try {
      const u = new URL(url);

      let videoId = "";
      let start = "";

      if (u.hostname.includes("youtube.com")) {
        videoId = u.searchParams.get("v") || "";
        start = u.searchParams.get("t") || u.searchParams.get("start") || "";
      }

      if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.replace("/", "");
        start = u.searchParams.get("t") || u.searchParams.get("start") || "";
      }

      if (!videoId) return null;

      return `https://www.youtube.com/embed/${videoId}${
        start ? `?start=${start.replace("s", "")}` : ""
      }`;
    } catch {
      return null;
    }
  }

  function getAiSummary(item: Item, lang: Lang) {
    if (lang === "de") return item.ai_summary_de || item.ai_summary;
    if (lang === "en") return item.ai_summary_en || item.ai_summary;
    if (lang === "fr") return item.ai_summary_fr || item.ai_summary;

    return item.ai_summary_hu || item.ai_summary;
  }
  function getDynamicLabels(item: Item) {
  const labels = [];

  if ((item.severity_score || 0) > 70) {
    labels.push("High Severity");
  }

  if ((item.confidence_score || 0) > 60) {
    labels.push("Strong AI Confidence");
  }

  if (item.timeline_data?.timeline_nodes?.length > 0) {
    labels.push("Timeline Evolution");
  }

  if (
    String(item.old_statement || "")
      .toLowerCase()
      .includes("support") &&
    String(item.new_statement || "")
      .toLowerCase()
      .includes("oppose")
  ) {
    labels.push("Ideological Reversal");
  }

  return labels;
}

  const oldEmbedUrl = getYouTubeEmbedUrl(item?.old_video_url || null);
  const newEmbedUrl = getYouTubeEmbedUrl(item?.new_video_url || null);

  const totalVotes = votes.length;
  const yesVotes = votes.filter((v) => v.vote_type === "yes").length;
  const noVotes = totalVotes - yesVotes;
  const yesPercent = totalVotes ? Math.round((yesVotes / totalVotes) * 100) : 0;
  const noPercent = totalVotes ? 100 - yesPercent : 0;

  if (loading) {
    return (
      <main style={pageStyle}>
  <FloatingShareSidebar />
  <section style={containerStyle}>{t[lang].loading}</section>
</main>
    );
  }

  if (!item) {
    return (
      <main style={pageStyle}>
        <FloatingShareSidebar />
        <section style={containerStyle}>
          <a href="/contradictions" style={backStyle}>
            ← {labels[lang].back}
          </a>

          <div style={emptyCardStyle}>
            <h1>{t[lang].notFound}</h1>
            <p>{labels[lang].notFoundText}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <div style={topRowStyle}>
          <a href="/contradictions" style={backStyle}>
            ← {labels[lang].back}
          </a>

          <div style={langSwitcherStyle}>
            {(["hu", "de", "en", "fr"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  saveLang(l);
                }}
                style={lang === l ? activeLangButtonStyle : langButtonStyle}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

<FloatingShareSidebar />
        <header style={heroStyle}>
          <div style={badgeRowStyle}>
            <span style={darkBadgeStyle}>{item.topic || labels[lang].noTopic}</span>
            <span style={lightBadgeStyle}>
              {(item.language || lang).toUpperCase()}
            </span>
          </div>

          <h1 style={titleStyle}>
            {item.politician || labels[lang].unknown} –{" "}
            {item.topic || labels[lang].topic}
          </h1>

          <p style={leadStyle}>{labels[lang].lead}</p>

          <div style={viewCounterStyle}>
            👀 {item.views || 0} {labels[lang].views}
          </div>

          
        </header>

        <section style={timelineCardStyle}>
          <div style={timelineLineStyle} />

          <div style={timelineItemStyle}>
            <div style={timelineDotOldStyle}>1</div>
            <div>
              <div style={timelineLabelStyle}>{labels[lang].oldTimeline}</div>
              <div style={timelineDateStyle}>
                {item.old_date || t[lang].unknownDate}
              </div>
              <p style={timelineTextStyle}>
                {item.old_statement || labels[lang].noOldStatement}
              </p>
            </div>
          </div>

          <div style={timelineItemStyle}>
            <div style={timelineDotNewStyle}>2</div>
            <div>
              <div style={timelineLabelStyle}>{labels[lang].newTimeline}</div>
              <div style={timelineDateStyle}>
                {item.new_date || t[lang].unknownDate}
              </div>
              <p style={timelineTextStyle}>
                {item.new_statement || labels[lang].noNewStatement}
              </p>
            </div>
          </div>
        </section>

        <section style={compareGridStyle}>
          <article style={oldCardStyle}>
            <div style={kickerStyle}>{t[lang].old}</div>
            <div style={dateStyle}>{item.old_date || t[lang].unknownDate}</div>
            <p style={statementStyle}>
              {item.old_statement || labels[lang].noOldStatement}
            </p>

            {item.old_source && (
              <a href={item.old_source} target="_blank" style={sourceButtonStyle}>
                {t[lang].openOldSource} →
              </a>
            )}

            {item.old_video_url && (
              <a href={item.old_video_url} target="_blank" style={videoButtonStyle}>
                {t[lang].openOldVideo} →
              </a>
            )}

            {oldEmbedUrl && (
              <>
                <div style={videoLabelStyle}>🎥 {labels[lang].videoEvidence}</div>
                <iframe src={oldEmbedUrl} style={videoFrameStyle} allowFullScreen />
              </>
            )}
          </article>

          <article style={newCardStyle}>
            <div style={kickerStyle}>{t[lang].now}</div>
            <div style={dateStyle}>{item.new_date || t[lang].unknownDate}</div>
            <p style={statementStyle}>
              {item.new_statement || labels[lang].noNewStatement}
            </p>

            {item.new_source && (
              <a href={item.new_source} target="_blank" style={sourceButtonStyle}>
                {t[lang].openNewSource} →
              </a>
            )}

            {item.new_video_url && (
              <a href={item.new_video_url} target="_blank" style={videoButtonStyle}>
                {t[lang].openNewVideo} →
              </a>
            )}

            {newEmbedUrl && (
              <>
                <div style={videoLabelStyle}>🎥 {labels[lang].videoEvidence}</div>
                <iframe src={newEmbedUrl} style={videoFrameStyle} allowFullScreen />
              </>
            )}
          </article>
        </section>

        <AiAnalysisCard
  summary={getAiSummary(item, lang) || labels[lang].noAi}
/>
          
 
        </section>

        <SourceCards
  oldSource={item.old_source}
  newSource={item.new_source}
/>

        <RelatedContradictions
  items={relatedItems}
/>

        <VoteSection
  yesPercent={yesPercent}
  noPercent={noPercent}
  totalVotes={totalVotes}
  voted={voted}
  onVote={vote}
/>
          
      
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  color: "#0f172a",
  padding: "32px 18px",
};

const containerStyle: CSSProperties = {
  maxWidth: 1080,
  margin: "0 auto",
};

const topRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginBottom: 22,
  flexWrap: "wrap",
};

const backStyle: CSSProperties = {
  color: "#0f172a",
  fontWeight: 800,
  textDecoration: "none",
};

const langSwitcherStyle: CSSProperties = {
  display: "flex",
  gap: 6,
};

const langButtonStyle: CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #111827",
  background: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const activeLangButtonStyle: CSSProperties = {
  ...langButtonStyle,
  background: "#111827",
  color: "white",
};

const heroStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 28,
  marginBottom: 22,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 14,
  flexWrap: "wrap",
};

const darkBadgeStyle: CSSProperties = {
  background: "#0f172a",
  color: "white",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
};

const lightBadgeStyle: CSSProperties = {
  background: "#e2e8f0",
  color: "#0f172a",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
};

const titleStyle: CSSProperties = {
  fontSize: 46,
  lineHeight: 1.05,
  margin: "0 0 12px",
  fontWeight: 900,
};

const leadStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.55,
  color: "#475569",
  maxWidth: 820,
  marginBottom: 16,
};

const shareRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 16,
};

const shareButtonStyle: CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #0f172a",
  borderRadius: 10,
  background: "white",
  color: "#0f172a",
  cursor: "pointer",
  fontWeight: 800,
};

const compareGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 18,
  marginBottom: 22,
};

const oldCardStyle: CSSProperties = {
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  borderRadius: 18,
  padding: 22,
};

const newCardStyle: CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  borderRadius: 18,
  padding: 22,
};

const kickerStyle: CSSProperties = {
  fontSize: 13,
  letterSpacing: 1.5,
  fontWeight: 900,
  marginBottom: 10,
};

const dateStyle: CSSProperties = {
  fontSize: 15,
  color: "#475569",
  fontWeight: 800,
  marginBottom: 12,
};

const statementStyle: CSSProperties = {
  fontSize: 23,
  lineHeight: 1.35,
  marginBottom: 18,
};

const sourceButtonStyle: CSSProperties = {
  display: "inline-block",
  padding: "10px 13px",
  background: "#0f172a",
  color: "white",
  borderRadius: 10,
  fontWeight: 800,
  textDecoration: "none",
  marginRight: 8,
};

const videoButtonStyle: CSSProperties = {
  ...sourceButtonStyle,
  background: "#7c3aed",
};

const videoFrameStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  border: "none",
  borderRadius: 14,
  marginTop: 14,
};

const analysisCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderLeft: "6px solid #991b1b",
  borderRadius: 18,
  padding: 24,
  marginBottom: 22,
};

const analysisTextStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.7,
  margin: 0,
};

const sourcesCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
  marginBottom: 22,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 26,
  marginTop: 0,
  marginBottom: 16,
  fontWeight: 900,
};

const sourceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
};

const sourceMiniCardStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 16,
};

const mutedTextStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.5,
};

const plainLinkStyle: CSSProperties = {
  color: "#0f172a",
  fontWeight: 900,
};

const relatedCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
  marginBottom: 22,
};

const relatedGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
};

const relatedItemStyle: CSSProperties = {
  display: "block",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 16,
  textDecoration: "none",
  color: "#0f172a",
};

const relatedMetaStyle: CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  fontWeight: 800,
  marginBottom: 8,
};

const relatedTitleStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.45,
  fontWeight: 900,
};

const relatedViewsStyle: CSSProperties = {
  marginTop: 10,
  fontSize: 13,
  color: "#64748b",
  fontWeight: 800,
};

const voteCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
};

const voteTextStyle: CSSProperties = {
  fontWeight: 800,
  color: "#334155",
};

const progressOuterStyle: CSSProperties = {
  height: 12,
  background: "#e5e7eb",
  borderRadius: 999,
  overflow: "hidden",
  marginBottom: 16,
};

const progressInnerStyle: CSSProperties = {
  height: "100%",
  background: "#16a34a",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const voteYesButtonStyle: CSSProperties = {
  padding: "11px 16px",
  border: "none",
  borderRadius: 10,
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const voteNoButtonStyle: CSSProperties = {
  padding: "11px 16px",
  border: "1px solid #0f172a",
  borderRadius: 10,
  background: "white",
  color: "#0f172a",
  cursor: "pointer",
  fontWeight: 900,
};

const disabledButtonStyle: CSSProperties = {
  padding: "11px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "#e5e7eb",
  color: "#64748b",
  cursor: "not-allowed",
  fontWeight: 900,
};

const thanksStyle: CSSProperties = {
  marginTop: 12,
  color: "#166534",
  fontWeight: 800,
};

const emptyCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 28,
};

const timelineCardStyle: CSSProperties = {
  position: "relative",
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
  marginBottom: 22,
  overflow: "hidden",
};

const timelineLineStyle: CSSProperties = {
  position: "absolute",
  left: 38,
  top: 34,
  bottom: 34,
  width: 3,
  background: "#cbd5e1",
};

const timelineItemStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "48px 1fr",
  gap: 14,
  marginBottom: 22,
  zIndex: 1,
};

const timelineDotOldStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "#4f46e5",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const timelineDotNewStyle: CSSProperties = {
  ...timelineDotOldStyle,
  background: "#16a34a",
};

const timelineLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const timelineDateStyle: CSSProperties = {
  color: "#64748b",
  fontWeight: 800,
  marginTop: 4,
  marginBottom: 8,
};

const timelineTextStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.55,
  margin: 0,
};

const videoLabelStyle: CSSProperties = {
  marginTop: 14,
  marginBottom: 8,
  fontWeight: 900,
  color: "#334155",
  fontSize: 14,
};

const viewCounterStyle: CSSProperties = {
  marginTop: 10,
  fontWeight: 800,
  color: "#475569",
};