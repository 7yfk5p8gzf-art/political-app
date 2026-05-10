"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, saveLang, type Lang } from "@/lib/i18n";

type Item = {
  id: string;
  politician: string | null;
  country?: string | null;
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

type PoliticianCard = {
  slug: string;
  name: string;
  country: string | null;
  count: number;
  votes: number;
  topTopic: string | null;
};

const labels = {
  hu: {
    badge: "👤 Political Actors",
    title: "Politikusok",
    lead: "Fedezd fel a politikusokat, témáikat, ellentmondásaikat és a közösségi szavazatokat.",
    search: "Keresés politikus, ország vagy téma szerint...",
    contradictions: "ellentmondás",
    votes: "szavazat",
    topTopic: "fő téma",
    country: "ország",
    open: "Profil",
    unknown: "Ismeretlen",
    noCountry: "Nincs ország",
    noTopic: "Nincs téma",
  },
  de: {
    badge: "👤 Political Actors",
    title: "Politiker",
    lead: "Entdecke Politiker, ihre Themen, Widersprüche und Community-Stimmen.",
    search: "Suche nach Politiker, Land oder Thema...",
    contradictions: "Widersprüche",
    votes: "Stimmen",
    topTopic: "Top-Thema",
    country: "Land",
    open: "Profil",
    unknown: "Unbekannt",
    noCountry: "Kein Land",
    noTopic: "Kein Thema",
  },
  en: {
    badge: "👤 Political Actors",
    title: "Politicians",
    lead: "Explore politicians, their topics, contradictions and community voting.",
    search: "Search politician, country or topic...",
    contradictions: "contradictions",
    votes: "votes",
    topTopic: "top topic",
    country: "country",
    open: "Profile",
    unknown: "Unknown",
    noCountry: "No country",
    noTopic: "No topic",
  },
  fr: {
    badge: "👤 Political Actors",
    title: "Politiciens",
    lead: "Explorez les politiciens, leurs sujets, contradictions et votes communautaires.",
    search: "Rechercher politicien, pays ou sujet...",
    contradictions: "contradictions",
    votes: "votes",
    topTopic: "sujet principal",
    country: "pays",
    open: "Profil",
    unknown: "Inconnu",
    noCountry: "Aucun pays",
    noTopic: "Aucun sujet",
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PoliticiansPage() {
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

  const politicians = useMemo(() => {
    const map = new Map<string, PoliticianCard>();

    items.forEach((item) => {
      if (!item.politician) return;

      const slug = slugify(item.politician);

      const current = map.get(slug) || {
        slug,
        name: item.politician,
        country: item.country || null,
        count: 0,
        votes: 0,
        topTopic: null,
      };

      current.count += 1;
      current.votes += votes.filter((v) => v.contradiction_id === item.id).length;

      if (!current.country && item.country) {
        current.country = item.country;
      }

      map.set(slug, current);
    });

    map.forEach((politician) => {
      const related = items.filter(
        (item) => item.politician && slugify(item.politician) === politician.slug
      );

      const topicCount = new Map<string, number>();

      related.forEach((item) => {
        const topic = getTopic(item, lang);
        if (!topic) return;
        topicCount.set(topic, (topicCount.get(topic) || 0) + 1);
      });

      politician.topTopic =
        Array.from(topicCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        null;
    });

    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || b.votes - a.votes
    );
  }, [items, votes, lang]);

  const filteredPoliticians = politicians.filter((p) =>
    [p.name, p.country, p.topTopic]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div style={heroTopStyle}>
          <div>
            <div style={badgeStyle}>{labels[lang].badge}</div>
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
        {filteredPoliticians.map((p) => (
          <article key={p.slug} style={cardStyle}>
            <div style={cardTopStyle}>
              <div style={profileRowStyle}>
                <div style={avatarStyle}>{getInitials(p.name)}</div>

                <div>
                  <div style={miniBadgeStyle}>
                    {p.country || labels[lang].noCountry}
                  </div>

                  <h2 style={cardTitleStyle}>{p.name}</h2>
                </div>
              </div>

              <a href={`/politicians/${p.slug}`} style={openButtonStyle}>
                {labels[lang].open} →
              </a>
            </div>

            <div style={topicLineStyle}>
  <span>{labels[lang].topTopic}:</span>{" "}

  {p.topTopic ? (
    <a href={`/topics/${slugify(p.topTopic)}`} style={topicLinkStyle}>
      {p.topTopic} →
    </a>
  ) : (
    <strong>{labels[lang].noTopic}</strong>
  )}
</div>

            <div style={statsRowStyle}>
              <div style={statStyle}>
                <strong>{p.count}</strong>
                <span>{labels[lang].contradictions}</span>
              </div>

              <div style={statStyle}>
                <strong>{p.votes}</strong>
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
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
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
  alignItems: "flex-start",
  marginBottom: 20,
};

const profileRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const avatarStyle: CSSProperties = {
  width: 58,
  height: 58,
  borderRadius: 18,
  background: "#0f172a",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
  fontSize: 20,
};

const miniBadgeStyle: CSSProperties = {
  display: "inline-block",
  background: "#e2e8f0",
  color: "#0f172a",
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 8,
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

const topicLineStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 14,
  color: "#475569",
  marginBottom: 14,
};

const statsRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
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
const topicLinkStyle: CSSProperties = {
  color: "#0f172a",
  fontWeight: 950,
  textDecoration: "none",
  borderBottom: "2px solid #0f172a",
};