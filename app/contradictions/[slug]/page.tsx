"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  language: string | null;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
  old_source: string | null;
  new_source: string | null;
  ai_summary: string | null;
  status: string | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
  vote_type: "yes" | "no";
};

export default function ContradictionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [item, setItem] = useState<Item | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    load();
  }, [slug]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contradictions")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error(error);
      setItem(null);
      setLoading(false);
      return;
    }

    if (!data) {
      setItem(null);
      setLoading(false);
      return;
    }

    setItem(data);

    const { data: voteData } = await supabase
      .from("contradiction_votes")
      .select("*")
      .eq("contradiction_id", data.id);

    setVotes((voteData || []) as Vote[]);

    const localVote = localStorage.getItem(`vote_${data.id}`);
    setVoted(Boolean(localVote));

    setLoading(false);
  }

  async function vote(type: "yes" | "no") {
    if (!item || voted) return;

    const { error } = await supabase.from("contradiction_votes").insert({
      contradiction_id: item.id,
      vote_type: type,
    });

    if (error) {
      alert("Szavazási hiba: " + error.message);
      return;
    }

    localStorage.setItem(`vote_${item.id}`, type);
    setVoted(true);
    await load();
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert("Link kimásolva");
  }

  const totalVotes = votes.length;
  const yesVotes = votes.filter((v) => v.vote_type === "yes").length;
  const noVotes = totalVotes - yesVotes;
  const yesPercent = totalVotes ? Math.round((yesVotes / totalVotes) * 100) : 0;
  const noPercent = totalVotes ? 100 - yesPercent : 0;

  if (loading) {
    return (
      <main style={pageStyle}>
        <section style={containerStyle}>Betöltés...</section>
      </main>
    );
  }

  if (!item) {
    return (
      <main style={pageStyle}>
        <section style={containerStyle}>
          <a href="/contradictions" style={backStyle}>
            ← Vissza
          </a>

          <div style={emptyCardStyle}>
            <h1>Nincs ilyen publikált ellentmondás.</h1>
            <p>Lehet, hogy még draft/review státuszban van, vagy törölve lett.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <a href="/contradictions" style={backStyle}>
          ← Vissza az ellentmondásokhoz
        </a>

        <header style={heroStyle}>
          <div style={badgeRowStyle}>
            <span style={darkBadgeStyle}>{item.topic || "Nincs téma"}</span>
            <span style={lightBadgeStyle}>
              {(item.language || "hu").toUpperCase()}
            </span>
          </div>

          <h1 style={titleStyle}>
            {item.politician || "Ismeretlen"} – {item.topic || "téma"}
          </h1>

          <p style={leadStyle}>
            Régi és új állítás összehasonlítása dátummal, forrással,
            AI-elemzéssel és közösségi szavazással.
          </p>

          <button onClick={copyLink} style={shareButtonStyle}>
            🔗 Link másolása
          </button>
        </header>

        <section style={compareGridStyle}>
          <article style={oldCardStyle}>
            <div style={kickerStyle}>RÉGEN</div>
            <div style={dateStyle}>{item.old_date || "Dátum nem ismert"}</div>
            <p style={statementStyle}>
              {item.old_statement || "Nincs régi állítás"}
            </p>

            {item.old_source && (
              <a href={item.old_source} target="_blank" style={sourceButtonStyle}>
                Régi forrás megnyitása →
              </a>
            )}
          </article>

          <article style={newCardStyle}>
            <div style={kickerStyle}>MOST</div>
            <div style={dateStyle}>{item.new_date || "Dátum nem ismert"}</div>
            <p style={statementStyle}>
              {item.new_statement || "Nincs új állítás"}
            </p>

            {item.new_source && (
              <a href={item.new_source} target="_blank" style={sourceButtonStyle}>
                Új forrás megnyitása →
              </a>
            )}
          </article>
        </section>

        <section style={analysisCardStyle}>
          <div style={kickerStyle}>AI ELEMZÉS</div>
          <p style={analysisTextStyle}>
            {item.ai_summary || "Ehhez még nincs AI elemzés."}
          </p>
        </section>

        <section style={sourcesCardStyle}>
          <h2 style={sectionTitleStyle}>Források</h2>

          <div style={sourceGridStyle}>
            <div style={sourceMiniCardStyle}>
              <strong>Régi állítás forrása</strong>
              <p style={mutedTextStyle}>
                {item.old_source ? "Külső forrás elérhető." : "Nincs forrás megadva."}
              </p>

              {item.old_source && (
                <a href={item.old_source} target="_blank" style={plainLinkStyle}>
                  Megnyitás →
                </a>
              )}
            </div>

            <div style={sourceMiniCardStyle}>
              <strong>Új állítás forrása</strong>
              <p style={mutedTextStyle}>
                {item.new_source ? "Külső forrás elérhető." : "Nincs forrás megadva."}
              </p>

              {item.new_source && (
                <a href={item.new_source} target="_blank" style={plainLinkStyle}>
                  Megnyitás →
                </a>
              )}
            </div>
          </div>
        </section>

        <section style={voteCardStyle}>
          <h2 style={sectionTitleStyle}>Ez szerinted ellentmondás?</h2>

          <p style={voteTextStyle}>
            👍 {yesPercent}% igen · 👎 {noPercent}% nem · összesen {totalVotes} szavazat
          </p>

          <div style={progressOuterStyle}>
            <div style={{ ...progressInnerStyle, width: `${yesPercent}%` }} />
          </div>

          <div style={buttonRowStyle}>
            <button
              disabled={voted}
              onClick={() => vote("yes")}
              style={voted ? disabledButtonStyle : voteYesButtonStyle}
            >
              👍 Igen
            </button>

            <button
              disabled={voted}
              onClick={() => vote("no")}
              style={voted ? disabledButtonStyle : voteNoButtonStyle}
            >
              👎 Nem
            </button>
          </div>

          {voted && <p style={thanksStyle}>Köszönjük, erre már szavaztál.</p>}
        </section>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  color: "#0f172a",
  padding: "32px 18px",
};

const containerStyle: CSSProperties = {
  maxWidth: 1080,
  margin: "0 auto",
};

const backStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: 22,
  color: "#0f172a",
  fontWeight: 800,
  textDecoration: "none",
};

const heroStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 28,
  marginBottom: 22,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 14,
  flexWrap: "wrap",
};

const darkBadgeStyle: CSSProperties = {
  background: "#0f172a",
  color: "white",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
};

const lightBadgeStyle: CSSProperties = {
  background: "#e2e8f0",
  color: "#0f172a",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
};

const titleStyle: CSSProperties = {
  fontSize: 46,
  lineHeight: 1.05,
  margin: "0 0 12px",
  fontWeight: 900,
};

const leadStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.55,
  color: "#475569",
  maxWidth: 820,
  marginBottom: 16,
};

const shareButtonStyle: CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #0f172a",
  borderRadius: 10,
  background: "white",
  color: "#0f172a",
  cursor: "pointer",
  fontWeight: 800,
};

const compareGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 18,
  marginBottom: 22,
};

const oldCardStyle: CSSProperties = {
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  borderRadius: 18,
  padding: 22,
};

const newCardStyle: CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  borderRadius: 18,
  padding: 22,
};

const kickerStyle: CSSProperties = {
  fontSize: 13,
  letterSpacing: 1.5,
  fontWeight: 900,
  marginBottom: 10,
};

const dateStyle: CSSProperties = {
  fontSize: 15,
  color: "#475569",
  fontWeight: 800,
  marginBottom: 12,
};

const statementStyle: CSSProperties = {
  fontSize: 23,
  lineHeight: 1.35,
  marginBottom: 18,
};

const sourceButtonStyle: CSSProperties = {
  display: "inline-block",
  padding: "10px 13px",
  background: "#0f172a",
  color: "white",
  borderRadius: 10,
  fontWeight: 800,
  textDecoration: "none",
};

const analysisCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderLeft: "6px solid #991b1b",
  borderRadius: 18,
  padding: 24,
  marginBottom: 22,
};

const analysisTextStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.7,
  margin: 0,
};

const sourcesCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
  marginBottom: 22,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 26,
  marginTop: 0,
  marginBottom: 16,
  fontWeight: 900,
};

const sourceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
};

const sourceMiniCardStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 16,
};

const mutedTextStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.5,
};

const plainLinkStyle: CSSProperties = {
  color: "#0f172a",
  fontWeight: 900,
};

const voteCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
};

const voteTextStyle: CSSProperties = {
  fontWeight: 800,
  color: "#334155",
};

const progressOuterStyle: CSSProperties = {
  height: 12,
  background: "#e5e7eb",
  borderRadius: 999,
  overflow: "hidden",
  marginBottom: 16,
};

const progressInnerStyle: CSSProperties = {
  height: "100%",
  background: "#16a34a",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const voteYesButtonStyle: CSSProperties = {
  padding: "11px 16px",
  border: "none",
  borderRadius: 10,
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const voteNoButtonStyle: CSSProperties = {
  padding: "11px 16px",
  border: "1px solid #0f172a",
  borderRadius: 10,
  background: "white",
  color: "#0f172a",
  cursor: "pointer",
  fontWeight: 900,
};

const disabledButtonStyle: CSSProperties = {
  padding: "11px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "#e5e7eb",
  color: "#64748b",
  cursor: "not-allowed",
  fontWeight: 900,
};

const thanksStyle: CSSProperties = {
  marginTop: 12,
  color: "#166534",
  fontWeight: 800,
};

const emptyCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 28,
};