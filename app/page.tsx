"use client";

import { useEffect, useMemo, useState } from "react";
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
  published_at: string | null;
};

type Vote = {
  id: number;
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

export default function HomePage() {
  const [items, setItems] = useState<Contradiction[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [search, setSearch] = useState("");
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
      .maybeSingle();

    setShowAdmin(
      !!profile &&
        ["admin", "superadmin", "editor", "reviewer"].includes(profile.role)
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setShowAdmin(false);
  }

  async function load() {
    const { data: cData } = await supabase
      .from("contradictions")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    const { data: vData } = await supabase
      .from("contradiction_votes")
      .select("*");

    setItems(cData || []);
    setVotes((vData || []) as Vote[]);
  }

  function getStats(id: string) {
    const related = votes.filter((v) => v.contradiction_id === id);
    const total = related.length;
    const yes = related.filter((v) => v.vote_type === "yes").length;
    const percent = total > 0 ? Math.round((yes / total) * 100) : 0;

    return { total, percent };
  }

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;

    return items.filter((item) =>
      [
        item.politician,
        item.topic,
        item.language,
        item.old_statement,
        item.new_statement,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [items, search]);

  const latestItems = filteredItems.slice(0, 3);

  const topItems = [...filteredItems]
    .sort((a, b) => getStats(b.id).total - getStats(a.id).total)
    .filter((item) => !latestItems.some((latest) => latest.id === item.id))
    .slice(0, 3);

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <div style={topBarStyle}>
          <a href="/" style={brandStyle}>
            Political Compare
          </a>

          <div style={navStyle}>
            <a href="/contradictions" style={navLinkStyle}>
              Ellentmondások
            </a>

            {showAdmin && (
              <a href="/admin" style={navLinkStyle}>
                Admin
              </a>
            )}

            {isLoggedIn ? (
              <button onClick={logout} style={smallButtonStyle}>
                Kilépés
              </button>
            ) : (
              <a href="/login" style={smallButtonStyle}>
                Belépés
              </a>
            )}
          </div>
        </div>

        <header style={heroStyle}>
          <div style={heroBadgeStyle}>Public beta</div>

          <h1 style={titleStyle}>
            Ki mit mondott régen — és mit mond most?
          </h1>

          <p style={leadStyle}>
            Forrásalapú politikai összehasonlítások dátumokkal, AI-elemzéssel,
            videókkal és közösségi szavazással.
          </p>

          <div style={buttonRowStyle}>
            <a href="/contradictions" style={primaryButtonStyle}>
              Ellentmondások megnyitása →
            </a>

            <a href="#latest" style={secondaryButtonStyle}>
              Legfrissebbek ↓
            </a>
          </div>

          <div style={statsRowStyle}>
            <div style={statBoxStyle}>
              <strong>{items.length}</strong>
              <span>publikált ügy</span>
            </div>

            <div style={statBoxStyle}>
              <strong>
                {new Set(items.map((i) => i.politician).filter(Boolean)).size}
              </strong>
              <span>politikus</span>
            </div>

            <div style={statBoxStyle}>
              <strong>
                {new Set(items.map((i) => i.topic).filter(Boolean)).size}
              </strong>
              <span>téma</span>
            </div>

            <div style={statBoxStyle}>
              <strong>{votes.length}</strong>
              <span>szavazat</span>
            </div>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keresés politikus, téma vagy állítás szerint..."
            style={searchStyle}
          />
        </header>

        {filteredItems.length === 0 && (
          <div style={emptyStyle}>Nincs publikált tartalom vagy nincs találat.</div>
        )}

        {latestItems.length > 0 && (
          <section id="latest" style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={sectionTitleStyle}>🆕 Legfrissebb ellentmondások</h2>
              <a href="/contradictions" style={sectionLinkStyle}>
                Összes megnyitása →
              </a>
            </div>

            <div style={gridStyle}>
              {latestItems.map((item) => (
                <HomeCard key={item.id} item={item} stats={getStats(item.id)} />
              ))}
            </div>
          </section>
        )}

        {topItems.length > 0 && (
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={sectionTitleStyle}>🔥 Legnagyobb ellentmondások</h2>
              <p style={mutedStyle}>legtöbb szavazat alapján</p>
            </div>

            <div style={gridStyle}>
              {topItems.map((item) => (
                <HomeCard key={item.id} item={item} stats={getStats(item.id)} />
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function HomeCard({
  item,
  stats,
}: {
  item: Contradiction;
  stats: { total: number; percent: number };
}) {
  return (
    <article style={cardStyle}>
      <div style={tagRowStyle}>
        <span style={darkTagStyle}>{item.topic || "Nincs téma"}</span>
        {item.language && (
          <span style={lightTagStyle}>{item.language.toUpperCase()}</span>
        )}
        <span style={voteTagStyle}>
          👍 {stats.percent}% · {stats.total} vote
        </span>
      </div>

      <h3 style={headlineStyle}>
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
      </h3>

      <div style={miniGridStyle}>
        <div style={oldBoxStyle}>
          <strong>RÉGEN</strong>
          <p>{item.old_statement || "Nincs régi állítás"}</p>
        </div>

        <div style={newBoxStyle}>
          <strong>MOST</strong>
          <p>{item.new_statement || "Nincs új állítás"}</p>
        </div>
      </div>

      <a href={`/contradictions/${item.slug}`} style={openStyle}>
        Megnyitás →
      </a>
    </article>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  padding: "26px 18px 42px",
  color: "#0f172a",
};

const containerStyle: CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
};

const topBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 18,
  flexWrap: "wrap",
};

const brandStyle: CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  fontSize: 20,
  fontWeight: 950,
};

const navStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const navLinkStyle: CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 800,
};

const smallButtonStyle: CSSProperties = {
  padding: "9px 12px",
  border: "1px solid #cbd5e1",
  background: "white",
  borderRadius: 10,
  cursor: "pointer",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 800,
};

const heroStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 24,
  padding: 34,
  marginBottom: 30,
  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.07)",
};

const heroBadgeStyle: CSSProperties = {
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
  fontSize: 56,
  lineHeight: 1.04,
  margin: "0 0 14px",
  fontWeight: 950,
  maxWidth: 900,
};

const leadStyle: CSSProperties = {
  fontSize: 18,
  color: "#475569",
  lineHeight: 1.6,
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
  background: "#0f172a",
  color: "white",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
};

const secondaryButtonStyle: CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  background: "white",
  color: "#0f172a",
  border: "1px solid #0f172a",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
};

const statsRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  margin: "26px 0",
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

const sectionStyle: CSSProperties = {
  marginTop: 28,
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 12,
  marginBottom: 16,
  flexWrap: "wrap",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 28,
  margin: 0,
  fontWeight: 950,
};

const sectionLinkStyle: CSSProperties = {
  color: "#0f172a",
  fontWeight: 900,
};

const mutedStyle: CSSProperties = {
  color: "#64748b",
  fontWeight: 700,
  margin: 0,
};

const emptyStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 18,
};

const cardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 20,
  padding: 22,
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
};

const tagRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 12,
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

const headlineStyle: CSSProperties = {
  fontSize: 24,
  lineHeight: 1.18,
  margin: "0 0 14px",
  fontWeight: 950,
};

const politicianLinkStyle: CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  borderBottom: "2px solid #0f172a",
};

const miniGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const oldBoxStyle: CSSProperties = {
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  borderRadius: 16,
  padding: 14,
  lineHeight: 1.5,
};

const newBoxStyle: CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  borderRadius: 16,
  padding: 14,
  lineHeight: 1.5,
};

const openStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 14,
  padding: "10px 13px",
  background: "#0f172a",
  color: "white",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
};