"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type AuditLog = {
  id: string;
  created_at: string;
  user_email: string | null;
  user_role: string | null;
  action: string;
  details: string | null;
};

export default function AdminDashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
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

  const [viewsCount, setViewsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [mainAdminsCount, setMainAdminsCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);
  const [reviewersCount, setReviewersCount] = useState(0);
  const [editorsCount, setEditorsCount] = useState(0);

  const [latestLogs, setLatestLogs] = useState<AuditLog[]>([]);

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
    const allowedRoles = ["superadmin", "admin", "reviewer", "editor"];

    if (!allowedRoles.includes(role)) {
      alert("Nincs jogosultságod az adminhoz");
      window.location.href = "/";
      return;
    }

    setUserEmail(user.email || null);
    setUserRole(role);

    await loadStats();
    setLoading(false);
  }

  async function loadStats() {
    const { data: sources } = await supabase.from("sources").select("status");

    const { data: contradictions } = await supabase
      .from("contradictions")
      .select("status, views");

    const { data: votes } = await supabase
      .from("contradiction_votes")
      .select("vote_type");

    const { data: profiles } = await supabase.from("profiles").select("role");

    const { data: logs } = await supabase
      .from("audit_logs")
      .select("id, created_at, user_email, user_role, action, details")
      .order("created_at", { ascending: false })
      .limit(5);

    if (sources) {
      setSourcesCount(sources.length);
      setSourcesPublished(
        sources.filter((s) => s.status === "published").length
      );
      setSourcesReview(sources.filter((s) => s.status === "review").length);
    }

    if (contradictions) {
      setContradictionsCount(contradictions.length);
      setContradictionsPublished(
        contradictions.filter((c) => c.status === "published").length
      );
      setContradictionsReview(
        contradictions.filter((c) => c.status === "review").length
      );

      const totalViews = contradictions.reduce((sum: number, item: any) => {
        return sum + Number(item.views || 0);
      }, 0);

      setViewsCount(totalViews);
    }

    if (votes) {
      setVotesCount(votes.length);
      setYesVotes(votes.filter((v) => v.vote_type === "yes").length);
      setNoVotes(votes.filter((v) => v.vote_type === "no").length);
    }

    if (profiles) {
      setUsersCount(profiles.length);
      setMainAdminsCount(profiles.filter((p) => p.role === "superadmin").length);
      setAdminsCount(profiles.filter((p) => p.role === "admin").length);
      setReviewersCount(profiles.filter((p) => p.role === "reviewer").length);
      setEditorsCount(profiles.filter((p) => p.role === "editor").length);
    }

    if (logs) {
      setLatestLogs(logs);
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
          <p style={subtitleStyle}>Political App admin és statisztikák</p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "grid", gap: 2 }}>
            <span style={{ color: "#64748b" }}>{userEmail}</span>
            <strong style={{ color: "#0f172a" }}>{userRole}</strong>
          </div>

          <button onClick={logout} style={logoutButtonStyle}>
            Kijelentkezés
          </button>
        </div>
      </div>

      <section style={statsGridStyle}>
        <StatCard
          number={sourcesCount}
          label="Összes source"
          small={`Published: ${sourcesPublished} · Review: ${sourcesReview}`}
        />

        <StatCard
          number={contradictionsCount}
          label="Összes contradiction"
          small={`Published: ${contradictionsPublished} · Review: ${contradictionsReview}`}
        />

        <StatCard
          number={votesCount}
          label="Összes szavazat"
          small={`👍 ${yesVotes} · 👎 ${noVotes}`}
        />

        <StatCard
          number={viewsCount}
          label="Összes megtekintés"
          small="Publikus contradiction oldalak nézettsége"
        />

        <StatCard
          number={usersCount}
          label="Regisztrált felhasználók"
          small={`Main admin: ${mainAdminsCount} · Admin: ${adminsCount} · Reviewer: ${reviewersCount} · Editor: ${editorsCount}`}
        />
      </section>

      <section style={linksGridStyle}>
        <a href="/admin/sources" style={cardStyle}>
          📁 Források kezelése
          <p style={cardTextStyle}>Videók, cikkek, nyilatkozatok kezelése</p>
        </a>

        <a href="/admin/contradictions" style={cardStyle}>
          ⚔️ Ellentmondások kezelése
          <p style={cardTextStyle}>OLD vs NEW párosítások, AI, publish</p>
        </a>

        <a href="/admin/review" style={cardStyle}>
          🧠 Review lista
          <p style={cardTextStyle}>Review státuszú tartalmak kezelése</p>
        </a>

        <a href="/admin/logs" style={cardStyle}>
          🧾 Audit Logs
          <p style={cardTextStyle}>Admin aktivitások és előzmények</p>
        </a>

        <a href="/contradictions" style={cardStyle}>
          🌍 Publikus oldal
          <p style={cardTextStyle}>Amit a látogatók látnak</p>
        </a>
      </section>

      <section style={activitySectionStyle}>
        <div style={activityHeaderStyle}>
          <h2 style={activityTitleStyle}>Legutóbbi aktivitások</h2>

          <a href="/admin/logs" style={smallLinkStyle}>
            Összes log →
          </a>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {latestLogs.length === 0 && (
            <div style={emptyStyle}>Még nincs audit log.</div>
          )}

          {latestLogs.map((log) => (
            <div key={log.id} style={activityItemStyle}>
              <div>
                <strong>{log.action}</strong>

                <div style={activityMetaStyle}>
                  {log.user_email || "ismeretlen"} · {log.user_role || "-"} ·{" "}
                  {new Date(log.created_at).toLocaleString()}
                </div>

                {log.details && (
                  <div style={activityDetailsStyle}>{log.details}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  number,
  label,
  small,
}: {
  number: number;
  label: string;
  small: string;
}) {
  return (
    <div style={statCardStyle}>
      <div style={statNumberStyle}>{number}</div>
      <div style={statLabelStyle}>{label}</div>
      <small>{small}</small>
    </div>
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

const activitySectionStyle: CSSProperties = {
  marginTop: 28,
  background: "white",
  borderRadius: 18,
  padding: 22,
  border: "1px solid #dbe0e6",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
};

const activityHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 16,
};

const activityTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
  color: "#0f172a",
};

const smallLinkStyle: CSSProperties = {
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 800,
};

const activityItemStyle: CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const activityMetaStyle: CSSProperties = {
  marginTop: 5,
  color: "#64748b",
  fontSize: 13,
};

const activityDetailsStyle: CSSProperties = {
  marginTop: 8,
  color: "#334155",
  lineHeight: 1.4,
};

const emptyStyle: CSSProperties = {
  padding: 14,
  color: "#64748b",
  background: "#f8fafc",
  borderRadius: 12,
};