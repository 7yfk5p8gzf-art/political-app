"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [sourcesCount, setSourcesCount] = useState(0);
  const [sourcesPublished, setSourcesPublished] = useState(0);
  const [sourcesReview, setSourcesReview] = useState(0);

  const [contradictionsCount, setContradictionsCount] = useState(0);
  const [contradictionsPublished, setContradictionsPublished] = useState(0);
  const [contradictionsReview, setContradictionsReview] = useState(0);

  const [votesCount, setVotesCount] = useState(0);
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "editor";

    if (role !== "admin" && role !== "superadmin") {
      alert("Nincs jogosultságod az adminhoz");
      window.location.href = "/";
      return;
    }

    setUserEmail(user.email || null);

    await loadStats();

    setLoading(false);
  }

  async function loadStats() {
    const { data: sources } = await supabase
      .from("sources")
      .select("status");

    const { data: contradictions } = await supabase
      .from("contradictions")
      .select("status");

    const { data: votes } = await supabase
      .from("contradiction_votes")
      .select("vote_type");

    if (sources) {
      setSourcesCount(sources.length);

      setSourcesPublished(
        sources.filter((s) => s.status === "published").length
      );

      setSourcesReview(
        sources.filter((s) => s.status === "review").length
      );
    }

    if (contradictions) {
      setContradictionsCount(contradictions.length);

      setContradictionsPublished(
        contradictions.filter((c) => c.status === "published").length
      );

      setContradictionsReview(
        contradictions.filter((c) => c.status === "review").length
      );
    }

    if (votes) {
      setVotesCount(votes.length);

      setYesVotes(
        votes.filter((v) => v.vote_type === "yes").length
      );

      setNoVotes(
        votes.filter((v) => v.vote_type === "no").length
      );
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return <div style={{ padding: 32 }}>Betöltés...</div>;
  }

  return (
    <main style={pageStyle}>
      <div style={topBarStyle}>
        <div>
          <h1 style={titleStyle}>Admin Dashboard</h1>
          <p style={subtitleStyle}>
            Political App admin és statisztikák
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "#64748b" }}>{userEmail}</span>

          <button onClick={logout} style={logoutButtonStyle}>
            Kijelentkezés
          </button>
        </div>
      </div>

      <section style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>{sourcesCount}</div>
          <div style={statLabelStyle}>Összes source</div>

          <small>
            Published: {sourcesPublished} · Review: {sourcesReview}
          </small>
        </div>

        <div style={statCardStyle}>
          <div style={statNumberStyle}>{contradictionsCount}</div>
          <div style={statLabelStyle}>Összes contradiction</div>

          <small>
            Published: {contradictionsPublished} · Review:{" "}
            {contradictionsReview}
          </small>
        </div>

        <div style={statCardStyle}>
          <div style={statNumberStyle}>{votesCount}</div>
          <div style={statLabelStyle}>Összes szavazat</div>

          <small>
            👍 {yesVotes} · 👎 {noVotes}
          </small>
        </div>
      </section>

      <section style={linksGridStyle}>
        <a href="/admin/sources" style={cardStyle}>
          📁 Források kezelése

          <p style={cardTextStyle}>
            Videók, cikkek, nyilatkozatok kezelése
          </p>
        </a>

        <a href="/admin/contradictions" style={cardStyle}>
          ⚔️ Ellentmondások kezelése

          <p style={cardTextStyle}>
            OLD vs NEW párosítások, AI, publish
          </p>
        </a>

        <a href="/admin/review" style={cardStyle}>
          🧠 Review lista

          <p style={cardTextStyle}>
            Review státuszú tartalmak kezelése
          </p>
        </a>

        <a href="/contradictions" style={cardStyle}>
          🌍 Publikus oldal

          <p style={cardTextStyle}>
            Amit a látogatók látnak
          </p>
        </a>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  padding: 32,
};

const topBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 28,
  flexWrap: "wrap",
};

const titleStyle: CSSProperties = {
  fontSize: 42,
  margin: 0,
  fontWeight: 950,
  color: "#0f172a",
};

const subtitleStyle: CSSProperties = {
  color: "#64748b",
  marginTop: 8,
};

const logoutButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 28,
};

const statCardStyle: CSSProperties = {
  background: "white",
  borderRadius: 18,
  padding: 24,
  border: "1px solid #dbe0e6",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
};

const statNumberStyle: CSSProperties = {
  fontSize: 42,
  fontWeight: 950,
  color: "#0f172a",
};

const statLabelStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  marginBottom: 8,
};

const linksGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 22,
  borderRadius: 18,
  textDecoration: "none",
  background: "white",
  border: "1px solid #dbe0e6",
  color: "#0f172a",
  fontWeight: 900,
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
};

const cardTextStyle: CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontWeight: 600,
};