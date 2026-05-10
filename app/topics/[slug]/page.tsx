"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, saveLang, type Lang } from "@/lib/i18n";

type Item = {
  id: string;
  slug: string | null;
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
  country?: string | null;
  language?: string | null;
  published_at: string | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
  vote_type: "yes" | "no";
};

const labels = {
  hu: {
    back: "Vissza",
    topicPage: "Téma oldal",
    lead: "Az adott témához kapcsolódó politikai ellentmondások, szereplők és közösségi szavazatok.",
    contradictions: "ellentmondás",
    politicians: "politikus",
    votes: "szavazat",
    countries: "ország",
    latest: "Legújabb ügyek",
    noItems: "Ehhez a témához még nincs publikált ügy.",
    old: "RÉGEN",
    now: "MOST",
    open: "Megnyitás",
    unknown: "Ismeretlen",
    noStatement: "Nincs állítás",
    noDate: "Nincs dátum",
    ai: "AI elemzés",
  },
  de: {
    back: "Zurück",
    topicPage: "Themenseite",
    lead: "Politische Widersprüche, Akteure und Community-Stimmen zu diesem Thema.",
    contradictions: "Widersprüche",
    politicians: "Politiker",
    votes: "Stimmen",
    countries: "Länder",
    latest: "Neueste Fälle",
    noItems: "Zu diesem Thema gibt es noch keine veröffentlichten Fälle.",
    old: "FRÜHER",
    now: "JETZT",
    open: "Öffnen",
    unknown: "Unbekannt",
    noStatement: "Keine Aussage",
    noDate: "Kein Datum",
    ai: "KI-Analyse",
  },
  en: {
    back: "Back",
    topicPage: "Topic page",
    lead: "Political contradictions, actors and community voting around this topic.",
    contradictions: "contradictions",
    politicians: "politicians",
    votes: "votes",
    countries: "countries",
    latest: "Latest cases",
    noItems: "There are no published cases for this topic yet.",
    old: "BEFORE",
    now: "NOW",
    open: "Open",
    unknown: "Unknown",
    noStatement: "No statement",
    noDate: "No date",
    ai: "AI analysis",
  },
  fr: {
    back: "Retour",
    topicPage: "Page sujet",
    lead: "Contradictions politiques, acteurs et votes communautaires autour de ce sujet.",
    contradictions: "contradictions",
    politicians: "politiciens",
    votes: "votes",
    countries: "pays",
    latest: "Derniers cas",
    noItems: "Aucun cas publié pour ce sujet.",
    old: "AVANT",
    now: "MAINTENANT",
    open: "Ouvrir",
    unknown: "Inconnu",
    noStatement: "Aucune déclaration",
    noDate: "Aucune date",
    ai: "Analyse IA",
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

function prettySlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

export default function TopicPage() {
  const params = useParams();
  const slug = decodeURIComponent(String(params.slug || ""));

  const [items, setItems] = useState<Item[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
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
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error(error);
      setItems([]);
      setVotes([]);
      setLoading(false);
      return;
    }

    const filtered = (data || []).filter((item) => {
      const possibleTopics = [
        item.topic,
        item.topic_hu,
        item.topic_de,
        item.topic_en,
        item.topic_fr,
      ].filter(Boolean);

      return possibleTopics.some((topic) => slugify(String(topic)) === slug);
    });

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

  function voteCount(id: string) {
    return votes.filter((v) => v.contradiction_id === id).length;
  }

  function yesPercent(id: string) {
    const itemVotes = votes.filter((v) => v.contradiction_id === id);
    if (itemVotes.length === 0) return 0;

    const yes = itemVotes.filter((v) => v.vote_type === "yes").length;
    return Math.round((yes / itemVotes.length) * 100);
  }

  const topicName = items[0] ? getTopic(items[0], lang) || prettySlug(slug) : prettySlug(slug);

  const politicians = useMemo(() => {
    return new Set(items.map((i) => i.politician).filter(Boolean)).size;
  }, [items]);

  const countries = useMemo(() => {
    return new Set(items.map((i) => i.country).filter(Boolean)).size;
  }, [items]);

  const totalVotes = votes.length;

  if (loading) {
    return (
      <main style={pageStyle}>
        <section style={containerStyle}>Betöltés...</section>
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

        <header style={heroStyle}>
          <div style={badgeStyle}>{labels[lang].topicPage}</div>

          <h1 style={titleStyle}>{topicName}</h1>

          <p style={leadStyle}>{labels[lang].lead}</p>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <strong>{items.length}</strong>
              <span>{labels[lang].contradictions}</span>
            </div>

            <div style={statCardStyle}>
              <strong>{politicians}</strong>
              <span>{labels[lang].politicians}</span>
            </div>

            <div style={statCardStyle}>
              <strong>{totalVotes}</strong>
              <span>{labels[lang].votes}</span>
            </div>

            <div style={statCardStyle}>
              <strong>{countries}</strong>
              <span>{labels[lang].countries}</span>
            </div>
          </div>
        </header>

        <section style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>🧭 {labels[lang].latest}</h2>
        </section>

        {items.length === 0 && (
          <div style={emptyStyle}>{labels[lang].noItems}</div>
        )}

        <section style={gridStyle}>
          {items.map((item) => {
            const summary = getAiSummary(item, lang);
            const detailHref = `/contradictions/${item.slug || item.id}`;

            return (
              <article key={item.id} style={cardStyle}>
                <div style={cardTopStyle}>
                  <div>
                    <div style={tagRowStyle}>
                      <span style={darkTagStyle}>
                        {getTopic(item, lang) || topicName}
                      </span>

                      {item.language && (
                        <span style={lightTagStyle}>
                          {item.language.toUpperCase()}
                        </span>
                      )}

                      <span style={voteTagStyle}>
                        👍 {yesPercent(item.id)}% · {voteCount(item.id)}{" "}
                        {labels[lang].votes}
                      </span>
                    </div>

                    <h2 style={cardTitleStyle}>
  {item.politician ? (
    <a
      href={`/politicians/${slugify(item.politician)}`}
      style={politicianLinkStyle}
    >
      {item.politician}
    </a>
  ) : (
    labels[lang].unknown
  )}
</h2>
                  </div>

                  <a href={detailHref} style={openButtonStyle}>
                    {labels[lang].open} →
                  </a>
                </div>

                <div style={compareGridStyle}>
                  <div style={oldBoxStyle}>
                    <strong>{labels[lang].old}</strong>
                    <p>{item.old_statement || labels[lang].noStatement}</p>
                    <small>{item.old_date || labels[lang].noDate}</small>
                  </div>

                  <div style={newBoxStyle}>
                    <strong>{labels[lang].now}</strong>
                    <p>{item.new_statement || labels[lang].noStatement}</p>
                    <small>{item.new_date || labels[lang].noDate}</small>
                  </div>
                </div>

                {summary && (
                  <p style={summaryStyle}>
                    🤖 <strong>{labels[lang].ai}:</strong> {summary}
                  </p>
                )}
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
  background:
    "radial-gradient(circle at top left, #e0f2fe 0, transparent 32%), #f3f4f6",
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
  gap: 12,
  alignItems: "center",
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
  borderRadius: 8,
};

const activeLangButtonStyle: CSSProperties = {
  ...langButtonStyle,
  background: "#111827",
  color: "white",
};

const heroStyle: CSSProperties = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  border: "1px solid #dbe0e6",
  borderRadius: 30,
  padding: 34,
  marginBottom: 28,
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  background: "#0f172a",
  color: "white",
  padding: "7px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 16,
};

const titleStyle: CSSProperties = {
  fontSize: 54,
  lineHeight: 1.02,
  margin: "0 0 14px",
  fontWeight: 950,
  letterSpacing: -1.2,
};

const leadStyle: CSSProperties = {
  fontSize: 18,
  color: "#475569",
  lineHeight: 1.6,
  maxWidth: 780,
  marginBottom: 26,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 14,
};

const statCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 18,
  display: "grid",
  gap: 6,
  fontWeight: 800,
};

const sectionHeaderStyle: CSSProperties = {
  marginBottom: 16,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 30,
  margin: 0,
  fontWeight: 950,
};

const emptyStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gap: 18,
};

const cardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  marginBottom: 16,
  flexWrap: "wrap",
};

const tagRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 10,
};

const darkTagStyle: CSSProperties = {
  background: "#0f172a",
  color: "white",
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const lightTagStyle: CSSProperties = {
  background: "#e2e8f0",
  color: "#0f172a",
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const voteTagStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const cardTitleStyle: CSSProperties = {
  fontSize: 27,
  margin: 0,
  fontWeight: 950,
};

const openButtonStyle: CSSProperties = {
  padding: "10px 13px",
  background: "#0f172a",
  color: "white",
  borderRadius: 12,
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
  lineHeight: 1.5,
  color: "#0f172a",
};

const newBoxStyle: CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  borderRadius: 16,
  padding: 16,
  lineHeight: 1.5,
  color: "#0f172a",
};

const summaryStyle: CSSProperties = {
  marginTop: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  padding: 14,
  borderRadius: 14,
  lineHeight: 1.6,
};
const politicianLinkStyle: CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  borderBottom: "2px solid #0f172a",
  cursor: "pointer",
};