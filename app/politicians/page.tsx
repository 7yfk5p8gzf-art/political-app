"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, saveLang, type Lang } from "@/lib/i18n";
import PublicPageShell from "@/components/public/PublicPageShell";

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
    open: "Profil",
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
    open: "Profil",
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
    open: "Profile",
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
    open: "Profil",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
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

const profileRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const avatarStyle: CSSProperties = {
  width: 60,
  height: 60,
  borderRadius: 20,
  background:
    "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
  fontSize: 20,
  boxShadow: "0 14px 30px rgba(15,23,42,0.18)",
};

const miniBadgeStyle: CSSProperties = {
  display: "inline-block",
  background: "rgba(255,255,255,0.72)",
  color: "#0f172a",
  padding: "6px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  border: "1px solid rgba(226,232,240,0.9)",
  marginBottom: 8,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
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

const topicLineStyle: CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid var(--card-border)",
  borderRadius: 18,
  padding: 15,
  color: "var(--text-muted)",
  marginBottom: 14,
  lineHeight: 1.5,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const statsRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 12,
};

const statStyle: CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid var(--card-border)",
  color: "var(--text-main)",
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
  color: "#334155",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 14,
};

const topicLinkStyle: CSSProperties = {
  color: "var(--text-main)",
  fontWeight: 950,
  textDecoration: "none",
  borderBottom: "2px solid var(--text-main)",
};