"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type Contradiction = {
  id: string;
  politician: string | null;
  slug: string | null;
  old_statement: string | null;
  old_date: string | null;
  old_source: string | null;
  new_statement: string | null;
  new_date: string | null;
  new_source: string | null;
  ai_summary: string | null;
};

type Vote = {
  id: number;
  contradiction_id: string;
  vote_type: "a" | "b";
  user_id: string;
};

export default function ComparePage() {
  const params = useParams();
  const slug = String(params.slug);

  const [item, setItem] = useState<Contradiction | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [slug]);

  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id || null);
    setUserEmail(user?.email || null);

    const { data: contradictionData } = await supabase
      .from("contradictions")
      .select("*")
      .eq("slug", slug)
      .single();

    setItem(contradictionData || null);

    if (contradictionData?.id) {
      const { data: voteData } = await supabase
        .from("contradiction_votes")
        .select("*")
        .eq("contradiction_id", contradictionData.id);

      setVotes(voteData || []);
    }

    setLoading(false);
  }

  async function vote(id: string, value: 1 | -1) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Szavazáshoz be kell jelentkezned.");
      return;
    }

    const voteType = value === 1 ? "a" : "b";

    const { error } = await supabase.from("contradiction_votes").insert([
      {
        contradiction_id: id,
        vote_type: voteType,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Erre már szavaztál.");
      return;
    }

    setVotes((prev) => [
      ...prev,
      {
        id: Date.now(),
        contradiction_id: id,
        vote_type: voteType,
        user_id: user.id,
      },
    ]);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    setUserId(null);
    alert("Kijelentkeztél.");
  }

  if (loading) {
    return <main style={pageStyle}>Betöltés...</main>;
  }

  if (!item) {
    return <main style={pageStyle}>Nincs ilyen összehasonlítás.</main>;
  }

  const total = votes.length;
  const yes = votes.filter((v) => v.vote_type === "a").length;
  const no = votes.filter((v) => v.vote_type === "b").length;

  const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 0;
  const noPercent = total > 0 ? Math.round((no / total) * 100) : 0;

  const myVote = votes.find((v) => v.user_id === userId);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <div style={userBarStyle}>
          {userEmail ? (
            <>
              <span>
                Bejelentkezve: <strong>{userEmail}</strong>
              </span>

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

        <a href="/contradictions" style={backStyle}>
          ← Vissza az ellentmondásokhoz
        </a>

        <header style={headerStyle}>
          <p style={kickerStyle}>POLITIKAI ÖSSZEHASONLÍTÓ</p>

          <h1 style={titleStyle}>
            {item.politician || "Ismeretlen"}: régen mást mondott, mint most?
          </h1>
        </header>

        <div style={metaBarStyle}>
          <span>RÉGEN: {item.old_date || "nincs dátum"}</span>
          <span>MOST: {item.new_date || "nincs dátum"}</span>
        </div>

        <div style={compareGridStyle}>
          <article style={statementBoxStyle}>
            <p style={labelStyle}>RÉGEN</p>

            <h2 style={boxTitleStyle}>
              {item.old_statement || "Nincs régi állítás"}
            </h2>

            {item.old_source && (
              <a href={item.old_source} target="_blank" style={sourceLinkStyle}>
                Régi forrás megnyitása →
              </a>
            )}
          </article>

          <article style={statementBoxStyle}>
            <p style={labelStyle}>MOST</p>

            <h2 style={boxTitleStyle}>
              {item.new_statement || "Nincs új állítás"}
            </h2>

            {item.new_source && (
              <a href={item.new_source} target="_blank" style={sourceLinkStyle}>
                Új forrás megnyitása →
              </a>
            )}
          </article>
        </div>

        <section style={infoBoxStyle}>
          <h2 style={infoTitleStyle}>Mi az ellentmondás?</h2>

          <p style={infoTextStyle}>
            {item.ai_summary || "Nincs még AI összefoglaló."}
          </p>
        </section>

        <section style={shareBoxStyle}>
          <h2 style={shareTitleStyle}>Megosztás</h2>

          <div style={shareButtonRowStyle}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert("Link kimásolva!");
              }}
              style={shareButtonStyle}
            >
              🔗 Link másolása
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              style={shareButtonStyle}
            >
              💬 WhatsApp
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
              )}`}
              target="_blank"
              style={shareButtonStyle}
            >
              📘 Facebook
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareUrl
              )}`}
              target="_blank"
              style={shareButtonStyle}
            >
              🐦 Twitter
            </a>
          </div>
        </section>

        <section style={voteBoxStyle}>
          <h2 style={voteTitleStyle}>Ez tényleg ellentmondás?</h2>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => vote(item.id, 1)}
              disabled={Boolean(myVote)}
              style={{
                ...yesButtonStyle,
                opacity: myVote ? 0.5 : 1,
                cursor: myVote ? "not-allowed" : "pointer",
              }}
            >
              👍 Igen
            </button>

            <button
              onClick={() => vote(item.id, -1)}
              disabled={Boolean(myVote)}
              style={{
                ...noButtonStyle,
                opacity: myVote ? 0.5 : 1,
                cursor: myVote ? "not-allowed" : "pointer",
              }}
            >
              👎 Nem
            </button>
          </div>

          <div style={resultBoxStyle}>
            <p>
              👍 Igen: <strong>{yesPercent}%</strong> ({yes} szavazat)
            </p>

            <p>
              👎 Nem: <strong>{noPercent}%</strong> ({no} szavazat)
            </p>

            <p>
              Összesen: <strong>{total}</strong> szavazat
            </p>
          </div>

          {myVote && (
            <p style={myVoteStyle}>
              Te már szavaztál:{" "}
              {myVote.vote_type === "a" ? "👍 Igen" : "👎 Nem"}
            </p>
          )}
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

const backStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: 20,
  color: "#111827",
  fontWeight: 800,
  textDecoration: "none",
};

const headerStyle: CSSProperties = {
  borderBottom: "4px solid #111827",
  borderTop: "1px solid #111827",
  padding: "26px 0",
  marginBottom: 18,
};

const kickerStyle: CSSProperties = {
  fontWeight: 900,
  letterSpacing: 3,
  fontSize: 13,
  margin: 0,
};

const titleStyle: CSSProperties = {
  fontSize: 52,
  lineHeight: 1.05,
  margin: "10px 0",
  fontFamily: "serif",
};

const metaBarStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 14,
  border: "1px solid #111827",
  padding: 14,
  marginBottom: 18,
  background: "#fffaf0",
  fontWeight: 800,
};

const compareGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 18,
};

const statementBoxStyle: CSSProperties = {
  background: "#fffdf7",
  border: "1px solid #d6d3c7",
  borderLeft: "5px solid #111827",
  padding: 24,
};

const labelStyle: CSSProperties = {
  display: "inline-block",
  background: "#111827",
  color: "white",
  padding: "5px 10px",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1,
  margin: 0,
};

const boxTitleStyle: CSSProperties = {
  fontFamily: "serif",
  fontSize: 30,
  lineHeight: 1.15,
  margin: "16px 0 12px",
};

const sourceLinkStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 16,
  color: "#111827",
  fontWeight: 900,
};

const infoBoxStyle: CSSProperties = {
  marginTop: 24,
  padding: 20,
  border: "1px solid #111827",
  background: "#fffaf0",
};

const infoTitleStyle: CSSProperties = {
  fontFamily: "serif",
  fontSize: 26,
  marginBottom: 10,
};

const infoTextStyle: CSSProperties = {
  lineHeight: 1.6,
  fontSize: 16,
};

const shareBoxStyle: CSSProperties = {
  marginTop: 24,
  padding: 20,
  border: "1px solid #111827",
  background: "#fffaf0",
};

const shareTitleStyle: CSSProperties = {
  fontFamily: "serif",
  fontSize: 26,
  marginBottom: 14,
};

const shareButtonRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "center",
};

const shareButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "10px 14px",
  border: "1px solid #111827",
  background: "#fffdf7",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 900,
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 42,
};

const voteBoxStyle: CSSProperties = {
  marginTop: 30,
  border: "2px solid #111827",
  padding: 20,
  background: "#fffaf0",
};

const voteTitleStyle: CSSProperties = {
  fontFamily: "serif",
  fontSize: 28,
  marginBottom: 12,
};

const yesButtonStyle: CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #166534",
  background: "#dcfce7",
  fontWeight: 900,
};

const noButtonStyle: CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #991b1b",
  background: "#fee2e2",
  fontWeight: 900,
};

const resultBoxStyle: CSSProperties = {
  marginTop: 16,
  display: "grid",
  gap: 6,
  fontWeight: 700,
};

const myVoteStyle: CSSProperties = {
  marginTop: 14,
  color: "#6b7280",
  fontWeight: 800,
};