"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders } from '@/lib/clientAuth';

type Source = {
  id: string;
  title: string | null;
  url?: string | null;
  type?: string | null;
  summary?: string | null;
  article_url?: string | null;
  video_url?: string | null;
  source_type?: string | null;
  quote_text?: string | null;
  ai_summary?: string | null;
  politician: string | null;
  topic: string | null;
  source_date: string | null;
  language: string | null;
  country: string | null;
  status: string | null;
};

type Contradiction = {
  id: string;
  old_source_id: string | null;
  new_source_id: string | null;
  slug: string | null;
  ai_summary: string | null;
  status: string | null;
  created_at: string | null;
  published_at: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  topic_hu: string | null;
  topic_de: string | null;
  topic_en: string | null;
  topic_fr: string | null;
};

export default function AdminContradictionsPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [items, setItems] = useState<Contradiction[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [oldSource, setOldSource] = useState("");
  const [newSource, setNewSource] = useState("");
  const [oldSourceSearch, setOldSourceSearch] = useState("");
  const [newSourceSearch, setNewSourceSearch] = useState("");

  const [search, setSearch] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string>("editor");
  const [userRole, setUserRole] = useState<string | null>(null);

  const canPublish = role === "superadmin" || role === "admin";
  const canReview =
    role === "superadmin" || role === "admin" || role === "reviewer";
  const canDelete = role === "superadmin" || role === "admin";

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadContradictions();
    }
  }, [showDeleted]);

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

    const userRole = profile?.role ?? "editor";
    setUserRole(role);
    setRole(userRole);

    if (
      userRole !== "editor" &&
      userRole !== "reviewer" &&
      userRole !== "admin" &&
      userRole !== "superadmin"
    ) {
      alert("Nincs jogosultságod ehhez az oldalhoz");
      window.location.href = "/";
      return;
    }

    setUserEmail(user.email || null);
    setAuthLoading(false);
    await loadSources();
    await loadContradictions();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function loadSources() {
    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("source_date", { ascending: false });

    if (error) {
      alert("Sources betöltési hiba: " + error.message);
      return;
    }

    setSources(data || []);
  }

  async function loadContradictions() {
    let query = supabase
      .from("contradictions")
      .select("*")
      .order("id", { ascending: false });

    if (!showDeleted) {
      query = query.is("deleted_at", null);
    } else {
      query = query.not("deleted_at", "is", null);
    }

    const { data, error } = await query;

    if (error) {
      alert("Contradictions betöltési hiba: " + error.message);
      return;
    }

    setItems(data || []);
  }

  function getSource(id: string | null) {
    return sources.find((s) => s.id === id) || null;
  }

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;

    return items.filter((item) => {
      const oldS = getSource(item.old_source_id);
      const newS = getSource(item.new_source_id);

      return [
        oldS?.title,
        newS?.title,
        oldS?.politician,
        newS?.politician,
        oldS?.topic,
        newS?.topic,
        oldS?.country,
        newS?.country,
        item.status,
        item.slug,
        item.deleted_by,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, sources, search]);

  const filteredOldSources = useMemo(() => {
    const q = oldSourceSearch.toLowerCase().trim();
    if (!q) return sources;

    return sources.filter((s) =>
      [s.title, s.politician, s.topic, s.country, s.source_date]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [sources, oldSourceSearch]);

  const filteredNewSources = useMemo(() => {
    const q = newSourceSearch.toLowerCase().trim();
    if (!q) return sources;

    return sources.filter((s) =>
      [s.title, s.politician, s.topic, s.country, s.source_date]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [sources, newSourceSearch]);

  async function create() {
    if (!oldSource || !newSource) {
      alert("Válassz ki 2 source-t");
      return;
    }

    const oldS = getSource(oldSource);
    const newS = getSource(newSource);

    const duplicate = items.find(
      (item) =>
        item.old_source_id === oldSource &&
        item.new_source_id === newSource &&
        !item.deleted_at
    );

    if (duplicate) {
      alert("Ez az OLD + NEW source páros már létezik.");
      return;
    }

    if (!oldS || !newS) {
      alert("Nem találom a kiválasztott source-t");
      return;
    }

    const response = await fetch("/api/admin/contradictions", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({ old_source_id: oldSource, new_source_id: newSource }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      alert("Mentési hiba: " + (result?.error || "ismeretlen hiba"));
      return;
    }

    setOldSource("");
    setNewSource("");
    await loadContradictions();
    alert("Mentve draftként");
  }

  async function remove(id: string) {
    if (!canDelete) {
      alert("Nincs jogosultságod törölni.");
      return;
    }

    const ok = confirm("Biztos törlöd ezt az ellentmondást? Mostantól csak a lomtárba kerül, visszaállítható.");
    if (!ok) return;

    const response = await fetch(`/api/admin/contradictions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({ action: "soft_delete" }),
    });
    if (!response.ok) {
      alert("Törlési hiba: " + ((await response.json().catch(() => null))?.error || "ismeretlen hiba"));
      return;
    }

    await loadContradictions();
  }

  async function restore(id: string) {
    if (!canDelete) {
      alert("Nincs jogosultságod visszaállítani.");
      return;
    }

    const response = await fetch(`/api/admin/contradictions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({ action: "restore" }),
    });
    if (!response.ok) {
      alert("Restore hiba: " + ((await response.json().catch(() => null))?.error || "ismeretlen hiba"));
      return;
    }

    await loadContradictions();
  }

  async function updateStatus(
  id: string,
  status: "draft" | "review" | "approved" | "published"
) {
    if (status === "published" && !canPublish) {
      alert(
        "Nincs jogosultságod publikálni. Csak superadmin vagy admin publikálhat."
      );
      return;
    }

    if (status === "draft" && !canReview) {
      alert("Nincs jogosultságod visszaküldeni draftba.");
      return;
    }

    const item = items.find((x) => x.id === id);

    if (item?.deleted_at) {
      alert("Törölt elemet előbb vissza kell állítani.");
      return;
    }

    const response = await fetch(`/api/admin/contradictions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({ action: "status", status }),
    });
    if (!response.ok) {
      alert("Status hiba: " + ((await response.json().catch(() => null))?.error || "ismeretlen hiba"));
      return;
    }

    await loadContradictions();
  }

  async function generateAI(id: string) {
    const { data } = await supabase
      .from("contradictions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!data) {
      alert("Nincs adat");
      return;
    }

    if (data.deleted_at) {
      alert("Törölt elemhez előbb restore kell.");
      return;
    }

    const prompt = `
Régi állítás:
${data.old_statement || "Nincs régi állítás megadva."}

Új állítás:
${data.new_statement || "Nincs új állítás megadva."}

Politikus:
${data.politician || "Ismeretlen"}

Téma:
${data.topic || "Ismeretlen"}

Írj rövid, semleges magyar elemzést.
`;

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { ...(await getAuthHeaders()) },
      body: JSON.stringify({ prompt }),
    });

    const json = await res.json();

    const save = await fetch(`/api/admin/contradictions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({ action: "ai_summary", ai_summary: json.text || "" }),
    });
    if (!save.ok) {
      alert("AI összefoglaló mentése sikertelen");
      return;
    }

    alert("AI kész");
    await loadContradictions();
  }

  if (authLoading) {
    return <div style={{ padding: 32 }}>Betöltés...</div>;
  }

  return (
    <>
      <div style={topBarStyle}>
        <div>
          <strong>Admin</strong>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            {userEmail} · {role}
          </div>
        </div>

        <button onClick={logout} style={smallButtonStyle}>
          Kijelentkezés
        </button>
      </div>

      <main style={pageStyle}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={titleStyle}>Contradictions Admin</h1>
          <p style={subtitleStyle}>
            Itt kapcsoljuk össze a régi és új source-okat. A publikus
            ellentmondás oldal ezekből épül.
          </p>
        </div>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Új contradiction létrehozása</h2>

          <div style={compareGridStyle}>
            <div style={selectBoxStyle}>
              <h3 style={boxTitleStyle}>OLD source</h3>

              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                Találatok: {filteredOldSources.length}
              </div>

              <input
                placeholder="Keresés régi source között..."
                value={oldSourceSearch}
                onChange={(e) => setOldSourceSearch(e.target.value)}
                style={{ ...inputStyle, marginBottom: 10 }}
              />

              <select
                value={oldSource}
                onChange={(e) => setOldSource(e.target.value)}
                style={inputStyle}
              >
                <option value="">Válassz régi source-t</option>
                {filteredOldSources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.source_date || "nincs dátum"} · {s.politician || "?"} ·{" "}
                    {s.title}
                  </option>
                ))}
              </select>

              {oldSource && <SourcePreview source={getSource(oldSource)} />}
            </div>

            <div style={selectBoxStyle}>
              <h3 style={boxTitleStyle}>NEW source</h3>

              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                Találatok: {filteredNewSources.length}
              </div>

              <input
                placeholder="Keresés új source között..."
                value={newSourceSearch}
                onChange={(e) => setNewSourceSearch(e.target.value)}
                style={{ ...inputStyle, marginBottom: 10 }}
              />

              <select
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                style={inputStyle}
              >
                <option value="">Válassz új source-t</option>
                {filteredNewSources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.source_date || "nincs dátum"} · {s.politician || "?"} ·{" "}
                    {s.title}
                  </option>
                ))}
              </select>

              {newSource && <SourcePreview source={getSource(newSource)} />}
            </div>
          </div>

          <button onClick={create} style={buttonStyle}>
            Mentés draftként
          </button>
        </section>

        <section>
          <div style={listHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                {showDeleted ? "Lomtár" : "Contradictions lista"} ({filteredItems.length})
              </h2>

              <button
                onClick={() => setShowDeleted((value) => !value)}
                style={secondaryButtonStyle}
              >
                {showDeleted ? "Aktív elemek mutatása" : "Lomtár mutatása"}
              </button>
            </div>

            <input
              placeholder="Keresés politikus, téma, ország, cím szerint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, maxWidth: 420 }}
            />
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {filteredItems.map((item) => {
              const oldS = getSource(item.old_source_id);
              const newS = getSource(item.new_source_id);
              const isDeleted = Boolean(item.deleted_at);

              return (
                <article key={item.id} style={isDeleted ? deletedCardStyle : cardStyle}>
                  <div style={itemHeaderStyle}>
                    <div>
                      <div style={statusLineStyle}>
                        <strong>Status:</strong>{" "}
                        <span style={badgeStyle}>{item.status || "draft"}</span>
                        {isDeleted && (
                          <span style={deletedBadgeStyle}>Deleted</span>
                        )}
                      </div>

                      <div style={miniTextStyle}>{item.slug}</div>

                      <div style={miniTextStyle}>
                        Létrehozva:{" "}
                        {item.created_at ? item.created_at.slice(0, 10) : "-"}
                        {" · "}
                        Publikálva:{" "}
                        {item.published_at
                          ? item.published_at.slice(0, 10)
                          : "-"}
                        {isDeleted && (
                          <>
                            {" · "}
                            Törölve:{" "}
                            {item.deleted_at
                              ? item.deleted_at.slice(0, 10)
                              : "-"}
                            {" · "}
                            Törölte: {item.deleted_by || "-"}
                          </>
                        )}
                      </div>
                    </div>

                    {!isDeleted && (
                      <a
                        href={`/admin/contradictions/${item.id}/edit`}
                        style={editLinkStyle}
                      >
                        Szerkesztés
                      </a>
                    )}
                  </div>

                  <div style={compareGridStyle}>
                    <div style={oldBoxStyle}>
                      <h3 style={boxTitleStyle}>OLD</h3>
                      <SourcePreview source={oldS} />
                    </div>

                    <div style={newBoxStyle}>
                      <h3 style={boxTitleStyle}>NEW</h3>
                      <SourcePreview source={newS} />
                    </div>
                  </div>

                  {item.ai_summary && (
                    <p style={summaryStyle}>
                      <strong>AI:</strong> {item.ai_summary}
                    </p>
                  )}

                  <div style={actionRowStyle}>
                    {!isDeleted && item.status === "draft" && (
                      <button
                        onClick={() => updateStatus(item.id, "review")}
                        style={secondaryButtonStyle}
                      >
                        Review-ra küld
                      </button>
                    )}

                    {!isDeleted && canReview && item.status === "review" && (
                      <button
                        onClick={() => updateStatus(item.id, "approved")}
                        style={secondaryButtonStyle}
                      >
                        Approve
                      </button>
                    )}

                    {!isDeleted && item.status === "approved" && (
                      <button
                        onClick={() => updateStatus(item.id, "published")}
                        disabled={!canPublish}
                        style={{
                          ...publishButtonStyle,
                          opacity: canPublish ? 1 : 0.45,
                          cursor: canPublish ? "pointer" : "not-allowed",
                        }}
                        title={
                          canPublish
                            ? "Publikálás"
                            : "Csak superadmin vagy admin publikálhat"
                        }
                      >
                        Publish
                      </button>
                    )}

                    {!isDeleted && canPublish && item.status === "published" && (
                      <button
                        onClick={() => updateStatus(item.id, "review")}
                        style={secondaryButtonStyle}
                      >
                        Vissza review
                      </button>
                    )}

                    {!isDeleted && (
                      <button
                        onClick={() => generateAI(item.id)}
                        style={secondaryButtonStyle}
                      >
                        AI
                      </button>
                    )}

                    {!isDeleted && canDelete && (
                      <button
                        onClick={() => remove(item.id)}
                        style={deleteButtonStyle}
                      >
                        Lomtárba
                      </button>
                    )}

                    {isDeleted && canDelete && (
                      <button
                        onClick={() => restore(item.id)}
                        style={restoreButtonStyle}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}

function SourcePreview({ source }: { source: Source | null }) {
  if (!source) {
    return <p style={{ color: "#777" }}>Nincs source kiválasztva.</p>;
  }

  const articleUrl = source.article_url || source.url || "";
  const videoUrl = source.video_url || "";
  const sourceType = source.source_type || source.type || "source";
  const summary = source.ai_summary || source.summary || "";

  return (
    <div>
      <h4 style={{ fontSize: 18, marginBottom: 8 }}>{source.title}</h4>

      <div style={metaStyle}>
        <strong>{source.politician || "Nincs személy"}</strong>
        {" · "}
        {source.topic || "Nincs téma"}
        {" · "}
        {source.country || "Nincs ország"}
        {" · "}
        {sourceType}
        {" · "}
        {source.language || "nincs nyelv"}
        {source.source_date ? ` · ${source.source_date}` : ""}
      </div>

      {source.quote_text && <p style={quoteStyle}>“{source.quote_text}”</p>}

      {summary && <p style={previewSummaryStyle}>{summary}</p>}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {articleUrl && (
          <a href={articleUrl} target="_blank" rel="noreferrer">
            Cikk megnyitása
          </a>
        )}

        {videoUrl && (
          <a href={videoUrl} target="_blank" rel="noreferrer">
            Videó megnyitása
          </a>
        )}
      </div>
    </div>
  );
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
  marginBottom: 24,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const deletedCardStyle: CSSProperties = {
  ...cardStyle,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 22,
  marginBottom: 16,
  fontWeight: 800,
};

const compareGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const selectBoxStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  background: "#f8fafc",
};

const oldBoxStyle: CSSProperties = {
  border: "1px solid #bfdbfe",
  borderRadius: 12,
  padding: 16,
  background: "#eff6ff",
};

const newBoxStyle: CSSProperties = {
  border: "1px solid #bbf7d0",
  borderRadius: 12,
  padding: 16,
  background: "#f0fdf4",
};

const boxTitleStyle: CSSProperties = {
  fontSize: 15,
  marginBottom: 10,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const inputStyle: CSSProperties = {
  padding: 11,
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  width: "100%",
  background: "white",
};

const buttonStyle: CSSProperties = {
  marginTop: 16,
  padding: "11px 18px",
  border: "none",
  borderRadius: 10,
  background: "#111827",
  color: "white",
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

const listHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 16,
  flexWrap: "wrap",
};

const itemHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 16,
};

const statusLineStyle: CSSProperties = {
  marginBottom: 6,
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "3px 8px",
  borderRadius: 999,
  background: "#e2e8f0",
  fontSize: 13,
  fontWeight: 700,
};

const deletedBadgeStyle: CSSProperties = {
  display: "inline-block",
  marginLeft: 8,
  padding: "3px 8px",
  borderRadius: 999,
  background: "#fed7aa",
  color: "#9a3412",
  fontSize: 13,
  fontWeight: 800,
};

const miniTextStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
};

const metaStyle: CSSProperties = {
  color: "#555",
  marginBottom: 8,
  lineHeight: 1.5,
};

const summaryStyle: CSSProperties = {
  lineHeight: 1.55,
  marginTop: 14,
  padding: 14,
  borderRadius: 10,
  background: "#f8fafc",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 18,
};

const editLinkStyle: CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "white",
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 700,
  height: 38,
};

const secondaryButtonStyle: CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "white",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 600,
};

const publishButtonStyle: CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #16a34a",
  borderRadius: 8,
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,

};
const approveButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
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

const restoreButtonStyle: CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #16a34a",
  borderRadius: 8,
  background: "white",
  color: "#15803d",
  cursor: "pointer",
  fontWeight: 700,
};

const quoteStyle: CSSProperties = {
  lineHeight: 1.55,
  marginTop: 12,
  marginBottom: 10,
  color: "#111827",
  background: "#f8fafc",
  borderLeft: "4px solid #111827",
  padding: "10px 12px",
  borderRadius: 8,
};

const previewSummaryStyle: CSSProperties = {
  lineHeight: 1.5,
  color: "#334155",
  background: "white",
  padding: 10,
  borderRadius: 8,
  marginTop: 10,
  marginBottom: 10,
};
