"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  slug: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
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

export default function PoliticianProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [items, setItems] = useState<Item[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [slug]);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("contradictions")
      .select("*")
      .eq("status", "published");

    const filtered =
      data?.filter(
        (item) =>
          slugify(item.politician || "") === slug
      ) || [];

    setItems(filtered);

    const ids = filtered.map((i) => i.id);

    if (ids.length > 0) {
      const { data: voteData } = await supabase
        .from("contradiction_votes")
        .select("*")
        .in("contradiction_id", ids);

      setVotes((voteData || []) as Vote[]);
    }

    setLoading(false);
  }

  const politicianName = items[0]?.politician || "Ismeretlen";

  const totalVotes = votes.length;

  const topics = useMemo(() => {
    return Array.from(
      new Set(items.map((i) => i.topic).filter(Boolean))
    );
  }, [items]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>Betöltés...</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <header style={heroStyle}>
          <div style={badgeStyle}>Politikus profil</div>

          <h1 style={titleStyle}>{politicianName}</h1>

          <p style={leadStyle}>
            Publikált ellentmondások, témák és közösségi aktivitás.
          </p>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <strong>{items.length}</strong>
              <span>ellentmondás</span>
            </div>

            <div style={statCardStyle}>
              <strong>{topics.length}</strong>
              <span>téma</span>
            </div>

            <div style={statCardStyle}>
              <strong>{totalVotes}</strong>
              <span>szavazat</span>
            </div>
          </div>

          <div style={tagsRowStyle}>
            {topics.map((topic) => (
              <span key={topic} style={tagStyle}>
                {topic}
              </span>
            ))}
          </div>
        </header>

        <section style={{ display: "grid", gap: 18 }}>
          {items.map((item) => {
            const itemVotes = votes.filter(
              (v) => v.contradiction_id === item.id
            );

            const yesVotes = itemVotes.filter(
              (v) => v.vote_type === "yes"
            ).length;

            const percent = itemVotes.length
              ? Math.round((yesVotes / itemVotes.length) * 100)
              : 0;

            return (
              <article key={item.id} style={cardStyle}>
                <div style={cardTopStyle}>
                  <div>
                    <div style={smallTagStyle}>
                      {item.topic || "Nincs téma"}
                    </div>

                    <h2 style={cardTitleStyle}>
                      Régen mást mondott?
                    </h2>
                  </div>

                  <a
                    href={`/contradictions/${item.slug}`}
                    style={openButtonStyle}
                  >
                    Megnyitás →
                  </a>
                </div>

                <div style={compareGridStyle}>
                  <div style={oldBoxStyle}>
                    <strong>RÉGEN</strong>
                    <p>{item.old_statement}</p>
                    <small>{item.old_date || "-"}</small>
                  </div>

                  <div style={newBoxStyle}>
                    <strong>MOST</strong>
                    <p>{item.new_statement}</p>
                    <small>{item.new_date || "-"}</small>
                  </div>
                </div>

                {item.ai_summary && (
                  <p style={summaryStyle}>
                    🤖 {item.ai_summary}
                  </p>
                )}

                <div style={footerStyle}>
                  <span>
                    👍 {percent}% szerint ellentmondás
                  </span>

                  <span>
                    {itemVotes.length} szavazat
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  padding: "32px 18px",
};

const containerStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
};

const heroStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 24,
  padding: 32,
  marginBottom: 28,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  background: "#0f172a",
  color: "white",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 16,
};

const titleStyle: CSSProperties = {
  fontSize: 52,
  margin: 0,
  fontWeight: 950,
  color: "#0f172a",
};

const leadStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 18,
  marginTop: 14,
  marginBottom: 28,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 14,
  marginBottom: 20,
};

const statCardStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontWeight: 800,
};

const tagsRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const tagStyle: CSSProperties = {
  background: "#e2e8f0",
  padding: "6px 10px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 13,
};

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: 22,
  border: "1px solid #dbe0e6",
  padding: 24,
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 18,
  alignItems: "flex-start",
};

const smallTagStyle: CSSProperties = {
  display: "inline-block",
  background: "#0f172a",
  color: "white",
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 10,
};

const cardTitleStyle: CSSProperties = {
  fontSize: 28,
  margin: 0,
  fontWeight: 950,
};

const openButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  background: "#0f172a",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
};

const compareGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const oldBoxStyle: CSSProperties = {
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  borderRadius: 16,
  padding: 16,
};

const newBoxStyle: CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  borderRadius: 16,
  padding: 16,
};

const summaryStyle: CSSProperties = {
  marginTop: 16,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 14,
  lineHeight: 1.6,
};

const footerStyle: CSSProperties = {
  marginTop: 16,
  paddingTop: 14,
  borderTop: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
  color: "#64748b",
  fontWeight: 800,
};