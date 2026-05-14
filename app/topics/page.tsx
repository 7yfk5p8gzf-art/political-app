"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, saveLang, type Lang } from "@/lib/i18n";
import PublicPageShell from "@/components/public/PublicPageShell";

type Item = {
  id: string;
  politician: string | null;
  topic: string | null;
  topic_hu?: string | null;
  topic_de?: string | null;
  topic_en?: string | null;
  topic_fr?: string | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
};

type TopicCard = {
  slug: string;
  name: string;
  count: number;
  politicians: number;
  votes: number;
};

const labels = {
  hu: {
    title: "Témák",
    lead: "Fedezd fel a politikai témákat, vitákat és ellentmondásokat egy helyen.",
    contradictions: "ellentmondás",
    politicians: "politikus",
    votes: "szavazat",
    open: "Megnyitás",
    search: "Keresés témák között...",
    badge: "🌍 Political Topics",
  },
  de: {
    title: "Themen",
    lead: "Entdecke politische Themen, Debatten und Widersprüche an einem Ort.",
    contradictions: "Widersprüche",
    politicians: "Politiker",
    votes: "Stimmen",
    open: "Öffnen",
    search: "Themen suchen...",
    badge: "🌍 Political Topics",
  },
  en: {
    title: "Topics",
    lead: "Explore political topics, debates and contradictions in one place.",
    contradictions: "contradictions",
    politicians: "politicians",
    votes: "votes",
    open: "Open",
    search: "Search topics...",
    badge: "🌍 Political Topics",
  },
  fr: {
    title: "Sujets",
    lead: "Explorez les sujets politiques, débats et contradictions au même endroit.",
    contradictions: "contradictions",
    politicians: "politiciens",
    votes: "votes",
    open: "Ouvrir",
    search: "Rechercher des sujets...",
    badge: "🌍 Political Topics",
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

export default function TopicsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<Lang>("hu");

  useEffect(() => {
    setLang(detectBrowserLang());
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("contradictions")
      .select("*")
      .eq("status", "published");

    setItems((data || []) as Item[]);

    const { data: voteData } = await supabase
      .from("contradiction_votes")
      .select("*");

    setVotes((voteData || []) as Vote[]);
  }

  const topics = useMemo(() => {
    const map = new Map<string, TopicCard>();

    items.forEach((item) => {
      const topicName = getTopic(item, lang);
      if (!topicName) return;

      const slug = slugify(topicName);

      const current = map.get(slug) || {
        slug,
        name: topicName,
        count: 0,
        politicians: 0,
        votes: 0,
      };

      current.count += 1;

      current.votes += votes.filter(
        (v) => v.contradiction_id === item.id
      ).length;

      map.set(slug, current);
    });

    map.forEach((topic) => {
      const related = items.filter(
        (i) => slugify(getTopic(i, lang) || "") === topic.slug
      );

      topic.politicians = new Set(
        related.map((i) => i.politician).filter(Boolean)
      ).size;
    });

    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || b.votes - a.votes
    );
  }, [items, votes, lang]);

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(search.toLowerCase())
  );
    return (
    <PublicPageShell>
      <section style={containerStyle}>
        <header style={heroStyle}>
          <div style={heroGlowStyle} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={heroTopStyle}>
              <div>
                <div style={badgeStyle}>{labels[lang].badge}</div>
                <h1 style={titleStyle}>{labels[lang].title}</h1>
                <p style={leadStyle}>{labels[lang].lead}</p>
              </div>

              <div style={rightTopStyle}>
                <nav style={navStyle}>
                  <a href="/contradictions" style={navLinkStyle}>
                    Contradictions
                  </a>
                  <a href="/topics" style={navLinkStyle}>
                    Topics
                  </a>
                  <a href="/politicians" style={navLinkStyle}>
                    Politicians
                  </a>
                </nav>

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
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels[lang].search}
              style={searchStyle}
            />
          </div>
        </header>

        <section style={gridStyle}>
          {filteredTopics.map((topic) => (
            <article key={topic.slug} style={cardStyle}>
              <div style={cardTopStyle}>
                <div>
                  <div style={topicBadgeStyle}>Topic</div>
                  <h2 style={cardTitleStyle}>{topic.name}</h2>
                </div>

                <a href={`/topics/${topic.slug}`} style={openButtonStyle}>
                  {labels[lang].open} →
                </a>
              </div>

              <div style={statsRowStyle}>
                <div style={statStyle}>
                  <strong>{topic.count}</strong>
                  <span>{labels[lang].contradictions}</span>
                </div>

                <div style={statStyle}>
                  <strong>{topic.politicians}</strong>
                  <span>{labels[lang].politicians}</span>
                </div>

                <div style={statStyle}>
                  <strong>{topic.votes}</strong>
                  <span>{labels[lang].votes}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </section>
    </PublicPageShell>
  );
}

const containerStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
};

const heroStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  marginBottom: 30,
  background: "var(--hero-bg)",
    
  border: "1px solid var(--card-border)",
  borderRadius: 34,
  padding: 36,
  boxShadow: "var(--shadow-main)",
    
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
  gap: 24,
  flexWrap: "wrap",
  marginBottom: 26,
};

const rightTopStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  justifyItems: "end",
  alignContent: "start",
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
  margin: "0 0 18px",
  fontWeight: 950,
  letterSpacing: "-2.2px",
  color: "var(--text-main)",
};

const leadStyle: CSSProperties = {
  maxWidth: 760,
  color: "var(--text-muted)",
  fontSize: 18,
  lineHeight: 1.65,
  margin: 0,
};

const searchStyle: CSSProperties = {
  width: "100%",
  padding: "17px 18px",
  border: "1px solid rgba(148,163,184,0.35)",
  borderRadius: 18,
  fontSize: 16,
  outline: "none",
  background: "rgba(255,255,255,0.78)",
  boxShadow: "0 14px 35px rgba(15,23,42,0.06)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const langSwitcherStyle: CSSProperties = {
  display: "flex",
  gap: 6,
  alignItems: "start",
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

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 18,
};

const cardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  background: "var(--card-bg)",
    
  border: "1px solid var(--card-border)",
  borderRadius: 28,
  padding: 26,
  boxShadow: "var(--shadow-main)",
    
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "flex-start",
  marginBottom: 22,
  flexWrap: "wrap",
};

const topicBadgeStyle: CSSProperties = {
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
  fontSize: 30,
  lineHeight: 1.08,
  margin: 0,
  fontWeight: 950,
  letterSpacing: "-0.8px",
  color: "var(--text-main)",
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

const statsRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
};

const statStyle: CSSProperties = {
  background: "rgba(255,255,255,0.08)",
 border: "1px solid var(--card-border)",
  color: "var(--text-main)",
backdropFilter: "blur(10px)",
  borderRadius: 18,
  padding: 15,
  display: "grid",
  gap: 4,
  textAlign: "center",
  boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
};

const navStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap",
};

const navLinkStyle: CSSProperties = {
  color: "var(--text-muted)",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 14,
};