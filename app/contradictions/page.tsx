"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  language: string | null;
  slug: string | null;
  old_statement: string | null;
  old_date: string | null;
  old_source: string | null;
  new_statement: string | null;
  new_date: string | null;
  new_source: string | null;
  ai_summary: string | null;
  status: string | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
  vote_type: "yes" | "no";
  user_id: string | null;
};

export default function ContradictionsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Contradiction[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contradictions")
      .select("*")
      .eq("status", "published")
      .order("id", { ascending: false });

    if (error) console.error("Contradictions load error:", error);

    const { data: voteData } = await supabase
      .from("contradiction_votes")
      .select("*");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let myVotes: Vote[] = [];

    if (user) {
      const { data: myVoteData } = await supabase
        .from("contradiction_votes")
        .select("*")
        .eq("user_id", user.id);

      myVotes = (myVoteData || []) as Vote[];
    }

    setItems(data || []);
    setVotes((voteData || []) as Vote[]);
    setUserVotes(myVotes);
    setLoading(false);
  }

  async function vote(itemId: string, value: "yes" | "no") {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("A szavazáshoz be kell jelentkezned.");
      return;
    }

    const { error } = await supabase.from("contradiction_votes").insert([
      {
        contradiction_id: itemId,
        vote_type: value,
        user_id: user.id,
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        alert("Erre már szavaztál.");
        await load();
        return;
      }

      alert("Szavazási hiba: " + error.message);
      return;
    }

    await load();
  }

  function getVoteStats(itemId: string) {
    const related = votes.filter((v) => v.contradiction_id === itemId);
    const yes = related.filter((v) => v.vote_type === "yes").length;
    const no = related.filter((v) => v.vote_type === "no").length;
    const total = yes + no;
    const percent = total > 0 ? Math.round((yes / total) * 100) : null;

    return { yes, no, total, percent };
  }

  function hasUserVoted(itemId: string) {
    return userVotes.some((v) => v.contradiction_id === itemId);
  }

  function getBadge(item: Contradiction) {
  const text = (item.ai_summary || "").toLowerCase();

  let badge = "NINCS";
  let color = "#166534"; // zöld

  if (
    text.includes("ellentmondás") &&
    (text.includes("jelentős") ||
      text.includes("egyértelmű") ||
      text.includes("ellentétes"))
  ) {
    badge = "ELLENTMONDÁS";
    color = "#991b1b"; // piros
  } else if (
    text.includes("részben") ||
    text.includes("nem teljesen") ||
    text.includes("kontekstus")
  ) {
    badge = "RÉSZBEN";
    color = "#92400e"; // narancs
  }

  return { badge, badgeColor: color };
}

  const filteredItems = items.filter((item) => {
    const text = `
      ${item.politician || ""}
      ${item.topic || ""}
      ${item.slug || ""}
      ${item.old_statement || ""}
      ${item.new_statement || ""}
      ${item.old_source || ""}
      ${item.new_source || ""}
      ${item.ai_summary || ""}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const topItems = items
  .filter((item) => {
    const stats = getVoteStats(item.id);

    if (stats.total < 3) return false; // 👈 EZ AZ ÚJ

    const noPercent = 100 - stats.percent!;

    return stats.percent! >= 50 || noPercent >= 50;
  })
  .sort((a, b) => {
    const aStats = getVoteStats(a.id);
    const bStats = getVoteStats(b.id);

    return bStats.total - aStats.total;
  })
  .slice(0, 10);

  function renderCard(item: Contradiction, rank?: number) {
    const alreadyVoted = hasUserVoted(item.id);
    const href = `/contradictions/${item.slug}`;

    const stats = getVoteStats(item.id);
    const { badge, badgeColor } = getBadge(item);

    return (
      <article
  key={item.id}
  style={{
    ...cardStyle,
    ...(hoveredId === item.id ? cardHoverStyle : {}),
  }}
  onMouseEnter={() => setHoveredId(item.id)}
  onMouseLeave={() => setHoveredId(null)}
  onClick={() => (router.push(href))}
>
        <div style={topRowStyle}>
          <p style={badgeStyle}>PUBLISHED</p>
          <h3 style={politicianBigStyle}>
            {rank ? `#${rank} ` : ""}
            {(item.politician || "Ismeretlen").toUpperCase()}
          </h3>
        </div>

        <div
          style={{
            display: "inline-block",
            padding: "6px 10px",
            background: badgeColor,
            color: "white",
            fontSize: 11,
            fontWeight: 900,
            marginBottom: 10,
            letterSpacing: 1,
          }}
        >
          {badge}
        </div>

        <h2 style={headlineStyle}>
          {item.politician
            ? `${item.politician} – álláspont változás`
            : "Ellentmondás elemzés"}
        </h2>

        {item.ai_summary && (
          <p style={summaryStyle}>
            {item.ai_summary.length > 220
              ? item.ai_summary.slice(0, 220) + "..."
              : item.ai_summary}
          </p>
        )}

        <div style={metaStyle}>
          <span>{item.topic || "nincs téma"}</span>
          <span>{item.language?.toUpperCase() || "HU"}</span>
          <span>RÉGEN: {item.old_statement || "nincs adat"}</span>
          <span>MOST: {item.new_statement || "nincs adat"}</span>
        </div>

        <div style={compareGridStyle}>
          <div style={miniBoxStyle}>
            <p style={labelStyle}>RÉGEN</p>
            <strong>{item.old_statement || "Nincs régi állítás"}</strong>
          </div>

          <div style={miniBoxStyle}>
            <p style={labelStyle}>MOST</p>
            <strong>{item.new_statement || "Nincs új állítás"}</strong>
          </div>
        </div>

        {stats.percent !== null && (
  <div style={voteResultBoxStyle}>
    <p style={voteStatStyle}>
      👍 {stats.percent}% szerint ellentmondás ({stats.total} szavazat)
    </p>

    <div style={progressTrackStyle}>
      <div
        style={{
          ...progressFillStyle,
          width: `${stats.percent}%`,
          background:
  stats.total === 0
    ? "#9ca3af" // szürke ha nincs szavazat
    : stats.percent >= 50
    ? "#16a34a" // zöld
    : "#dc2626", // piros

        }}
      />
    </div>
  </div>
)}

        <div style={voteBoxStyle} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => vote(item.id, "yes")}
            disabled={alreadyVoted}
            style={{
              ...voteYesStyle,
              opacity: alreadyVoted ? 0.5 : 1,
              cursor: alreadyVoted ? "not-allowed" : "pointer",
            }}
          >
            👍 Van ellentmondás
          </button>

          <button
            onClick={() => vote(item.id, "no")}
            disabled={alreadyVoted}
            style={{
              ...voteNoStyle,
              opacity: alreadyVoted ? 0.5 : 1,
              cursor: alreadyVoted ? "not-allowed" : "pointer",
            }}
          >
            👎 Nincs
          </button>

          {alreadyVoted && (
            <p style={alreadyVotedStyle}>Már szavaztál erre.</p>
          )}
        </div>

        <a href={href} style={openStyle} onClick={(e) => e.stopPropagation()}>
          Cikk megnyitása →
        </a>
      </article>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <header style={headerStyle}>
          <div>
            <p style={kickerStyle}>POLITIKAI ÖSSZEHASONLÍTÓ</p>
            <h1 style={titleStyle}>Ellentmondások</h1>
            <p style={leadStyle}>
              Régi és új nyilatkozatok összehasonlítása források, dátumok és
              összefoglalók alapján.
            </p>
          </div>

          <a href="/admin" style={adminLinkStyle}>
            ← Admin dashboard
          </a>
        </header>

        <div style={toolbarStyle}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keresés: politikus, téma, állítás, forrás..."
            style={searchStyle}
          />

          <div style={counterStyle}>
            {loading
              ? "Betöltés..."
              : `${filteredItems.length} találat / ${items.length} publikus`}
          </div>
        </div>

        {loading && <div style={emptyStyle}>Publikus cikkek betöltése...</div>}

        {!loading && filteredItems.length === 0 && (
          <div style={emptyStyle}>
            Még nincs publikus ellentmondás, vagy nincs találat.
          </div>
        )}

        {!loading && topItems.length > 0 && (
          <>
            <h2 style={sectionTitleStyle}>🔥 Legnagyobb ellentmondások</h2>
            <div style={gridStyle}>
              {topItems.map((item, index) => renderCard(item, index + 1))}
            </div>
          </>
        )}

        <h2 style={sectionTitleStyle}>🆕 Összes publikus ellentmondás</h2>

        <div style={gridStyle}>
          {filteredItems.map((item) => renderCard(item))}
        </div>
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

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "flex-start",
  borderBottom: "4px solid #111827",
  padding: "20px 0 28px",
  marginBottom: 22,
};

const kickerStyle: CSSProperties = {
  fontWeight: 900,
  letterSpacing: 4,
  fontSize: 13,
  margin: 0,
};

const titleStyle: CSSProperties = {
  fontSize: 58,
  lineHeight: 1,
  margin: "8px 0",
  fontFamily: "serif",
};

const leadStyle: CSSProperties = {
  fontSize: 18,
  color: "#374151",
  maxWidth: 760,
};

const adminLinkStyle: CSSProperties = {
  color: "#111827",
  fontWeight: 900,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const toolbarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  background: "#fffaf0",
  border: "1px solid #d6d3c7",
  padding: 18,
  marginBottom: 22,
};

const searchStyle: CSSProperties = {
  padding: "13px 14px",
  width: "100%",
  maxWidth: 560,
  border: "1px solid #9ca3af",
  fontSize: 16,
  background: "white",
};

const counterStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: "serif",
  fontSize: 34,
  margin: "32px 0 18px",
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
  display: "flex",
  flexDirection: "column",
  height: "100%",
  boxShadow: "0 8px 24px rgba(17, 24, 39, 0.06)",
  cursor: "pointer",
  transition: "all 0.18s ease",
};
const cardHoverStyle: CSSProperties = {
  transform: "translateY(-4px)",
  boxShadow: "0 14px 34px rgba(17, 24, 39, 0.14)",
  borderColor: "#111827",
};

const topRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  background: "#111827",
  color: "white",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.2,
  margin: 0,
};

const politicianBigStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 900,
  letterSpacing: 0.5,
};

const headlineStyle: CSSProperties = {
  fontSize: 25,
  lineHeight: 1.12,
  margin: "18px 0 10px",
  fontFamily: "serif",
  minHeight: 58,
};

const summaryStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.4,
  color: "#374151",
  marginBottom: 12,
  maxHeight: 90,
  overflow: "hidden",
};

const metaStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  color: "#6b7280",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 14,
};

const compareGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginTop: 16,
};

const miniBoxStyle: CSSProperties = {
  background: "#f8f4ea",
  borderLeft: "4px solid #1f2937",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
  padding: 16,
  minHeight: 88,
};

const labelStyle: CSSProperties = {
  color: "#6b7280",
  fontWeight: 900,
  fontSize: 12,
  margin: "0 0 8px",
  letterSpacing: 1,
};

const voteStatStyle: CSSProperties = {
  marginTop: 14,
  marginBottom: 0,
  fontWeight: 900,
};

const alreadyVotedStyle: CSSProperties = {
  width: "100%",
  margin: "4px 0 0",
  fontSize: 13,
  fontWeight: 900,
  color: "#166534",
};

const voteBoxStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 14,
};

const voteYesStyle: CSSProperties = {
  padding: "9px 12px",
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const voteNoStyle: CSSProperties = {
  padding: "9px 12px",
  border: "1px solid #111827",
  background: "#fffaf0",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 900,
};

const openStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "flex-start",
  marginTop: 18,
  padding: "11px 15px",
  background: "#111827",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
  cursor: "pointer",
};

const emptyStyle: CSSProperties = {
  padding: 24,
  border: "1px solid #111827",
  background: "#fffaf0",
  fontWeight: 800,
  marginBottom: 20,
};
const voteResultBoxStyle: CSSProperties = {
  marginTop: 14,
};

const progressTrackStyle: CSSProperties = {
  width: "100%",
  height: 8,
  background: "#e5e7eb",
  marginTop: 8,
  overflow: "hidden",
};

const progressFillStyle: CSSProperties = {
  height: "100%",
  transition: "width 0.3s ease",
};