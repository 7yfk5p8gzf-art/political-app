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
import StatementCards from "@/components/public/StatementCards";
import StatementTimeline from "@/components/public/StatementTimeline";
import PublicPageShell from "@/components/public/PublicPageShell";
import DetailHero from "@/components/public/detail/DetailHero";
import DetailTopBar from "@/components/public/detail/DetailTopBar";
import DetailTimeline from "@/components/public/detail/DetailTimeline";
import DetailStatementCards from "@/components/public/detail/DetailStatementCards";
import DetailAiAnalysis from "@/components/public/detail/DetailAiAnalysis";
import DetailSources from "@/components/public/detail/DetailSources";

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
    <PublicPageShell>
      <FloatingShareSidebar />
      <section style={containerStyle}>{t[lang].loading}</section>
    </PublicPageShell>
  );
}

  if (!item) {
  return (
    <PublicPageShell>
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
      </PublicPageShell>
    );
  }

  return (
  <PublicPageShell>
      <section style={containerStyle}>
        <DetailTopBar
  lang={lang}
  backLabel={labels[lang].back}
  onLangChange={setLang}
/>
<DetailHero
  topic={item.topic || labels[lang].noTopic}
  language={item.language || lang}
  title={`${item.politician || labels[lang].unknown} – ${
    item.topic || labels[lang].topic
  }`}
  lead={labels[lang].lead}
  views={item.views || 0}
  viewsLabel={labels[lang].views}
/>

        

        <DetailTimeline
  oldLabel={labels[lang].oldTimeline}
  newLabel={labels[lang].newTimeline}
  oldDate={item.old_date}
  newDate={item.new_date}
  oldStatement={item.old_statement}
  newStatement={item.new_statement}
/>

        <DetailStatementCards
  oldLabel={labels[lang].oldTimeline}
  newLabel={labels[lang].newTimeline}
  oldStatement={item.old_statement}
  newStatement={item.new_statement}
  noOldStatement={labels[lang].noOldStatement}
  noNewStatement={labels[lang].noNewStatement}
/>
<DetailAiAnalysis
  summary={getAiSummary(item, lang) || labels[lang].noAi}
/>

<DetailSources
  oldSource={item.old_source}
  newSource={item.new_source}
  oldLabel={labels[lang].oldTimeline}
  newLabel={labels[lang].newTimeline}
  noSourceLabel={labels[lang].noSource}
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

</section>
</PublicPageShell>
);
}



const containerStyle: CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
};

const topRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "center",
  marginBottom: 26,
  flexWrap: "wrap",
};;

const backStyle: CSSProperties = {
  color: "#0f172a",
  fontWeight: 900,
  textDecoration: "none",
  fontSize: 15,
  opacity: 0.82,
  transition: "opacity 0.2s ease",
};

const langSwitcherStyle: CSSProperties = {
  display: "flex",
  gap: 6,
};

const langButtonStyle: CSSProperties = {
  padding: "8px 13px",
  border: "1px solid rgba(148,163,184,0.35)",
  background: "rgba(255,255,255,0.7)",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
  color: "#334155",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  transition: "all 0.2s ease",
};

const activeLangButtonStyle: CSSProperties = {
  ...langButtonStyle,
  background:
    "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 12px 30px rgba(79,70,229,0.35)",
};

const heroStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(248,250,252,0.82))",
  border: "1px solid rgba(255,255,255,0.75)",
  borderRadius: 28,
  padding: 34,
  marginBottom: 26,
  boxShadow:
    "0 24px 70px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginBottom: 18,
  flexWrap: "wrap",
  alignItems: "center",
};

const darkBadgeStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
  color: "white",
  padding: "8px 14px",
  borderRadius: 999,
  fontSize: 12,
  letterSpacing: 0.6,
  fontWeight: 900,
  boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
};

const lightBadgeStyle: CSSProperties = {
  background: "rgba(255,255,255,0.7)",
  color: "#0f172a",
  padding: "8px 14px",
  borderRadius: 999,
  fontSize: 12,
  letterSpacing: 0.6,
  fontWeight: 900,
  border: "1px solid rgba(255,255,255,0.8)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const titleStyle: CSSProperties = {
  fontSize: "clamp(34px, 5vw, 58px)",
  lineHeight: 1.02,
  letterSpacing: "-1.8px",
  margin: "0 0 14px",
  fontWeight: 950,
};

const leadStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.65,
  color: "#475569",
  maxWidth: 860,
  margin: "0 0 18px",
};



const videoLabelStyle: CSSProperties = {
  marginTop: 14,
  marginBottom: 8,
  fontWeight: 900,
  color: "#334155",
  fontSize: 14,
};

const viewCounterStyle: CSSProperties = {
  marginTop: 14,
  fontWeight: 800,
  color: "#64748b",
  fontSize: 14,
  letterSpacing: 0.2,
};
const emptyCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 28,
};