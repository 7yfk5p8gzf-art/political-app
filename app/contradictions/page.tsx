"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

import { detectBrowserLang, saveLang, t, type Lang } from "@/lib/i18n";

type Item = {
  id: string;
  slug: string;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
  old_source: string | null;
  new_source: string | null;
  politician: string | null;
  topic: string | null;
  country?: string | null;
  language?: string | null;
  ai_summary: string | null;
  published_at: string | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
  vote_type: "yes" | "no";
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PublicContradictionsPage() {
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
    if (!q) return items;

    return items.filter((item) =>
      [
        item.politician,
        item.topic,
        item.country,
        item.language,
        item.old_statement,
        item.new_statement,
        item.ai_summary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [items, search]);

  const latestItems = filteredItems.slice(0, 4);

  const topItems = [...filteredItems]
    .sort((a, b) => voteCount(b.id) - voteCount(a.id))
    .filter((item) => !latestItems.some((latest) => latest.id === item.id))
    .slice(0, 4);

  return (
    <main style={pageStyle}>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
  {(["hu", "de", "en", "fr"] as Lang[]).map((l) => (
    <button
      key={l}
      onClick={() => {
        setLang(l);
        saveLang(l);
      }}
      style={
        lang === l
          ? activeLangButtonStyle
          : langButtonStyle
      }
    >
      {l.toUpperCase()}
    </button>
  ))}
</div>
      <section style={heroStyle}>
        <div style={badgeStyle}>{t[lang].publicBeta}</div>

        <h1 style={titleStyle}>{t[lang].contradictionsTitle}</h1>

        <p style={leadStyle}>
          {t[lang].heroLead}
      
        </p>

        <div style={statsRowStyle}>
          <div style={statBoxStyle}>
            <strong>{items.length}</strong>
            <span>{t[lang].publishedCases}</span>
          </div>

          <div style={statBoxStyle}>
            <strong>{new Set(items.map((i) => i.politician).filter(Boolean)).size}</strong>
            <span>{t[lang].politicians}</span>
          </div>

          <div style={statBoxStyle}>
            <strong>{new Set(items.map((i) => i.topic).filter(Boolean)).size}</strong>
            <span>{t[lang].topics}</span>
          </div>

          <div style={statBoxStyle}>
            <strong>{votes.length}</strong>
            <span>{t[lang].votes}</span>
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t[lang].search}
          style={searchStyle}
        />
      </section>

      {filteredItems.length === 0 && (
        <div style={emptyStyle}>Nincs még publikált tartalom vagy nincs találat.</div>
      )}

      {latestItems.length > 0 && (
        <>
          <section style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>🆕 {t[lang].latest}</h2>
            <p style={mutedStyle}>{filteredItems.length} {t[lang].results}</p>
          </section>

          <div style={gridStyle}>
            {latestItems.map((item) => (
              <ContradictionCard
                key={item.id}
                item={item}
                voteCount={voteCount(item.id)}
                yesPercent={yesPercent(item.id)}
                lang={lang}
              />
            ))}
          </div>
        </>
      )}

      {topItems.length > 0 && (
        <>
          <section style={{ ...sectionHeaderStyle, marginTop: 30 }}>
            <h2 style={sectionTitleStyle}>🔥 {t[lang].top}</h2>
            <p style={mutedStyle}>legtöbb szavazat alapján</p>
          </section>

          <div style={gridStyle}>
            {topItems.map((item) => (
              <ContradictionCard
                key={item.id}
                item={item}
                voteCount={voteCount(item.id)}
                yesPercent={yesPercent(item.id)}
                lang={lang}
              />
            ))}
          </div>
        </>
      )}
    </main>
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
  return (
    <article style={cardStyle}>
      <div style={cardTopStyle}>
        <div>
          <div style={tagRowStyle}>
            <span style={darkTagStyle}>{item.topic || "Nincs téma"}</span>
            {item.language && (
              <span style={lightTagStyle}>{item.language.toUpperCase()}</span>
            )}
            <span style={voteTagStyle}>👍 {yesPercent}% · {voteCount} vote</span>
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
              "Ismeretlen"
            )}{" "}
            – {item.topic || "téma"}
          </h2>
        </div>

        <a href={`/contradictions/${item.slug}`} style={openButtonStyle}>
        {t[lang].open} →
        </a>
      </div>

      <div style={compareGridStyle}>
        <div style={oldBoxStyle}>
          <strong>{t[lang as keyof typeof t].old}</strong>
          <p>{item.old_statement || "Nincs régi állítás"}</p>
          <small>{item.old_date || "{t[lang].unknownDate}"}</small>
        </div>

        <div style={newBoxStyle}>
          <strong>{t[lang].now}</strong>
          <p>{item.new_statement || "Nincs új állítás"}</p>
          <small>{item.new_date || "{t[lang].unknownDate}"}</small>
        </div>
      </div>

      {item.ai_summary && <p style={summaryStyle}>🤖 {item.ai_summary}</p>}

      <div style={footerStyle}>
        <span>
          {t[lang].published}: {item.published_at ? item.published_at.slice(0, 10) : "-"}
        </span>

        <div style={{ display: "flex", gap: 10 }}>
          {item.old_source && (
            <a href={item.old_source} target="_blank" rel="noreferrer">
              Régi forrás
            </a>
          )}
          {item.new_source && (
            <a href={item.new_source} target="_blank" rel="noreferrer">
              Új forrás
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  padding: "34px 18px",
  color: "#0f172a",
};

const heroStyle: CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 28px",
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 22,
  padding: 32,
  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.07)",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  background: "#0f172a",
  color: "white",
  padding: "6px 11px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 14,
};

const titleStyle: CSSProperties = {
  fontSize: 48,
  lineHeight: 1.05,
  margin: "0 0 14px",
  fontWeight: 950,
};

const leadStyle: CSSProperties = {
  fontSize: 18,
  color: "#475569",
  lineHeight: 1.6,
  maxWidth: 760,
};

const statsRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  margin: "24px 0",
};

const statBoxStyle: CSSProperties = {
  minWidth: 140,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 14,
  display: "grid",
  gap: 4,
};

const searchStyle: CSSProperties = {
  width: "100%",
  padding: 14,
  border: "1px solid #cbd5e1",
  borderRadius: 14,
  fontSize: 16,
};

const sectionHeaderStyle: CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 12,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 28,
  margin: 0,
  fontWeight: 950,
};

const mutedStyle: CSSProperties = {
  color: "#64748b",
  fontWeight: 700,
};

const emptyStyle: CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
};

const gridStyle: CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
  display: "grid",
  gap: 18,
};

const cardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 20,
  padding: 22,
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
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
  fontSize: 25,
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
};

const newBoxStyle: CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  borderRadius: 16,
  padding: 16,
  lineHeight: 1.5,
};

const summaryStyle: CSSProperties = {
  marginTop: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  padding: 14,
  borderRadius: 14,
  lineHeight: 1.55,
};

const footerStyle: CSSProperties = {
  marginTop: 14,
  paddingTop: 12,
  borderTop: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  color: "#64748b",
  fontSize: 13,
  fontWeight: 700,
};

const politicianLinkStyle: CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  borderBottom: "2px solid #0f172a",
  cursor: "pointer",
  transition: "0.2s",
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