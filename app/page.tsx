"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  language: string | null;
  slug: string | null;
  old_statement: string | null;
  new_statement: string | null;
  status: string | null;
};

type Vote = {
  id: number;
  contradiction_id: string;
  vote_type: "yes" | "no";
};

export default function HomePage() {
  const [items, setItems] = useState<Contradiction[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("all");
  const [activeLang, setActiveLang] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    load();
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoggedIn(false);
      setShowAdmin(false);
      return;
    }

    setIsLoggedIn(true);

    const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

setShowAdmin(!!profile && ["admin", "editor"].includes(profile.role));
  }

  async function logout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setShowAdmin(false);
    alert("Kijelentkeztél.");
  }

  async function load() {
    const { data: cData } = await supabase
      .from("contradictions")
      .select("*")
      .eq("status", "published")
      .order("id", { ascending: false });

    const { data: vData } = await supabase
      .from("contradiction_votes")
      .select("*");

    setItems(cData || []);
    setVotes(vData || []);
  }

  function getStats(id: string) {
    const related = votes.filter(
      (v) => String(v.contradiction_id) === String(id)
    );

    const total = related.length;
    const yes = related.filter((v) => v.vote_type === "yes").length;
    const percent = total > 0 ? Math.round((yes / total) * 100) : 0;

    return { total, percent };
  }

  function langLabel(lang: string | null) {
    if (lang === "hu") return "HU";
    if (lang === "en") return "EN";
    if (lang === "de") return "DE";
    return "Nincs nyelv";
  }

  const topics = Array.from(
    new Set(
      items
        .map((i) => i.topic?.trim())
        .filter((t): t is string => Boolean(t))
    )
  );

  const filteredItems = items.filter((item) => {
    const text = `${item.politician || ""} ${item.topic || ""} ${
      item.old_statement || ""
    } ${item.new_statement || ""}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());
    const matchesTopic =
      activeTopic === "all" || item.topic?.trim() === activeTopic;
    const matchesLang =
      activeLang === "all" || item.language?.trim() === activeLang;

    return matchesSearch && matchesTopic && matchesLang;
  });

  const latestItems = [...filteredItems].slice(0, 5);

  const topItems = [...filteredItems]
    .sort((a, b) => {
      const aStats = getStats(a.id);
      const bStats = getStats(b.id);

      if (bStats.total !== aStats.total) {
        return bStats.total - aStats.total;
      }

      return bStats.percent - aStats.percent;
    })
    .slice(0, 5);

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <div style={userBarStyle}>
          {isLoggedIn ? (
            <>
              <span>Bejelentkezve</span>
              <button onClick={logout} style={smallButtonStyle}>
                Kijelentkezés
              </button>
            </>
          ) : (
            <a href="/login" style={smallLinkStyle}>
              Belépés
            </a>
          )}
        </div>

        <header style={heroStyle}>
          <p style={kickerStyle}>POLITIKAI ÖSSZEHASONLÍTÓ</p>

          <h1 style={titleStyle}>
            Nézd meg, ki mit mondott régen — és mit mond most.
          </h1>

          <p style={leadStyle}>
            Forrásalapú összehasonlítások, AI magyarázat és közösségi szavazás.
          </p>

          <div style={buttonRowStyle}>
            <a href="/contradictions" style={primaryButtonStyle}>
              Ellentmondások megnyitása →
            </a>

            {showAdmin && (
              <a href="/admin/contradictions" style={secondaryButtonStyle}>
                Admin →
              </a>
            )}
          </div>
        </header>

        <div style={filterBoxStyle}>
          <input
            placeholder="Keresés politikusra, témára..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchStyle}
          />

          <div style={filterGroupStyle}>
            <button
              onClick={() => setActiveLang("all")}
              style={activeLang === "all" ? activeFilterStyle : filterButtonStyle}
            >
              Összes nyelv
            </button>
            <button
              onClick={() => setActiveLang("hu")}
              style={activeLang === "hu" ? activeFilterStyle : filterButtonStyle}
            >
              HU
            </button>
            <button
              onClick={() => setActiveLang("en")}
              style={activeLang === "en" ? activeFilterStyle : filterButtonStyle}
            >
              EN
            </button>
            <button
              onClick={() => setActiveLang("de")}
              style={activeLang === "de" ? activeFilterStyle : filterButtonStyle}
            >
              DE
            </button>
          </div>

          <div style={filterGroupStyle}>
            <button
              onClick={() => setActiveTopic("all")}
              style={
                activeTopic === "all" ? activeFilterStyle : filterButtonStyle
              }
            >
              Összes téma
            </button>

            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTopic(t)}
                style={activeTopic === t ? activeFilterStyle : filterButtonStyle}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <section style={topSectionStyle}>
          <h2 style={sectionTitleStyle}>🆕 Legfrissebb ellentmondások</h2>

          {latestItems.length === 0 && (
            <p>Még nincs publikált ellentmondás.</p>
          )}

          <div style={gridStyle}>
            {latestItems.map((item) => (
              <article key={item.id} style={cardStyle}>
                <div style={badgeRowStyle}>
                  <p style={badgeStyle}>{item.topic || "Nincs téma"}</p>
                  <p style={langBadgeStyle}>{langLabel(item.language)}</p>
                </div>

                <h3 style={headlineStyle}>
                  {item.politician || "Ismeretlen"}: régen mást mondott, mint
                  most?
                </h3>

                <div style={miniGridStyle}>
                  <div style={miniBoxStyle}>
                    <strong>RÉGEN</strong>
                    <p>{item.old_statement || "Nincs régi állítás"}</p>
                  </div>

                  <div style={miniBoxStyle}>
                    <strong>MOST</strong>
                    <p>{item.new_statement || "Nincs új állítás"}</p>
                  </div>
                </div>

                <a href="/contradictions" style={openStyle}>
                  Megnyitás →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section style={topSectionStyle}>
          <h2 style={sectionTitleStyle}>🔥 Legnagyobb ellentmondások</h2>

          {topItems.length === 0 && (
            <p>Még nincs publikált ellentmondás vagy szavazat.</p>
          )}

          <div style={gridStyle}>
            {topItems.map((item, index) => {
              const stats = getStats(item.id);

              return (
                <article key={item.id} style={cardStyle}>
                  <p style={rankStyle}>#{index + 1}</p>

                  <div style={badgeRowStyle}>
                    <p style={badgeStyle}>{item.topic || "Nincs téma"}</p>
                    <p style={langBadgeStyle}>{langLabel(item.language)}</p>
                  </div>

                  <h3 style={headlineStyle}>
                    {item.politician || "Ismeretlen"}: régen mást mondott, mint
                    most?
                  </h3>

                  <div style={miniGridStyle}>
                    <div style={miniBoxStyle}>
                      <strong>RÉGEN</strong>
                      <p>{item.old_statement || "Nincs régi állítás"}</p>
                    </div>

                    <div style={miniBoxStyle}>
                      <strong>MOST</strong>
                      <p>{item.new_statement || "Nincs új állítás"}</p>
                    </div>
                  </div>

                  <p style={statStyle}>
                    👍 {stats.percent}% szerint ellentmondás ({stats.total}{" "}
                    szavazat)
                  </p>

                  <a href="/contradictions" style={openStyle}>
                    Megnyitás →
                  </a>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f5f1e8",
  padding: 32,
  color: "#111827",
};

const containerStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
};

const userBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 12,
  marginBottom: 18,
  fontWeight: 700,
};

const smallButtonStyle: CSSProperties = {
  padding: "7px 10px",
  border: "1px solid #111827",
  background: "#fffaf0",
  cursor: "pointer",
  fontWeight: 800,
};

const smallLinkStyle: CSSProperties = {
  padding: "7px 10px",
  border: "1px solid #111827",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 800,
};

const heroStyle: CSSProperties = {
  borderTop: "1px solid #111827",
  borderBottom: "4px solid #111827",
  padding: "34px 0",
  marginBottom: 30,
};

const kickerStyle: CSSProperties = {
  fontWeight: 900,
  letterSpacing: 3,
  fontSize: 13,
  margin: 0,
};

const titleStyle: CSSProperties = {
  fontSize: 54,
  lineHeight: 1.05,
  margin: "12px 0",
  fontFamily: "serif",
  maxWidth: 900,
};

const leadStyle: CSSProperties = {
  fontSize: 19,
  color: "#374151",
  maxWidth: 760,
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 22,
};

const primaryButtonStyle: CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  background: "#111827",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
};

const secondaryButtonStyle: CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  border: "1px solid #111827",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 900,
};

const filterBoxStyle: CSSProperties = {
  marginBottom: 24,
  padding: 16,
  border: "1px solid #d6d3c7",
  background: "#fffaf0",
};

const searchStyle: CSSProperties = {
  padding: "10px 12px",
  width: "100%",
  maxWidth: 400,
  border: "1px solid #ccc",
  marginBottom: 12,
};

const filterGroupStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 10,
};

const filterButtonStyle: CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #111827",
  background: "#fffaf0",
  cursor: "pointer",
  fontWeight: 700,
};

const activeFilterStyle: CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const topSectionStyle: CSSProperties = {
  marginTop: 20,
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: "serif",
  fontSize: 34,
  marginBottom: 18,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 18,
};

const cardStyle: CSSProperties = {
  background: "#fffdf7",
  border: "1px solid #d6d3c7",
  padding: 22,
  position: "relative",
};

const rankStyle: CSSProperties = {
  position: "absolute",
  top: 14,
  right: 16,
  fontWeight: 900,
  fontSize: 22,
  color: "#9ca3af",
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "5px 10px",
  background: "#111827",
  color: "white",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1,
  margin: 0,
};

const langBadgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "5px 10px",
  border: "1px solid #111827",
  color: "#111827",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1,
  margin: 0,
};

const headlineStyle: CSSProperties = {
  fontFamily: "serif",
  fontSize: 28,
  lineHeight: 1.15,
  margin: "14px 0",
};

const miniGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 12,
};

const miniBoxStyle: CSSProperties = {
  background: "#f8f4ea",
  borderLeft: "4px solid #111827",
  padding: 14,
};

const statStyle: CSSProperties = {
  marginTop: 14,
  fontWeight: 900,
};

const openStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 10,
  padding: "9px 12px",
  background: "#111827",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
};