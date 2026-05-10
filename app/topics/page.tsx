"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, saveLang, type Lang } from "@/lib/i18n";

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
    lead:
      "Fedezd fel a politikai témákat, vitákat és ellentmondásokat egy helyen.",
    contradictions: "ellentmondás",
    politicians: "politikus",
    votes: "szavazat",
    open: "Megnyitás",
    search: "Keresés témák között...",
  },

  de: {
    title: "Themen",
    lead:
      "Entdecke politische Themen, Debatten und Widersprüche an einem Ort.",
    contradictions: "Widersprüche",
    politicians: "Politiker",
    votes: "Stimmen",
    open: "Öffnen",
    search: "Themen suchen...",
  },

  en: {
    title: "Topics",
    lead:
      "Explore political topics, debates and contradictions in one place.",
    contradictions: "contradictions",
    politicians: "politicians",
    votes: "votes",
    open: "Open",
    search: "Search topics...",
  },

  fr: {
    title: "Sujets",
    lead:
      "Explorez les sujets politiques, débats et contradictions au même endroit.",
    contradictions: "contradictions",
    politicians: "politiciens",
    votes: "votes",
    open: "Ouvrir",
    search: "Rechercher des sujets...",
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
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div style={heroTopStyle}>
          <div>
            <div style={badgeStyle}>🌍 Political Topics</div>

            <h1 style={titleStyle}>{labels[lang].title}</h1>

            <p style={leadStyle}>{labels[lang].lead}</p>
          </div>
          <div style={navStyle}>
  <a href="/contradictions" style={navLinkStyle}>
    Contradictions
  </a>

  <a href="/topics" style={navLinkStyle}>
    Topics
  </a>

  <a href="/politicians" style={navLinkStyle}>
    Politicians
  </a>
</div>

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

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={labels[lang].search}
          style={searchStyle}
        />
      </section>

      <section style={gridStyle}>
        {filteredTopics.map((topic) => (
          <article key={topic.slug} style={cardStyle}>
            <div style={cardTopStyle}>
              <div>
                <div style={topicBadgeStyle}>Topic</div>

                <h2 style={cardTitleStyle}>{topic.name}</h2>
              </div>

              <a
                href={`/topics/${topic.slug}`}
                style={openButtonStyle}
              >
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
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #dbeafe 0, transparent 30%), #f3f4f6",
  padding: "30px 18px 50px",
};

const heroStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 30px",
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 30,
  padding: 34,
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
};

const heroTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 24,
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
  fontSize: 58,
  lineHeight: 1,
  margin: "0 0 14px",
  fontWeight: 950,
  color: "#0f172a",
};

const leadStyle: CSSProperties = {
  maxWidth: 760,
  color: "#475569",
  fontSize: 18,
  lineHeight: 1.6,
};

const searchStyle: CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: 16,
  border: "1px solid #cbd5e1",
  fontSize: 16,
};

const langSwitcherStyle: CSSProperties = {
  display: "flex",
  gap: 6,
  alignItems: "start",
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

const gridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
  gap: 12,
  alignItems: "start",
  marginBottom: 20,
};

const topicBadgeStyle: CSSProperties = {
  display: "inline-block",
  background: "#0f172a",
  color: "white",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 10,
};

const cardTitleStyle: CSSProperties = {
  fontSize: 28,
  margin: 0,
  fontWeight: 950,
  color: "#0f172a",
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

const statsRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
};

const statStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 14,
  display: "grid",
  gap: 4,
  textAlign: "center",
};
const navStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap",
};

const navLinkStyle: CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 15,
};
