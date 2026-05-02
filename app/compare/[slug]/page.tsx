"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type Contradiction = {
  id: string;
  politician: string | null;
  old_statement: string | null;
  old_date: string | null;
  old_source: string | null;
  new_statement: string | null;
  new_date: string | null;
  new_source: string | null;
  ai_summary: string | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
  vote_type: "yes" | "no";
  user_id: string | null;
};

export default function ComparePage() {
  const params = useParams();
  const id = String(params.slug);

  const [item, setItem] = useState<Contradiction | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
    load();
  }, [id]);

  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id || null);

    const { data, error } = await supabase
      .from("contradictions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Compare load error:", error);
      setItem(null);
      setLoading(false);
      return;
    }

    setItem(data || null);

    if (data?.id) {
      const { data: voteData } = await supabase
        .from("contradiction_votes")
        .select("*")
        .eq("contradiction_id", data.id);

      setVotes((voteData || []) as Vote[]);
    } else {
      setVotes([]);
    }

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

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    alert("Link másolva.");
  }

  if (loading) {
    return <main style={page}>Betöltés...</main>;
  }

  if (!item) {
    return (
      <main style={page}>
        <section style={container}>
          <a href="/contradictions" style={back}>
            ← Vissza
          </a>
          <h1 style={title}>Nem található ez az összehasonlítás.</h1>
        </section>
      </main>
    );
  }

  const yes = votes.filter((v) => v.vote_type === "yes").length;
  const no = votes.filter((v) => v.vote_type === "no").length;
  const total = yes + no;
  const percent = total > 0 ? Math.round((yes / total) * 100) : null;
  const alreadyVoted = votes.some((v) => v.user_id === userId);

  const isContradiction =
    Boolean(item.old_statement) &&
    Boolean(item.new_statement) &&
    item.old_statement!.toLowerCase() !== item.new_statement!.toLowerCase();

  return (
    <main style={page}>
      <section style={container}>
        <a href="/contradictions" style={back}>
          ← Vissza az ellentmondásokhoz
        </a>

        <h1 style={title}>
          {(item.politician || "Ismeretlen").toUpperCase()} – álláspont változás
        </h1>

        <div
          style={{
            ...badge,
            background: isContradiction ? "#991b1b" : "#166534",
          }}
        >
          ELLENTMONDÁS: {isContradiction ? "IGEN" : "NEM"}
        </div>

        <div style={grid}>
          <div style={box}>
            <p style={label}>RÉGEN</p>
            <h2 style={statement}>
              {item.old_statement || "Nincs régi állítás"}
            </h2>
            {item.old_date && <p>Dátum: {item.old_date}</p>}
            {item.old_source && (
              <a href={item.old_source} target="_blank" rel="noreferrer">
                Régi forrás megnyitása
              </a>
            )}
          </div>

          <div style={box}>
            <p style={label}>MOST</p>
            <h2 style={statement}>
              {item.new_statement || "Nincs új állítás"}
            </h2>
            {item.new_date && <p>Dátum: {item.new_date}</p>}
            {item.new_source && (
              <a href={item.new_source} target="_blank" rel="noreferrer">
                Új forrás megnyitása
              </a>
            )}
          </div>
        </div>

        <div style={aiBox}>
          <h2>AI ELEMZÉS</h2>
          <p>{item.ai_summary || "Nincs AI összefoglaló."}</p>
        </div>

        <div style={shareBox}>
          <h2>Megosztás</h2>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noreferrer"
            style={shareButton}
          >
            Facebook
          </a>

          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noreferrer"
            style={shareButton}
          >
            X / Twitter
          </a>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            style={shareButton}
          >
            WhatsApp
          </a>

          <button onClick={copyLink} style={shareButton}>
            Link másolása
          </button>
        </div>

        <div style={voteBox}>
          <h2>Ez tényleg ellentmondás?</h2>

          {percent !== null && (
            <>
              <p style={{ fontWeight: 900 }}>
                👍 {percent}% szerint ellentmondás ({total} szavazat)
              </p>
              <div style={progressTrack}>
                <div
                  style={{
                    ...progressFill,
                    width: `${percent}%`,
                    background: percent >= 50 ? "#16a34a" : "#dc2626",
                  }}
                />
              </div>
            </>
          )}

          <button
            onClick={() => vote(item.id, "yes")}
            disabled={alreadyVoted}
            style={{
              ...buttonDark,
              opacity: alreadyVoted ? 0.5 : 1,
              cursor: alreadyVoted ? "not-allowed" : "pointer",
            }}
          >
            👍 Igen
          </button>

          <button
            onClick={() => vote(item.id, "no")}
            disabled={alreadyVoted}
            style={{
              ...buttonLight,
              opacity: alreadyVoted ? 0.5 : 1,
              cursor: alreadyVoted ? "not-allowed" : "pointer",
            }}
          >
            👎 Nem
          </button>

          {alreadyVoted && (
            <p style={alreadyVotedStyle}>Már szavaztál erre.</p>
          )}

          <p>
            👍 {yes} | 👎 {no} | összesen: {total}
          </p>
        </div>
      </section>
    </main>
  );
}

const page: CSSProperties = {
  background: "#f5f1e8",
  minHeight: "100vh",
  padding: 32,
  color: "#111827",
};

const container: CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
};

const back: CSSProperties = {
  display: "inline-block",
  marginBottom: 20,
  color: "#111827",
  fontWeight: 900,
  textDecoration: "none",
};

const title: CSSProperties = {
  fontSize: 42,
  fontFamily: "serif",
};

const badge: CSSProperties = {
  color: "white",
  padding: 12,
  margin: "10px 0 24px",
  fontWeight: 900,
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};

const box: CSSProperties = {
  background: "#fffdf7",
  padding: 20,
  border: "1px solid #d6d3c7",
  borderLeft: "5px solid #111827",
};

const label: CSSProperties = {
  fontWeight: 900,
};

const statement: CSSProperties = {
  fontFamily: "serif",
};

const aiBox: CSSProperties = {
  marginTop: 30,
  padding: 20,
  background: "#fffaf0",
  borderLeft: "6px solid #111827",
};

const shareBox: CSSProperties = {
  marginTop: 30,
  padding: 20,
  background: "#fffdf7",
  border: "1px solid #d6d3c7",
};

const shareButton: CSSProperties = {
  display: "inline-block",
  marginRight: 10,
  marginTop: 8,
  padding: "10px 14px",
  background: "#111827",
  color: "white",
  textDecoration: "none",
  border: "1px solid #111827",
  fontWeight: 900,
  cursor: "pointer",
};

const voteBox: CSSProperties = {
  marginTop: 30,
  background: "#fffdf7",
  padding: 20,
  border: "1px solid #d6d3c7",
};

const progressTrack: CSSProperties = {
  width: "100%",
  height: 8,
  background: "#e5e7eb",
  marginBottom: 14,
  overflow: "hidden",
};

const progressFill: CSSProperties = {
  height: "100%",
  transition: "width 0.3s ease",
};

const buttonDark: CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  marginRight: 10,
};

const buttonLight: CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #111827",
  background: "#fffaf0",
  color: "#111827",
  fontWeight: 900,
};

const alreadyVotedStyle: CSSProperties = {
  marginTop: 12,
  color: "#166534",
  fontWeight: 900,
};