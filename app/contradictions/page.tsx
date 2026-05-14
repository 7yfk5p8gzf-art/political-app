"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, saveLang, t, type Lang } from "@/lib/i18n";
import PublicPageShell from "@/components/public/PublicPageShell";

type Item = {
  id: string;
  slug: string | null;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
  old_source: string | null;
  new_source: string | null;
  politician: string | null;
  topic: string | null;
  topic_hu?: string | null;
  topic_de?: string | null;
  topic_en?: string | null;
  topic_fr?: string | null;
  country?: string | null;
  language?: string | null;
  ai_summary: string | null;
  ai_summary_hu?: string | null;
  ai_summary_de?: string | null;
  ai_summary_en?: string | null;
  ai_summary_fr?: string | null;
  published_at: string | null;
  views?: number | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
  vote_type: "yes" | "no";
};

const labels = {
  hu: {
    eyebrow: "AI + forrás + közösségi szavazás",
    headline: "Politikai ellentmondások egy helyen",
    lead: "Régi és új nyilatkozatok összehasonlítása dátummal, forrással, AI elemzéssel és közösségi visszajelzéssel.",
    noContent: "Nincs még publikált tartalom vagy nincs találat.",
    basedOnVotes: "legtöbb szavazat alapján",
    noTopic: "Nincs téma",
    unknown: "Ismeretlen",
    topic: "téma",
    vote: "szavazat",
    noOldStatement: "Nincs régi állítás",
    noNewStatement: "Nincs új állítás",
    unknownDate: "Ismeretlen dátum",
    oldSource: "Régi forrás",
    newSource: "Új forrás",
    latest: "Legújabb",
    top: "Top szavazott",
    politiciansTitle: "Politikusok",
    open: "Megnyitás",
    search: "Keresés politikus, téma, ország vagy állítás szerint...",
    published: "Publikálva",
    countries: "ország",
    old: "RÉGEN",
    now: "MOST",
  },
  de: {
    eyebrow: "KI + Quellen + Community-Abstimmung",
    headline: "Politische Widersprüche an einem Ort",
    lead: "Vergleich früherer und aktueller Aussagen mit Datum, Quelle, KI-Analyse und Community-Bewertung.",
    noContent: "Noch keine veröffentlichten Inhalte oder keine Treffer.",
    basedOnVotes: "basierend auf den meisten Stimmen",
    noTopic: "Kein Thema",
    unknown: "Unbekannt",
    topic: "Thema",
    vote: "Stimmen",
    noOldStatement: "Keine frühere Aussage",
    noNewStatement: "Keine neue Aussage",
    unknownDate: "Unbekanntes Datum",
    oldSource: "Frühere Quelle",
    newSource: "Neue Quelle",
    latest: "Neueste",
    top: "Top bewertet",
    politiciansTitle: "Politiker",
    open: "Öffnen",
    search: "Suche nach Politiker, Thema, Land oder Aussage...",
    published: "Veröffentlicht",
    countries: "Länder",
    old: "FRÜHER",
    now: "JETZT",
  },
  en: {
    eyebrow: "AI + sources + community voting",
    headline: "Political contradictions in one place",
    lead: "Compare old and new statements with dates, sources, AI analysis and community voting.",
    noContent: "No published content yet or no results found.",
    basedOnVotes: "based on most votes",
    noTopic: "No topic",
    unknown: "Unknown",
    topic: "topic",
    vote: "votes",
    noOldStatement: "No old statement",
    noNewStatement: "No new statement",
    unknownDate: "Unknown date",
    oldSource: "Old source",
    newSource: "New source",
    latest: "Latest",
    top: "Top voted",
    politiciansTitle: "Politicians",
    open: "Open",
    search: "Search politician, topic, country or statement...",
    published: "Published",
    countries: "countries",
    old: "BEFORE",
    now: "NOW",
  },
  fr: {
    eyebrow: "IA + sources + vote communautaire",
    headline: "Contradictions politiques au même endroit",
    lead: "Comparez les anciennes et nouvelles déclarations avec dates, sources, analyse IA et vote communautaire.",
    noContent: "Aucun contenu publié ou aucun résultat trouvé.",
    basedOnVotes: "basé sur le plus grand nombre de votes",
    noTopic: "Aucun sujet",
    unknown: "Inconnu",
    topic: "sujet",
    vote: "votes",
    noOldStatement: "Aucune ancienne déclaration",
    noNewStatement: "Aucune nouvelle déclaration",
    unknownDate: "Date inconnue",
    oldSource: "Ancienne source",
    newSource: "Nouvelle source",
    latest: "Dernières",
    top: "Top votes",
    politiciansTitle: "Politiciens",
    open: "Ouvrir",
    search: "Rechercher politicien, sujet, pays ou déclaration...",
    published: "Publié",
    countries: "pays",
    old: "AVANT",
    now: "MAINTENANT",
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

export default function PublicContradictionsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<Lang>("hu");
  const [mode, setMode] = useState<"latest" | "top">("latest");
  const [activeCountry, setActiveCountry] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setLang(detectBrowserLang());
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("contradictions")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    setItems(data || []);

    const { data: voteData } = await supabase
      .from("contradiction_votes")
      .select("*");

    setVotes((voteData || []) as Vote[]);
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

  const filteredItems = useMemo(() => {
  const q = search.toLowerCase().trim();

  return items.filter((item) => {
    const matchesSearch =
      !q ||
      [
        item.politician,
        getTopic(item, lang),
        item.country,
        item.language,
        item.old_statement,
        item.new_statement,
        getAiSummary(item, lang),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);

    const matchesCountry =
      activeCountry === "all" ||
      String(item.country || "").toLowerCase() === activeCountry.toLowerCase();

    return matchesSearch && matchesCountry;
  });
}, [items, search, lang, activeCountry]);

  const visibleItems =
  mode === "latest"
    ? filteredItems
    : [...filteredItems].sort((a, b) => voteCount(b.id) - voteCount(a.id));

const trendingTopics = useMemo(() => {
  const map = new Map<string, { name: string; slug: string; count: number }>();

  items.forEach((item) => {
    const topicName = getTopic(item, lang);
    if (!topicName) return;

    const topicSlug = slugify(topicName);
    const current = map.get(topicSlug) || {
      name: topicName,
      slug: topicSlug,
      count: 0,
    };

    current.count += 1;
    map.set(topicSlug, current);
  });

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}, [items, lang]);

const trendingPoliticians = (() => {
  const map = new Map<
    string,
    {
      name: string;
      slug: string;
      votes: number;
    }
  >();

  items.forEach((item) => {
    if (!item.politician) return;

    const slug = slugify(item.politician);

    const current = map.get(slug) || {
      name: item.politician,
      slug,
      votes: 0,
    };

    current.votes += voteCount(item.id);
    map.set(slug, current);
  });

  return Array.from(map.values())
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 6);
})();

const mostVotedItems = [...items]
  .sort((a, b) => voteCount(b.id) - voteCount(a.id))
  .slice(0, 3);

  const countries = new Set(items.map((i) => i.country).filter(Boolean)).size;
  const spotlightItem = [...items].sort(
  (a, b) => voteCount(b.id) - voteCount(a.id)
)[0];

  const politicians = useMemo(() => {
    const map = new Map<string, { name: string; count: number; votes: number }>();

    items.forEach((item) => {
      if (!item.politician) return;
      const current = map.get(item.politician) || {
        name: item.politician,
        count: 0,
        votes: 0,
      };

      current.count += 1;
      current.votes += voteCount(item.id);
      map.set(item.politician, current);
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count || b.votes - a.votes)
      .slice(0, 4);
  }, [items, votes]);

  return (
  <PublicPageShell>
      <div style={topBarStyle}>
        <div style={brandStyle}>Political App</div>
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
<a href="/login" style={navLinkStyle}>
  Login / Register
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

      <section style={heroStyle}>
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(circle at top left, rgba(59,130,246,0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(168,85,247,0.16), transparent 28%)",
      pointerEvents: "none",
    }}
  />
        <div>
          <div style={badgeStyle}>{labels[lang].eyebrow}</div>
          <h1 style={titleStyle}>{labels[lang].headline}</h1>
          <p style={leadStyle}>{labels[lang].lead}</p>
<input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder={labels[lang].search}
  style={searchStyle}
/>

<div style={countryFilterStyle}>
  {["all", "HU", "DE", "FR", "EU"].map((country) => (
    <button
      key={country}
      onClick={() => setActiveCountry(country)}
      style={
        activeCountry === country
          ? activeCountryButtonStyle
          : countryButtonStyle
      }
    >
      {country}
    </button>
  ))}
</div>
          
        </div>

        <div
  style={{
    ...heroPanelStyle,
    position: "relative",
    zIndex: 1,
  }}
>
          <div style={miniStatStyle}>
            <strong>{items.length}</strong>
            <span>{t[lang].publishedCases}</span>
          </div>

          <div style={miniStatStyle}>
            <strong>
              {new Set(items.map((i) => i.politician).filter(Boolean)).size}
            </strong>
            <span>{t[lang].politicians}</span>
          </div>

          <div style={miniStatStyle}>
            <strong>
              {new Set(items.map((i) => getTopic(i, lang)).filter(Boolean)).size}
            </strong>
            <span>{t[lang].topics}</span>
          </div>

          <div style={miniStatStyle}>
            <strong>{votes.length}</strong>
            <span>{t[lang].votes}</span>
          </div>

          <div style={miniStatStyle}>
            <strong>{countries}</strong>
            <span>{labels[lang].countries}</span>
          </div>
        </div>
      </section>
      {spotlightItem && (
  <section style={spotlightStyle}>
    <div style={spotlightBadgeStyle}>🔥 Spotlight</div>

    <h2 style={spotlightTitleStyle}>
      {spotlightItem.politician || labels[lang].unknown} –{" "}
      {getTopic(spotlightItem, lang) || labels[lang].topic}
    </h2>

    <div style={compareGridStyle}>
      <div style={oldBoxStyle}>
        <strong>{labels[lang].old}</strong>
        <p>{spotlightItem.old_statement || labels[lang].noOldStatement}</p>
        <small>{spotlightItem.old_date || labels[lang].unknownDate}</small>
      </div>

      <div style={newBoxStyle}>
        <strong>{labels[lang].now}</strong>
        <p>{spotlightItem.new_statement || labels[lang].noNewStatement}</p>
        <small>{spotlightItem.new_date || labels[lang].unknownDate}</small>
      </div>
    </div>

    <div style={spotlightFooterStyle}>
      <span>
        👍 {yesPercent(spotlightItem.id)}% · {voteCount(spotlightItem.id)}{" "}
        {labels[lang].vote}
      </span>

      <a
        href={`/contradictions/${spotlightItem.slug}`}
        style={openButtonStyle}
      >
        {labels[lang].open} →
      </a>
    </div>
  </section>
)}

      {politicians.length > 0 && (
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>👤 {labels[lang].politiciansTitle}</h2>
          </div>

          <div style={politicianGridStyle}>
            {politicians.map((p) => (
              <a
                key={p.name}
                href={`/politicians/${slugify(p.name)}`}
                style={politicianCardStyle}
              >
                <div style={avatarStyle}>
                  {p.name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div style={{ display: "grid", gap: 4 }}>
  <strong>{p.name}</strong>

  <span style={{ color: "#64748b", fontSize: 14 }}>
                    {p.count} {labels[lang].topic} · {p.votes}{" "}
                    {labels[lang].vote}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
      <section style={sectionStyle}>
  <div style={sectionHeaderStyle}>
    <h2 style={sectionTitleStyle}>🔥 Trending Topics</h2>
  </div>

  <div style={trendingRowStyle}>
    {trendingTopics.map((topic) => (
      <a
        key={topic.slug}
        href={`/topics/${topic.slug}`}
        style={trendingTopicStyle}
      >
        #{topic.name}
      </a>
    ))}
  </div>
</section>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>
            {mode === "latest" ? "🆕" : "🔥"}{" "}
            {mode === "latest" ? labels[lang].latest : labels[lang].top}
          </h2>

          <div style={tabRowStyle}>
            <button
              onClick={() => setMode("latest")}
              style={mode === "latest" ? activeTabStyle : tabStyle}
            >
              {labels[lang].latest}
            </button>
            <button
              onClick={() => setMode("top")}
              style={mode === "top" ? activeTabStyle : tabStyle}
            >
              {labels[lang].top}
            </button>
          </div>
        </div>

        {visibleItems.length === 0 && (
          <div style={emptyStyle}>{labels[lang].noContent}</div>
        )}
        <section style={sectionStyle}>
  <div style={sectionHeaderStyle}>
    <h2 style={sectionTitleStyle}>🏆 Most Voted</h2>
  </div>

  <div style={gridStyle}>
    {mostVotedItems.map((item) => (
      <a
        key={item.id}
        href={`/contradictions/${item.slug}`}
        style={cardStyle}
      >
        <div style={tagRowStyle}>
          <span style={darkTagStyle}>
            {getTopic(item, lang) || labels[lang].noTopic}
          </span>

          <span style={voteTagStyle}>
            👍 {voteCount(item.id)} {labels[lang].vote}
          </span>
        </div>

        <h3 style={{ fontSize: 24, marginTop: 10 }}>
          {item.politician}
        </h3>

        <p style={{ color: "#475569", marginTop: 8 }}>
          {item.old_statement?.slice(0, 120)}...
        </p>
      </a>
    ))}
  </div>
</section>

        <div style={gridStyle}>
          {visibleItems.map((item) => (
            <ContradictionCard
              key={item.id}
              item={item}
              voteCount={voteCount(item.id)}
              yesPercent={yesPercent(item.id)}
              lang={lang}
            />
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}

function ContradictionCard({
  item,
  voteCount,
  yesPercent,
  lang,
}: {
  item: Item;
  voteCount: number;
  yesPercent: number;
  lang: Lang;
}) {
  const cardSlug =
    item.slug ||
    slugify(`${item.politician || "case"}-${item.topic || "topic"}`);

  const summary = getAiSummary(item, lang);

  return (
    <article style={cardStyle}>
      <div style={cardTopStyle}>
        <div>
          <div style={tagRowStyle}>
            <a
  href={`/topics/${slugify(getTopic(item, lang) || item.topic || "")}`}
  style={{
    ...darkTagLinkStyle,
    border: "1px solid rgba(255,255,255,0.15)",
  }}
  title="Open topic page"
>
  {getTopic(item, lang) || labels[lang].noTopic} →
</a>

            {item.language && (
              <span style={lightTagStyle}>{item.language.toUpperCase()}</span>
            )}

            <span style={voteTagStyle}>
              👍 {yesPercent}% · {voteCount}{" "}
              {lang === "de" && voteCount === 1
                ? "Stimme"
                : labels[lang].vote}
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
            )}{" "}
            – {getTopic(item, lang) || labels[lang].topic}
          </h2>
        </div>

        <a href={`/contradictions/${cardSlug}`} style={openButtonStyle}>
          {labels[lang].open} →
        </a>
      </div>

      <div style={compareGridStyle}>
        <div style={oldBoxStyle}>
          <strong>{labels[lang].old}</strong>
          <p>{item.old_statement || labels[lang].noOldStatement}</p>
          <small>{item.old_date || labels[lang].unknownDate}</small>
        </div>

        <div style={newBoxStyle}>
          <strong>{labels[lang].now}</strong>
          <p>{item.new_statement || labels[lang].noNewStatement}</p>
          <small>{item.new_date || labels[lang].unknownDate}</small>
        </div>
      </div>

      {summary && <p style={summaryStyle}>🤖 {summary}</p>}

      <div style={footerStyle}>
        <span>
  {labels[lang].published}:{" "}
  {item.published_at ? item.published_at.slice(0, 10) : "-"}
</span>

<span>👀 {item.views || 0}</span>

        <div style={{ display: "flex", gap: 10 }}>
          {item.old_source && (
            <a href={item.old_source} target="_blank" rel="noreferrer">
              {labels[lang].oldSource}
            </a>
          )}

          {item.new_source && (
            <a href={item.new_source} target="_blank" rel="noreferrer">
              {labels[lang].newSource}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}



const topBarStyle: CSSProperties = {
  
  maxWidth: 1180,
  margin: "0 auto 18px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 22,
  background: "rgba(255,255,255,0.62)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 14px 35px rgba(15,23,42,0.06)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const brandStyle: CSSProperties = {
  fontWeight: 950,
  letterSpacing: -0.6,
  fontSize: 18,
};

const langSwitcherStyle: CSSProperties = {
  display: "flex",
  gap: 6,
};

const heroStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 30px",
  position: "relative",
  overflow: "hidden",
  display: "grid",
  gridTemplateColumns:
  typeof window !== "undefined" && window.innerWidth < 900
    ? "1fr"
    : "1.4fr 0.8fr",
  gap: 22,
  background: "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,250,252,0.82))",
  
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 34,
  padding: 36,
  boxShadow:
    "0 28px 80px rgba(15, 23, 42, 0.13), inset 0 1px 0 rgba(255,255,255,0.9)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  background:
    "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
  color: "white",
  padding: "8px 14px",
  borderRadius: 999,
  fontSize: 12,
  letterSpacing: 0.5,
  fontWeight: 900,
  marginBottom: 18,
  boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
};

const titleStyle: CSSProperties = {
  fontSize: "clamp(38px, 6vw, 68px)",
  lineHeight: 0.98,
  margin: "0 0 18px",
  fontWeight: 950,
  letterSpacing: "-2.4px",
};

const leadStyle: CSSProperties = {
  fontSize: 19,
  color: "#cbd5e1",
  lineHeight: 1.65,
  maxWidth: 760,
  marginBottom: 24,
};

const heroPanelStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const miniStatStyle: CSSProperties = {
  background: "rgba(15,23,42,0.72)",
border: "1px solid #dbe0e6",
  borderRadius: 22,
  padding: 18,
  display: "grid",
  color: "#f8fafc",
backdropFilter: "blur(10px)",
  boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
  
  WebkitBackdropFilter: "blur(12px)",
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

const sectionStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 28px",
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
  fontSize: 30,
  margin: 0,
  fontWeight: 950,
};

const politicianGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
};

const politicianCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 16,
  display: "flex",
  gap: 12,
  alignItems: "center",
  textDecoration: "none",
  color: "#0f172a",
  boxShadow:
  "0 18px 42px rgba(15, 23, 42, 0.08)",
  
  
  
  transition: "all 0.2s ease",
cursor: "pointer",
};

const avatarStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 16,
  background: "#0f172a",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
};

const tabRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
};

const tabStyle: CSSProperties = {
  padding: "9px 13px",
  border: "1px solid #cbd5e1",
  borderRadius: 999,
  background: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const activeTabStyle: CSSProperties = {
  ...tabStyle,
  background:
    "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
  color: "white",
  borderColor: "rgba(255,255,255,0.2)",
  boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
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
  transition: "all 0.22s ease",
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  marginBottom: 16,
};

const tagRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 10,
};

const darkTagStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
  color: "white",
  padding: "6px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.3,
  boxShadow: "0 8px 22px rgba(15,23,42,0.16)",
};

const lightTagStyle: CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  color: "#0f172a",
  padding: "6px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  border: "1px solid rgba(226,232,240,0.9)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const voteTagStyle: CSSProperties = {
  background: "rgba(220,252,231,0.9)",
  color: "#166534",
  padding: "6px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  border: "1px solid rgba(134,239,172,0.8)",
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
  transition: "all 0.22s ease",
  boxShadow: "0 14px 30px rgba(15,23,42,0.18)",
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

const politicianLinkStyle: CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  borderBottom: "2px solid #0f172a",
  cursor: "pointer",
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
const spotlightStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 30px",
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
  color: "white",
  borderRadius: 34,
  padding: 34,
  boxShadow: "0 28px 80px rgba(15, 23, 42, 0.22)",
};

const spotlightBadgeStyle: CSSProperties = {
  display: "inline-block",
  background: "rgba(255,255,255,0.14)",
  color: "white",
  padding: "7px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 14,
};

const spotlightTitleStyle: CSSProperties = {
  fontSize: "clamp(28px, 4vw, 42px)",
  lineHeight: 1.08,
  margin: "0 0 20px",
  fontWeight: 950,
  letterSpacing: "-1px",
};

const spotlightFooterStyle: CSSProperties = {
  marginTop: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  fontWeight: 900,
};
const darkTagLinkStyle: CSSProperties = {
  ...darkTagStyle,
  textDecoration: "none",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 0 0 rgba(0,0,0,0)",
};
const navStyle: CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  flexWrap: "wrap",
};

const navLinkStyle: CSSProperties = {
  color: "#334155",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 14,
};
const countryFilterStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 16,
};

const countryButtonStyle: CSSProperties = {
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

const activeCountryButtonStyle: CSSProperties = {
  ...countryButtonStyle,
  background:
    "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
  color: "white",
  borderColor: "rgba(255,255,255,0.25)",
  boxShadow: "0 12px 28px rgba(79,70,229,0.32)",
};
const trendingRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const trendingTopicStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: 999,
  background: "#0f172a",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
  boxShadow: "0 10px 24px rgba(15,23,42,0.12)",
};