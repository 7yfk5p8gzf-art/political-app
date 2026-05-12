"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type Source = {
  id: string;
  created_at?: string;
  title: string | null;
  url?: string | null;
  type?: string | null;
  summary?: string | null;
  source_type?: string | null;
  article_url?: string | null;
  video_url?: string | null;
  quote_text?: string | null;
  ai_summary?: string | null;
  source_date: string | null;
  language: string | null;
  politician: string | null;
  topic: string | null;
  country: string | null;
  status: string | null;
};

const emptyForm = {
  title: "",
  article_url: "",
  video_url: "",
  source_type: "article",
  source_date: "",
  language: "hu",
  quote_text: "",
  ai_summary: "",
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

  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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
    setUserRole(role);

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
      const status = item.status || "draft";
      const sourceType = item.source_type || item.type || "article";
      const articleUrl = item.article_url || item.url || "";
      const videoUrl = item.video_url || "";
      const aiSummary = item.ai_summary || item.summary || "";

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      const matchesSearch =
        !q ||
        [
          item.title,
          articleUrl,
          videoUrl,
          sourceType,
          item.language,
          aiSummary,
          item.quote_text,
          item.politician,
          item.topic,
          item.country,
          status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [items, search, statusFilter]);

  async function saveSource() {
    if (!form.title.trim()) {
      alert("Cím kötelező");
      return;
    }

    if (!form.article_url.trim() && !form.video_url.trim()) {
      alert("Legalább egy cikk link vagy videó link kell");
      return;
    }

    const primaryUrl = form.article_url.trim() || form.video_url.trim();

    const payload = {
      title: form.title.trim(),

      // új mezők
      article_url: form.article_url.trim() || null,
      video_url: form.video_url.trim() || null,
      source_type: form.source_type,
      quote_text: form.quote_text.trim() || null,
      ai_summary: form.ai_summary.trim() || null,

      // régi kompatibilitás
      url: primaryUrl,
      type: form.source_type,
      summary: form.ai_summary.trim() || null,

      source_date: form.source_date || null,
      language: form.language,
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
      article_url: item.article_url || item.url || "",
      video_url: item.video_url || "",
      source_type: item.source_type || item.type || "article",
      source_date: item.source_date || "",
      language: item.language || "hu",
      quote_text: item.quote_text || "",
      ai_summary: item.ai_summary || item.summary || "",
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
    const { error } = await supabase.from("sources").update({ status }).eq("id", id);

    if (error) {
      alert("Státusz hiba: " + error.message);
      return;
    }

    loadSources();
  }

  async function handleAiSearch(customQuery?: string) {
  const queryToUse = customQuery || aiQuery;

  if (!queryToUse.trim()) {
    alert("Írj be keresést");
    return;
  }

  setAiQuery(queryToUse);
  setAiLoading(true);
  setAiResult(null);

  try {
    const res = await fetch("/api/ai-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: queryToUse }),
    });

    const data = await res.json();
    setAiResult(data);
  } catch {
    alert("AI keresési hiba");
  }

  setAiLoading(false);
}

  function addArticleFromAi(a: any) {
    setForm((prev) => ({
      ...prev,
      title: a.title || "",
      article_url: a.url || "",
      source_type: "article",
      ai_summary: aiResult?.summary || "",
      politician: aiResult?.politician || prev.politician,
      topic: aiResult?.topic || prev.topic || "general",
      country: aiResult?.country || prev.country || "EU",
      status: "draft",
    }));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addVideoFromAi(v: any) {
    setForm((prev) => ({
      ...prev,
      title: v.title || "",
      video_url: v.url || "",
      source_type: "video",
      ai_summary: aiResult?.summary || "",
      politician: aiResult?.politician || prev.politician,
      topic: aiResult?.topic || prev.topic || "general",
      country: aiResult?.country || prev.country || "EU",
      status: "draft",
    }));

    window.scrollTo({ top: 0, behavior: "smooth" });
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
            Itt mentjük a cikkeket, videókat, idézeteket és AI összefoglalókat.
            A contradiction oldal később ezekből választ.
          </p>
        </div>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>AI source kereső</h2>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Pl: Scholz migration Germany 2023"
              style={{ ...inputStyle, maxWidth: 520 }}
            />

            <button onClick={() => handleAiSearch()} style={buttonStyle}>
              {aiLoading ? "Keresés..." : "AI keresés"}
            </button>
          </div>

          {aiResult && (
            <div style={{ marginTop: 20 }}>
              {aiResult.summary && (
                
  <div style={warningBoxStyle}>
    ⚠️ {aiResult.warning}
  </div>
)}

{aiResult.source_quality && (
  <div style={metaBoxStyle}>
    <strong>Forrás minőség:</strong> {aiResult.source_quality}
  </div>
)}

{aiResult.relevance_score > 0 && (
  <div style={metaBoxStyle}>
    <strong>Relevancia:</strong> {aiResult.relevance_score}/100
  </div>
)}
{aiResult.source_intent && (
  <div style={metaBoxStyle}>
    <strong>Forrás jelleg:</strong>
    {" "}
    {aiResult.source_intent}
  </div>
)}
{aiResult.quote_candidate && (
  <div style={quoteCandidateStyle}>
    “{aiResult.quote_candidate}”
  </div>
)}
{aiResult.transcript_quote && (
  <div style={quoteCandidateStyle}>
    <strong>Transcript:</strong>
    <div style={{ marginTop: 6 }}>
      “{aiResult.transcript_quote}”
    </div>
  </div>
)}

{aiResult.timestamp && (
  <div style={metaBoxStyle}>
    <strong>Timestamp:</strong>{" "}
    {aiResult.timestamp}
  </div>
)}

{aiResult.quote_precision && (
  <div style={metaBoxStyle}>
    <strong>Quote precision:</strong>{" "}
    {aiResult.quote_precision}
  </div>
)}

{aiResult.contradiction_strength && (
  <div style={metaBoxStyle}>
    <strong>Contradiction strength:</strong>{" "}
    {aiResult.contradiction_strength}
  </div>
)}
{aiResult.contradiction_probability > 0 && (
  <div style={contradictionBoxStyle}>
    <strong>
      Lehetséges ellentmondás:
      {" "}
      {aiResult.contradiction_probability}%
    </strong>

    {aiResult.contradiction_reason && (
      <div style={{ marginTop: 8 }}>
        {aiResult.contradiction_reason}
      </div>
    )}
  </div>
)}
  <>
    <h3 style={smallTitleStyle}>AI összefoglaló</h3>
    <p style={summaryStyle}>{aiResult.summary}</p>
  </>
)
{aiResult.best_article_url && (
  <div style={metaBoxStyle}>
    <strong>Legjobb cikk:</strong>

    <div style={{ marginTop: 6 }}>
      <a
        href={aiResult.best_article_url}
        target="_blank"
        rel="noreferrer"
      >
        {aiResult.best_article_url}
      </a>
    </div>
  </div>
)}

{aiResult.best_video_url && (
  <div style={metaBoxStyle}>
    <strong>Legjobb videó:</strong>

    <div style={{ marginTop: 6 }}>
      <a
        href={aiResult.best_video_url}
        target="_blank"
        rel="noreferrer"
      >
        {aiResult.best_video_url}
      </a>
    </div>
  </div>
)}

{aiResult.older_search_suggestion && (
  <div style={suggestionBoxStyle}>
    <div>
      <strong>Régebbi ellentétes állítás keresési javaslat:</strong>
      <div style={{ marginTop: 6 }}>
        {aiResult.older_search_suggestion}
      </div>
    </div>

    <button
      onClick={() => handleAiSearch(aiResult.older_search_suggestion)}
      style={buttonStyle}
    >
      🔎 Older search
    </button>
  </div>
)}
{aiResult.newer_search_suggestion && (
  <div style={suggestionBoxStyle}>
    <div>
      <strong>Újabb állítás keresési javaslat:</strong>

      <div style={{ marginTop: 6 }}>
        {aiResult.newer_search_suggestion}
      </div>
    </div>

    <button
      onClick={() => handleAiSearch(aiResult.newer_search_suggestion)}
      style={buttonStyle}
    >
      🔎 newer search
    </button>
  </div>
)}

              <h3 style={smallTitleStyle}>Cikk találatok</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {aiResult.articles?.map((a: any, index: number) => (
                  <div key={`${a.title}-${index}`} style={resultRowStyle}>
                    <a href={a.url} target="_blank" rel="noreferrer">
                      {a.title}
                    </a>

                    <button onClick={() => addArticleFromAi(a)} style={smallButtonStyle}>
                      ➕ Add cikk
                    </button>
                  </div>
                ))}
              </div>

              <h3 style={smallTitleStyle}>Videó találatok</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {aiResult.videos?.map((v: any, index: number) => (
                  <div key={`${v.title}-${index}`} style={resultRowStyle}>
                    <a
                      href={
                        v.url ||
                        `https://www.youtube.com/results?search_query=${encodeURIComponent(
                          v.title || aiQuery
                        )}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {v.title}
                    </a>

                    <button onClick={() => addVideoFromAi(v)} style={smallButtonStyle}>
                      ➕ Add videó
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            {editingId ? "Source szerkesztése" : "Új source hozzáadása"}
          </h2>

          <div style={gridStyle}>
            <input
              placeholder="Cím"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="Cikk link"
              value={form.article_url}
              onChange={(e) => setForm({ ...form, article_url: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="Videó link"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="Politikus / személy"
              value={form.politician}
              onChange={(e) => setForm({ ...form, politician: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="Téma pl. migráció, háború"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="Ország pl. HU, DE, CH, EU"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              style={inputStyle}
            />

            <input
              type="date"
              value={form.source_date}
              onChange={(e) => setForm({ ...form, source_date: e.target.value })}
              style={inputStyle}
            />

            <select
              value={form.source_type}
              onChange={(e) => setForm({ ...form, source_type: e.target.value })}
              style={inputStyle}
            >
              <option value="article">Cikk</option>
              <option value="video">Videó</option>
              <option value="speech">Beszéd</option>
              <option value="post">Poszt</option>
              <option value="official">Hivatalos dokumentum</option>
              <option value="interview">Interjú</option>
              <option value="other">Egyéb</option>
            </select>

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

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={inputStyle}
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <textarea
            placeholder="Eredeti idézet / fontos részlet"
            value={form.quote_text}
            onChange={(e) => setForm({ ...form, quote_text: e.target.value })}
            style={textareaStyle}
          />

          <textarea
            placeholder="AI összefoglaló / rövid magyarázat"
            value={form.ai_summary}
            onChange={(e) => setForm({ ...form, ai_summary: e.target.value })}
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

          {filteredItems.length === 0 && <p style={{ color: "#777" }}>Nincs találat.</p>}

          <div style={{ display: "grid", gap: 14 }}>
            {filteredItems.map((item) => {
              const sourceType = item.source_type || item.type || "article";
              const articleUrl = item.article_url || item.url || "";
              const videoUrl = item.video_url || "";
              const aiSummary = item.ai_summary || item.summary || "";

              return (
                <article key={item.id} style={sourceCardStyle}>
                  <div style={sourceHeaderStyle}>
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <span style={getStatusStyle(item.status || "draft")}>
                          {item.status || "draft"}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 20, marginBottom: 6 }}>{item.title}</h3>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
  {articleUrl && <span style={typeBadgeStyle}>📰 Cikk</span>}
  {videoUrl && <span style={typeBadgeStyle}>🎥 Videó</span>}
  <span style={typeBadgeStyle}>{sourceType}</span>
</div>

                      <div style={metaStyle}>
                        <strong>{item.politician || "Nincs személy"}</strong>
                        {" · "}
                        {item.topic || "Nincs téma"}
                        {" · "}
                        {item.country || "Nincs ország"}
                        {" · "}
                        {sourceType}
                        {" · "}
                        {item.language || "nincs nyelv"}
                        {item.source_date ? ` · ${item.source_date}` : ""}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => quickStatus(item.id, "draft")} style={smallButtonStyle}>
                        Draft
                      </button>
                      <button onClick={() => quickStatus(item.id, "review")} style={smallButtonStyle}>
                        Review
                      </button>
                      {item.status === "review" && (
  <button
    onClick={() => quickStatus(item.id, "approved")}
    style={smallButtonStyle}
  >
    Approve
  </button>
)}
                      {item.status === "approved" &&
  (userRole === "admin" || userRole === "superadmin") && (
  <button
    onClick={() => quickStatus(item.id, "published")}
    style={publishButtonStyle}
  >
    Publish
  </button>
)}
                      <button onClick={() => startEdit(item)} style={editButtonStyle}>
                        Szerkesztés
                      </button>
                      {(userRole === "admin" || userRole === "superadmin") && (
  <button onClick={() => deleteSource(item.id)} style={deleteButtonStyle}>
    Törlés
  </button>
)}
                    </div>
                  </div>

                  {item.quote_text && <p style={quoteStyle}>“{item.quote_text}”</p>}
                  {aiSummary && <p style={summaryStyle}>{aiSummary}</p>}

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
                </article>
              );
            })}
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

const smallTitleStyle: CSSProperties = {
  fontSize: 17,
  marginTop: 18,
  marginBottom: 8,
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

const resultRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: 10,
  border: "1px solid #e5e7eb",
  borderRadius: 10,
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
const typeBadgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "4px 9px",
  borderRadius: 999,
  background: "#f1f5f9",
  color: "#334155",
  fontSize: 13,
  fontWeight: 800,
};
const suggestionBoxStyle: CSSProperties = {
  marginTop: 14,
  marginBottom: 18,
  padding: 14,
  borderRadius: 12,
  background: "#fef3c7",
  border: "1px solid #f59e0b",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};
const warningBoxStyle: CSSProperties = {
  marginTop: 12,
  padding: 14,
  borderRadius: 10,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  fontWeight: 700,
};

const metaBoxStyle: CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 10,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
};

const quoteCandidateStyle: CSSProperties = {
  marginTop: 12,
  padding: 14,
  borderRadius: 10,
  background: "#f8fafc",
  borderLeft: "4px solid #2563eb",
  fontStyle: "italic",
  fontSize: 16,
  lineHeight: 1.5,
};
const contradictionBoxStyle: CSSProperties = {
  marginTop: 14,
  padding: 16,
  borderRadius: 12,
  background: "#fff7ed",
  border: "1px solid #fdba74",
  color: "#9a3412",
  fontWeight: 600,
};