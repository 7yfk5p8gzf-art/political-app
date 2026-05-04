"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sourcesCount, setSourcesCount] = useState(0);
const [sourcesPublished, setSourcesPublished] = useState(0);

const [contradictionsCount, setContradictionsCount] = useState(0);
const [contradictionsPublished, setContradictionsPublished] = useState(0);

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
    setLoading(false);
    await loadStats();
  }
  async function loadStats() {
  const { data: sources } = await supabase
    .from("sources")
    .select("status");

  const { data: contradictions } = await supabase
    .from("contradictions")
    .select("status");

  if (sources) {
    setSourcesCount(sources.length);
    setSourcesPublished(
      sources.filter((s) => s.status === "published").length
    );
  }

  if (contradictions) {
    setContradictionsCount(contradictions.length);
    setContradictionsPublished(
      contradictions.filter((c) => c.status === "published").length
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
    <main style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <span>{userEmail}</span>
        <button onClick={logout}>Kijelentkezés</button>
      </div>

      <h1>Admin Dashboard</h1>

      <p style={{ marginBottom: 24 }}>
        Itt tudod kezelni az oldal tartalmát.
      </p>

      <div style={{ display: "grid", gap: 16, maxWidth: 500 }}>
        <a href="/admin/sources" style={cardStyle}>
          📁 Források kezelése
          <p>
Sources: {sourcesCount} (published: {sourcesPublished})
</p>
          <small>Videók, cikkek, nyilatkozatok mentése</small>
        </a>

        <a href="/admin/contradictions" style={cardStyle}>
          ⚔️ Ellentmondások kezelé
          <p>
Contradictions: {contradictionsCount} (published: {contradictionsPublished})
</p>
          <small>Régi és új állítás összepárosítása, AI, publish</small>
        </a>

        <a href="/contradictions" style={cardStyle}>
          🌍 Publikus lista megnyitása
          <small>Amit a látogatók látnak</small>
        </a>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  padding: 18,
  border: "1px solid #111827",
  borderRadius: 12,
  textDecoration: "none",
  color: "#111827",
  fontWeight: 900,
  background: "#fffaf0",
};