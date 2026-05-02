"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Source = {
  id: string;
  title: string;
  url: string;
  type: string;
  source_date: string | null;
  language: string;
  summary: string | null;
  politician: string | null;
  topic: string | null;
};

export default function AdminSourcesPage() {
  const [items, setItems] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
const [userEmail, setUserEmail] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    url: "",
    type: "article",
    source_date: "",
    language: "hu",
    summary: "",
    politician: "",
    topic: "",
  });
  useEffect(() => {
  checkAccess();
}, []);

async function checkAccess() {
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
    alert("Nincs jogosultságod ehhez az oldalhoz");
    window.location.href = "/";
    return;
  }

  setUserEmail(user.email || null);
  setAuthLoading(false);
  loadSources();
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}

if (authLoading) {
  return <div style={{ padding: 32 }}>Betöltés...</div>;
}

  async function loadSources() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Hiba betöltésnél: " + error.message);
    }

    if (data) setItems(data);
    setLoading(false);
  }

  

  async function createSource() {
    if (!form.title.trim() || !form.url.trim()) {
      alert("Cím és URL kötelező");
      return;
    }

    const { error } = await supabase.from("sources").insert([
      {
        title: form.title.trim(),
        url: form.url.trim(),
        type: form.type,
        source_date: form.source_date || null,
        language: form.language,
        summary: form.summary.trim(),
        politician: form.politician.trim(),
        topic: form.topic.trim(),
      },
    ]);

    if (error) {
      alert("Hiba mentésnél: " + error.message);
      return;
    }

    setForm({
      title: "",
      url: "",
      type: "article",
      source_date: "",
      language: "hu",
      summary: "",
      politician: "",
      topic: "",
    });

    loadSources();
  }

  async function deleteSource(id: string) {
    const ok = confirm("Biztos törlöd ezt a source-t?");
    if (!ok) return;

    const { error } = await supabase.from("sources").delete().eq("id", id);

    if (error) {
      alert("Hiba törlésnél: " + error.message);
      return;
    }

    loadSources();
  }

  
  return (
  <>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: 20 }}>
      <span>{userEmail}</span>
      <button onClick={logout}>Kijelentkezés</button>
    </div>

    <main style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Sources Admin</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Itt mentjük a cikkeket, videókat, nyilatkozatokat és hivatalos forrásokat.
      </p>

      <section
        style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
          marginBottom: 28,
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Új source hozzáadása</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input
            placeholder="Cím"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={inputStyle}
          />

          <input
            placeholder="URL"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            style={inputStyle}
          />

          <input
            placeholder="Politikus / személy"
            value={form.politician}
            onChange={(e) => setForm({ ...form, politician: e.target.value })}
            style={inputStyle}
          />

          <input
            placeholder="Téma pl. migráció, háború, gazdaság"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            style={inputStyle}
          />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={inputStyle}
          >
            <option value="article">Cikk</option>
            <option value="video">Videó</option>
            <option value="speech">Beszéd</option>
            <option value="post">Poszt</option>
            <option value="official">Hivatalos dokumentum</option>
          </select>

          <input
            type="date"
            value={form.source_date}
            onChange={(e) => setForm({ ...form, source_date: e.target.value })}
            style={inputStyle}
          />

          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            style={inputStyle}
          >
            <option value="hu">Magyar</option>
            <option value="de">Német</option>
            <option value="en">Angol</option>
            <option value="fr">Francia</option>
            <option value="it">Olasz</option>
            <option value="other">Egyéb</option>
          </select>
        </div>

        <textarea
          placeholder="Rövid összefoglaló / idézet / miért fontos ez a source"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          style={{
            ...inputStyle,
            width: "100%",
            marginTop: 12,
            minHeight: 90,
            resize: "vertical",
          }}
        />

        <button onClick={createSource} style={buttonStyle}>
          Source mentése
        </button>
      </section>

      <section>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>
          Mentett sources {loading ? "..." : `(${items.length})`}
        </h2>

        {items.length === 0 && (
          <p style={{ color: "#777" }}>Még nincs mentett source.</p>
        )}

        <div style={{ display: "grid", gap: 14 }}>
          {items.map((item) => (
            <article
              key={item.id}
              style={{
                background: "white",
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 20, marginBottom: 6 }}>{item.title}</h3>

                  <div style={{ color: "#555", marginBottom: 8 }}>
                    <strong>{item.politician || "Nincs személy"}</strong>
                    {" · "}
                    {item.topic || "Nincs téma"}
                    {" · "}
                    {item.type}
                    {" · "}
                    {item.language}
                    {item.source_date ? ` · ${item.source_date}` : ""}
                  </div>

                  {item.summary && (
                    <p style={{ lineHeight: 1.5, marginBottom: 10 }}>
                      {item.summary}
                    </p>
                  )}

                  <a href={item.url} target="_blank" rel="noreferrer">
                    Forrás megnyitása
                  </a>
                </div>

                <button onClick={() => deleteSource(item.id)} style={deleteButtonStyle}>
                  Törlés
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    
</main>
</>
);
}
const inputStyle: React.CSSProperties = {
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 8,
  width: "100%",
};

const buttonStyle: React.CSSProperties = {
  marginTop: 14,
  padding: "10px 16px",
  border: "none",
  borderRadius: 8,
  background: "#111827",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const deleteButtonStyle: React.CSSProperties = {
  height: 36,
  padding: "8px 12px",
  border: "1px solid #dc2626",
  borderRadius: 8,
  background: "white",
  color: "#dc2626",
  cursor: "pointer",
};