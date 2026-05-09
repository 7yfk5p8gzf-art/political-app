"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, saveLang, type Lang } from "@/lib/i18n";

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
      <main style={pageStyle}>
        <div style={containerStyle}>Betöltés...</div>
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
                key={topic}
                onClick={() => setActiveTopic(String(topic))}
                style={
                  activeTopic === topic ? activeTagButtonStyle : tagButtonStyle
                }
              >
                {topic}
              </button>
            ))}
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
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  padding: "32px 18px",
  color: "#0f172a",
};

const containerStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
};

const topRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 22,
  flexWrap: "wrap",
};

const backStyle: CSSProperties = {
  color: "#0f172a",
  fontWeight: 900,
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
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  border: "1px solid #dbe0e6",
  borderRadius: 28,
  padding: 34,
  marginBottom: 28,
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
};

const heroTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const avatarStyle: CSSProperties = {
  width: 92,
  height: 92,
  borderRadius: 24,
  background: "#0f172a",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontSize: 30,
  fontWeight: 950,
  boxShadow: "0 14px 28px rgba(15, 23, 42, 0.18)",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  background: "#0f172a",
  color: "white",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 16,
};

const titleStyle: CSSProperties = {
  fontSize: 54,
  lineHeight: 1.02,
  margin: 0,
  fontWeight: 950,
};

const leadStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 18,
  marginTop: 14,
  marginBottom: 28,
  lineHeight: 1.6,
  maxWidth: 760,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 14,
  marginBottom: 20,
};

const statCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontWeight: 800,
};

const tagsRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const tagButtonStyle: CSSProperties = {
  background: "#e2e8f0",
  padding: "7px 11px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 13,
  border: "none",
  cursor: "pointer",
};

const activeTagButtonStyle: CSSProperties = {
  ...tagButtonStyle,
  background: "#0f172a",
  color: "white",
};

const sectionHeaderStyle: CSSProperties = {
  marginBottom: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 12,
  flexWrap: "wrap",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 28,
  margin: 0,
  fontWeight: 950,
};

const filterInfoStyle: CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontWeight: 800,
};

const emptyStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
};

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: 22,
  border: "1px solid #dbe0e6",
  padding: 24,
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 18,
  alignItems: "flex-start",
};

const smallTagStyle: CSSProperties = {
  display: "inline-block",
  background: "#0f172a",
  color: "white",
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 10,
};

const cardTitleStyle: CSSProperties = {
  fontSize: 26,
  margin: 0,
  fontWeight: 950,
};

const openButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  background: "#0f172a",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const compareGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
};

const oldBoxStyle: CSSProperties = {
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  borderRadius: 16,
  padding: 16,
  lineHeight: 1.55,
};

const newBoxStyle: CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  borderRadius: 16,
  padding: 16,
  lineHeight: 1.55,
};

const summaryStyle: CSSProperties = {
  marginTop: 16,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 14,
  lineHeight: 1.6,
};

const footerStyle: CSSProperties = {
  marginTop: 16,
  paddingTop: 14,
  borderTop: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  color: "#64748b",
  fontWeight: 800,
};