"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, saveLang, type Lang } from "@/lib/i18n";
import PublicPageShell from "@/components/public/PublicPageShell";

type Item = {
  id: string;
  slug: string;
  politician: string | null;
  topic: string | null;
  topic_hu?: string | null;
  topic_de?: string | null;
  topic_en?: string | null;
  topic_fr?: string | null;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
  ai_summary: string | null;
  ai_summary_hu?: string | null;
  ai_summary_de?: string | null;
  ai_summary_en?: string | null;
  ai_summary_fr?: string | null;
  language?: string | null;
  country?: string | null;
  published_at: string | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
  vote_type: "yes" | "no";
};

const labels = {
  hu: {
    profile: "Politikus profil",
    lead: "Publikált ellentmondások, témák, idővonal és közösségi aktivitás.",
    contradictions: "ellentmondás",
    topics: "téma",
    votes: "szavazat",
    latest: "Legutóbbi ellentmondások",
    noTopic: "Nincs téma",
    old: "RÉGEN",
    now: "MOST",
    open: "Megnyitás",
    unknown: "Ismeretlen",
    ai: "AI elemzés",
    according: "szerint ellentmondás",
    back: "Vissza",
    noItems: "Ehhez a politikushoz még nincs publikált ellentmondás.",
    all: "Összes",
    latestLabel: "Legutóbbi",
    loading: "Betöltés...",
  },
  de: {
    profile: "Politikerprofil",
    lead: "Veröffentlichte Widersprüche, Themen, Zeitlinie und Community-Aktivität.",
    contradictions: "Widersprüche",
    topics: "Themen",
    votes: "Stimmen",
    latest: "Neueste Widersprüche",
    noTopic: "Kein Thema",
    old: "FRÜHER",
    now: "JETZT",
    open: "Öffnen",
    unknown: "Unbekannt",
    ai: "KI-Analyse",
    according: "sehen darin einen Widerspruch",
    back: "Zurück",
    noItems: "Für diesen Politiker gibt es noch keine veröffentlichten Widersprüche.",
    all: "Alle",
    latestLabel: "Neueste",
    loading: "Wird geladen...",
  },
  en: {
    profile: "Politician profile",
    lead: "Published contradictions, topics, timeline and community activity.",
    contradictions: "contradictions",
    topics: "topics",
    votes: "votes",
    latest: "Latest contradictions",
    noTopic: "No topic",
    old: "BEFORE",
    now: "NOW",
    open: "Open",
    unknown: "Unknown",
    ai: "AI analysis",
    according: "see this as a contradiction",
    back: "Back",
    noItems: "There are no published contradictions for this politician yet.",
    all: "All",
    latestLabel: "Latest",
    loading: "Loading...",
  },
  fr: {
    profile: "Profil politique",
    lead: "Contradictions publiées, sujets, chronologie et activité communautaire.",
    contradictions: "contradictions",
    topics: "sujets",
    votes: "votes",
    latest: "Dernières contradictions",
    noTopic: "Aucun sujet",
    old: "AVANT",
    now: "MAINTENANT",
    open: "Ouvrir",
    unknown: "Inconnu",
    ai: "Analyse IA",
    according: "considèrent cela comme une contradiction",
    back: "Retour",
    noItems: "Aucune contradiction publiée pour ce politicien.",
    all: "Tous",
    latestLabel: "Dernier",
    loading: "Chargement...",
  },
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getTopic(item: Item, lang: Lang) {
  if (lang === "de") return item.topic_de || item.topic;
  if (lang === "en") return item.topic_en || item.topic;
  if (lang === "fr") return item.topic_fr || item.topic;
  return item.topic_hu || item.topic;
}

function getAiSummary(item: Item, lang: Lang) {
  if (lang === "de") return item.ai_summary_de || item.ai_summary;
  if (lang === "en") return item.ai_summary_en || item.ai_summary;
  if (lang === "fr") return item.ai_summary_fr || item.ai_summary;
  return item.ai_summary_hu || item.ai_summary;
}

export default function PoliticianProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [items, setItems] = useState<Item[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>("hu");
  const [activeTopic, setActiveTopic] = useState("all");

  useEffect(() => {
    setLang(detectBrowserLang());
    load();
  }, [slug]);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("contradictions")
      .select("*")
      .eq("status", "published");

    const filtered =
      data?.filter((item) => slugify(item.politician || "") === slug) || [];

    setItems(filtered as Item[]);

    const ids = filtered.map((i) => i.id);

    if (ids.length > 0) {
      const { data: voteData } = await supabase
        .from("contradiction_votes")
        .select("*")
        .in("contradiction_id", ids);

      setVotes((voteData || []) as Vote[]);
    } else {
      setVotes([]);
    }

    setLoading(false);
  }

  const politicianName = items[0]?.politician || labels[lang].unknown;

  const initials = politicianName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalVotes = votes.length;

  const topics = useMemo(() => {
    return Array.from(
      new Set(items.map((i) => getTopic(i, lang)).filter(Boolean))
    );
  }, [items, lang]);

  const filteredProfileItems = useMemo(() => {
    if (activeTopic === "all") return items;
    return items.filter((item) => getTopic(item, lang) === activeTopic);
  }, [items, activeTopic, lang]);

  const latestDate = items[0]?.published_at
    ? items[0].published_at.slice(0, 10)
    : "-";

  if (loading) {
    return (
      <PublicPageShell>
        <section style={containerStyle}>{labels[lang].loading}</section>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell>
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
                  setActiveTopic("all");
                }}
                style={lang === l ? activeLangButtonStyle : langButtonStyle}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <header style={heroStyle}>
          <div style={heroGlowStyle} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={heroTopStyle}>
              <div>
                <div style={badgeStyle}>{labels[lang].profile}</div>
                <h1 style={titleStyle}>{politicianName}</h1>
                <p style={leadStyle}>{labels[lang].lead}</p>
              </div>

              <div style={avatarStyle}>{initials}</div>
            </div>

            <div style={statsGridStyle}>
              <div style={statCardStyle}>
                <strong>{items.length}</strong>
                <span>{labels[lang].contradictions}</span>
              </div>

              <div style={statCardStyle}>
                <strong>{topics.length}</strong>
                <span>{labels[lang].topics}</span>
              </div>

              <div style={statCardStyle}>
                <strong>{totalVotes}</strong>
                <span>{labels[lang].votes}</span>
              </div>

              <div style={statCardStyle}>
                <strong>{latestDate}</strong>
                <span>{labels[lang].latestLabel}</span>
              </div>
            </div>

            <div style={tagsRowStyle}>
              <button
                onClick={() => setActiveTopic("all")}
                style={
                  activeTopic === "all" ? activeTagButtonStyle : tagButtonStyle
                }
              >
                {labels[lang].all}
              </button>

              {topics.map((topic) => (
                <button
                  key={String(topic)}
                  onClick={() => setActiveTopic(String(topic))}
                  style={
                    activeTopic === topic ? activeTagButtonStyle : tagButtonStyle
                  }
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>🧭 {labels[lang].latest}</h2>

          {activeTopic !== "all" && (
            <p style={filterInfoStyle}>
              {filteredProfileItems.length} / {items.length} · {activeTopic}
            </p>
          )}
        </section>

        {items.length === 0 && (
          <div style={emptyStyle}>{labels[lang].noItems}</div>
        )}

        <section style={{ display: "grid", gap: 18 }}>
          {filteredProfileItems.map((item) => {
            const itemVotes = votes.filter(
              (v) => v.contradiction_id === item.id
            );

            const yesVotes = itemVotes.filter(
              (v) => v.vote_type === "yes"
            ).length;

            const percent = itemVotes.length
              ? Math.round((yesVotes / itemVotes.length) * 100)
              : 0;

            const summary = getAiSummary(item, lang);

            return (
              <article key={item.id} style={cardStyle}>
                <div style={cardTopStyle}>
                  <div>
                    <div style={smallTagStyle}>
                      {getTopic(item, lang) || labels[lang].noTopic}
                    </div>

                    <h2 style={cardTitleStyle}>
                      {politicianName} –{" "}
                      {getTopic(item, lang) || labels[lang].noTopic}
                    </h2>
                  </div>

                  <a
                    href={`/contradictions/${item.slug}`}
                    style={openButtonStyle}
                  >
                    {labels[lang].open} →
                  </a>
                </div>

                <div style={compareGridStyle}>
                  <div style={oldBoxStyle}>
                    <strong>{labels[lang].old}</strong>
                    <p>{item.old_statement || "-"}</p>
                    <small>{item.old_date || "-"}</small>
                  </div>

                  <div style={newBoxStyle}>
                    <strong>{labels[lang].now}</strong>
                    <p>{item.new_statement || "-"}</p>
                    <small>{item.new_date || "-"}</small>
                  </div>
                </div>

                {summary && (
                  <p style={summaryStyle}>
                    🤖 <strong>{labels[lang].ai}:</strong> {summary}
                  </p>
                )}

                <div style={footerStyle}>
                  <span>
                    👍 {percent}% {labels[lang].according}
                  </span>

                  <span>
                    {itemVotes.length} {labels[lang].votes}
                  </span>
                </div>
              </article>
            );
          })}
        </section>
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
  alignItems: "center",
  gap: 14,
  marginBottom: 26,
  flexWrap: "wrap",
};

const backStyle: CSSProperties = {
  color: "#0f172a",
  fontWeight: 900,
  textDecoration: "none",
  fontSize: 15,
  opacity: 0.82,
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
    "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,250,252,0.82))",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 34,
  padding: 36,
  marginBottom: 30,
  boxShadow:
    "0 28px 80px rgba(15, 23, 42, 0.13), inset 0 1px 0 rgba(255,255,255,0.9)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const heroGlowStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at top left, rgba(59,130,246,0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(168,85,247,0.16), transparent 28%)",
  pointerEvents: "none",
};

const heroTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const avatarStyle: CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: 28,
  background:
    "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontSize: 30,
  fontWeight: 950,
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.22)",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  background:
    "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
  color: "white",
  padding: "8px 14px",
  borderRadius: 999,
  fontSize: 12,
  letterSpacing: 0.6,
  fontWeight: 900,
  marginBottom: 18,
  boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
};

const titleStyle: CSSProperties = {
  fontSize: "clamp(38px, 6vw, 66px)",
  lineHeight: 0.98,
  margin: 0,
  fontWeight: 950,
  letterSpacing: "-2.2px",
};

const leadStyle: CSSProperties = {
  color: "#475569",
  fontSize: 18,
  marginTop: 16,
  marginBottom: 30,
  lineHeight: 1.65,
  maxWidth: 760,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 14,
  marginBottom: 22,
};

const statCardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid rgba(255,255,255,0.75)",
  borderRadius: 22,
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontWeight: 800,
  boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const tagsRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const tagButtonStyle: CSSProperties = {
  padding: "9px 15px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.35)",
  background: "rgba(255,255,255,0.68)",
  cursor: "pointer",
  fontWeight: 900,
  color: "#334155",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const activeTagButtonStyle: CSSProperties = {
  ...tagButtonStyle,
  background:
    "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
  color: "white",
  borderColor: "rgba(255,255,255,0.25)",
  boxShadow: "0 12px 28px rgba(79,70,229,0.32)",
};

const sectionHeaderStyle: CSSProperties = {
  marginBottom: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 12,
  flexWrap: "wrap",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 30,
  margin: 0,
  fontWeight: 950,
  letterSpacing: "-0.8px",
};

const filterInfoStyle: CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontWeight: 800,
};

const emptyStyle: CSSProperties = {
  background: "rgba(255,255,255,0.8)",
  border: "1px solid rgba(255,255,255,0.75)",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 14px 35px rgba(15,23,42,0.06)",
};

const cardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9))",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 28,
  padding: 26,
  boxShadow:
    "0 18px 50px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 18,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const smallTagStyle: CSSProperties = {
  display: "inline-block",
  background:
    "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
  color: "white",
  padding: "6px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.3,
  marginBottom: 12,
  boxShadow: "0 8px 22px rgba(15,23,42,0.16)",
};

const cardTitleStyle: CSSProperties = {
  fontSize: 28,
  lineHeight: 1.08,
  margin: 0,
  fontWeight: 950,
  letterSpacing: "-0.7px",
};

const openButtonStyle: CSSProperties = {
  padding: "11px 15px",
  background:
    "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
  color: "white",
  borderRadius: 14,
  textDecoration: "none",
  fontWeight: 900,
  whiteSpace: "nowrap",
  boxShadow: "0 14px 30px rgba(15,23,42,0.18)",
};

const compareGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    typeof window !== "undefined" && window.innerWidth < 900
      ? "1fr"
      : "1fr 1fr",
  gap: 14,
};

const oldBoxStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(238,242,255,0.92), rgba(224,231,255,0.82))",
  border: "1px solid rgba(199,210,254,0.9)",
  borderRadius: 18,
  padding: 16,
  lineHeight: 1.6,
};

const newBoxStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(236,253,245,0.92), rgba(220,252,231,0.82))",
  border: "1px solid rgba(134,239,172,0.9)",
  borderRadius: 18,
  padding: 16,
  lineHeight: 1.6,
};

const summaryStyle: CSSProperties = {
  marginTop: 16,
  background: "rgba(248,250,252,0.78)",
  border: "1px solid rgba(226,232,240,0.8)",
  padding: 16,
  borderRadius: 16,
  lineHeight: 1.65,
  color: "#334155",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const footerStyle: CSSProperties = {
  marginTop: 18,
  paddingTop: 14,
  borderTop: "1px solid rgba(226,232,240,0.9)",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  color: "#64748b",
  fontSize: 13,
  fontWeight: 800,
};