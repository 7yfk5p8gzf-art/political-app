"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
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
  country: string | null;
  status: string | null;
};

const emptyForm = {
  title: "",
  url: "",
  type: "article",
  source_date: "",
  language: "hu",
  summary: "",
  politician: "",
  topic: "",
  country: "",
  status: "draft",
};

export default function AdminSourcesPage() {
  const [items, setItems] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || (item.status || "draft") === statusFilter;

      const matchesSearch =
        !q ||
        [
          item.title,
          item.url,
          item.type,
          item.language,
          item.summary,
          item.politician,
          item.topic,
          item.country,
          item.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [items, search, statusFilter]);

  async function saveSource() {
    if (!form.title.trim() || !form.url.trim()) {
      alert("Cím és URL kötelező");
      return;
    }

    const payload = {
      title: form.title.trim(),
      url: form.url.trim(),
      type: form.type,
      source_date: form.source_date || null,
      language: form.language,
      summary: form.summary.trim() || null,
      politician: form.politician.trim() || null,
      topic: form.topic.trim() || null,
      country: form.country.trim() || null,
      status: form.status,
    };

    if (editingId) {
      const { error } = await supabase
        .from("sources")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        alert("Hiba szerkesztésnél: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("sources").insert([payload]);

      if (error) {
        alert("Hiba mentésnél: " + error.message);
        return;
      }
    }

    setForm(emptyForm);
    setEditingId(null);
    loadSources();
  }

  function startEdit(item: Source) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      url: item.url || "",
      type: item.type || "article",
      source_date: item.source_date || "",
      language: item.language || "hu",
      summary: item.summary || "",
      politician: item.politician || "",
      topic: item.topic || "",
      country: item.country || "",
      status: item.status || "draft",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function quickStatus(id: string, status: string) {
    const { error } = await supabase
      .from("sources")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Státusz hiba: " + error.message);
      return;
    }

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

  if (authLoading) {
    return <div style={{ padding: 32 }}>Betöltés...</div>;
  }

  return (
    <>
      <div style={topBarStyle}>
        <div>
          <strong>Admin</strong>
          <div style={{ fontSize: 13, color: "#64748b" }}>{userEmail}</div>
        </div>

        <button onClick={logout} style={smallButtonStyle}>
          Kijelentkezés
        </button>
      </div>

      <main style={pageStyle}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={titleStyle}>Sources Admin</h1>
          <p style={subtitleStyle}>
            Itt mentjük és minősítjük a forrásokat. A contradiction admin csak
            published source-okból építkezik.
          </p>
        </div>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            {editingId ? "Source szerkesztése" : "Új source hozzáadása"}
          </h2>

          <div style={gridStyle}>
            <input placeholder="Cím" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
            <input placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} style={inputStyle} />
            <input placeholder="Politikus / személy" value={form.politician} onChange={(e) => setForm({ ...form, politician: e.target.value })} style={inputStyle} />
            <input placeholder="Téma pl. migráció, háború, gazdaság" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} style={inputStyle} />
            <input placeholder="Ország pl. HU, DE, CH, EU" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} style={inputStyle} />
            <input type="date" value={form.source_date} onChange={(e) => setForm({ ...form, source_date: e.target.value })} style={inputStyle} />

            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
              <option value="article">Cikk</option>
              <option value="video">Videó</option>
              <option value="speech">Beszéd</option>
              <option value="post">Poszt</option>
              <option value="official">Hivatalos dokumentum</option>
              <option value="interview">Interjú</option>
              <option value="other">Egyéb</option>
            </select>

            <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} style={inputStyle}>
              <option value="hu">Magyar</option>
              <option value="de">Német</option>
              <option value="en">Angol</option>
              <option value="fr">Francia</option>
              <option value="it">Olasz</option>
              <option value="other">Egyéb</option>
            </select>

            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <textarea
            placeholder="Rövid összefoglaló / idézet / miért fontos ez a source"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            style={textareaStyle}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={saveSource} style={buttonStyle}>
              {editingId ? "Módosítás mentése" : "Source mentése"}
            </button>

            {editingId && (
              <button onClick={cancelEdit} style={secondaryButtonStyle}>
                Mégse
              </button>
            )}
          </div>
        </section>

        <section>
          <div style={filterBarStyle}>
            <h2 style={sectionTitleStyle}>
              Mentett sources {loading ? "..." : `(${filteredItems.length})`}
            </h2>

            <input
              placeholder="Keresés cím, politikus, téma, ország szerint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, maxWidth: 360 }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, maxWidth: 180 }}
            >
              <option value="all">Összes státusz</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {filteredItems.length === 0 && (
            <p style={{ color: "#777" }}>Nincs találat.</p>
          )}

          <div style={{ display: "grid", gap: 14 }}>
            {filteredItems.map((item) => (
              <article key={item.id} style={sourceCardStyle}>
                <div style={sourceHeaderStyle}>
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={getStatusStyle(item.status || "draft")}>
                        {item.status || "draft"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 20, marginBottom: 6 }}>
                      {item.title}
                    </h3>

                    <div style={metaStyle}>
                      <strong>{item.politician || "Nincs személy"}</strong>
                      {" · "}
                      {item.topic || "Nincs téma"}
                      {" · "}
                      {item.country || "Nincs ország"}
                      {" · "}
                      {item.type}
                      {" · "}
                      {item.language}
                      {item.source_date ? ` · ${item.source_date}` : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => quickStatus(item.id, "draft")} style={smallButtonStyle}>Draft</button>
                    <button onClick={() => quickStatus(item.id, "review")} style={smallButtonStyle}>Review</button>
                    <button onClick={() => quickStatus(item.id, "published")} style={publishButtonStyle}>Publish</button>
                    <button onClick={() => startEdit(item)} style={editButtonStyle}>Szerkesztés</button>
                    <button onClick={() => deleteSource(item.id)} style={deleteButtonStyle}>Törlés</button>
                  </div>
                </div>

                {item.summary && <p style={summaryStyle}>{item.summary}</p>}

                <a href={item.url} target="_blank" rel="noreferrer">
                  Forrás megnyitása
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function getStatusStyle(status: string): CSSProperties {
  const base: CSSProperties = {
    display: "inline-block",
    padding: "4px 9px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
  };

  if (status === "published") {
    return { ...base, background: "#dcfce7", color: "#166534" };
  }

  if (status === "review") {
    return { ...base, background: "#fef3c7", color: "#92400e" };
  }

  if (status === "archived") {
    return { ...base, background: "#e5e7eb", color: "#374151" };
  }

  return { ...base, background: "#dbeafe", color: "#1e40af" };
}

const pageStyle: CSSProperties = {
  padding: 32,
  maxWidth: 1180,
  margin: "0 auto",
};

const topBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "16px 32px",
  borderBottom: "1px solid #e5e7eb",
  background: "white",
};

const titleStyle: CSSProperties = {
  fontSize: 34,
  marginBottom: 8,
  fontWeight: 800,
};

const subtitleStyle: CSSProperties = {
  color: "#555",
  marginBottom: 24,
  lineHeight: 1.5,
};

const cardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 22,
  marginBottom: 28,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 22,
  marginBottom: 16,
  fontWeight: 800,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
};

const inputStyle: CSSProperties = {
  padding: 11,
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  width: "100%",
  background: "white",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  width: "100%",
  marginTop: 12,
  minHeight: 100,
  resize: "vertical",
};

const buttonStyle: CSSProperties = {
  padding: "11px 18px",
  border: "none",
  borderRadius: 10,
  background: "#111827",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButtonStyle: CSSProperties = {
  padding: "11px 18px",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "white",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 700,
};

const smallButtonStyle: CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 9,
  background: "white",
  cursor: "pointer",
};

const publishButtonStyle: CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #16a34a",
  borderRadius: 9,
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const filterBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
  flexWrap: "wrap",
};

const sourceCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 18,
};

const sourceHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
};

const metaStyle: CSSProperties = {
  color: "#555",
  marginBottom: 8,
  lineHeight: 1.5,
};

const summaryStyle: CSSProperties = {
  lineHeight: 1.55,
  marginBottom: 10,
  color: "#334155",
};

const editButtonStyle: CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "white",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 600,
};

const deleteButtonStyle: CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #dc2626",
  borderRadius: 8,
  background: "white",
  color: "#dc2626",
  cursor: "pointer",
  fontWeight: 600,
};