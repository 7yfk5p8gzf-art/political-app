"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders } from "@/lib/clientAuth";

type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  topic_hu: string | null;
  topic_de: string | null;
  topic_en: string | null;
  topic_fr: string | null;
  slug: string | null;
  old_statement: string | null;
  old_date: string | null;
  old_source: string | null;
  new_statement: string | null;
  new_date: string | null;
  new_source: string | null;
  ai_summary: string | null;
    ai_summary_hu: string | null;
  ai_summary_de: string | null;
  ai_summary_en: string | null;
  ai_summary_fr: string | null;
  status: string | null;
};

export default function EditContradictionPage() {
  const params = useParams();
  const id = String(params.id);

  const [item, setItem] = useState<Contradiction | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("contradictions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      alert("Betöltési hiba: " + error.message);
      return;
    }

    setItem(data);
  }

  async function save() {
    if (!item) return;

    setSaving(true);

    const response = await fetch(`/api/admin/contradictions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({
        action: "edit",
        fields: {
        politician: item.politician,
        topic: item.topic,
        topic_hu: item.topic_hu,
        topic_de: item.topic_de,
        topic_en: item.topic_en,
        topic_fr: item.topic_fr,
        slug: item.slug,
        old_statement: item.old_statement,
        old_date: item.old_date,
        old_source: item.old_source,
        new_statement: item.new_statement,
        new_date: item.new_date,
        new_source: item.new_source,
        ai_summary: item.ai_summary,
        ai_summary_hu: item.ai_summary_hu,
ai_summary_de: item.ai_summary_de,
ai_summary_en: item.ai_summary_en,
ai_summary_fr: item.ai_summary_fr,
        status: item.status,
        },
      }),
    });

    setSaving(false);

    if (!response.ok) {
      alert("Mentési hiba: " + ((await response.json().catch(() => null))?.error || "ismeretlen hiba"));
      return;
    }

    alert("Mentve ✔");
  }

  if (!item) {
    return <main style={pageStyle}>Betöltés...</main>;
  }

  return (
    <main style={pageStyle}>
      <h1 style={titleStyle}>Ellentmondás szerkesztése</h1>

      <label style={labelStyle}>Politikus</label>
      <input
        style={inputStyle}
        value={item.politician || ""}
        onChange={(e) => setItem({ ...item, politician: e.target.value })}
      />

      <label style={labelStyle}>Régi topic mező / fallback</label>
      <input
        style={inputStyle}
        value={item.topic || ""}
        onChange={(e) => setItem({ ...item, topic: e.target.value })}
      />

      <section style={languageBoxStyle}>
        <h2 style={sectionTitleStyle}>Multilingual topic mezők</h2>

        <div style={topicGridStyle}>
          <div>
            <label style={labelStyle}>Topic HU</label>
            <input
              style={inputStyle}
              value={item.topic_hu || ""}
              onChange={(e) =>
                setItem({ ...item, topic_hu: e.target.value })
              }
              placeholder="pl. migrációs politika"
            />
          </div>

          <div>
            <label style={labelStyle}>Topic DE</label>
            <input
              style={inputStyle}
              value={item.topic_de || ""}
              onChange={(e) =>
                setItem({ ...item, topic_de: e.target.value })
              }
              placeholder="pl. Migrationspolitik"
            />
          </div>

          <div>
            <label style={labelStyle}>Topic EN</label>
            <input
              style={inputStyle}
              value={item.topic_en || ""}
              onChange={(e) =>
                setItem({ ...item, topic_en: e.target.value })
              }
              placeholder="pl. Migration policy"
            />
          </div>

          <div>
            <label style={labelStyle}>Topic FR</label>
            <input
              style={inputStyle}
              value={item.topic_fr || ""}
              onChange={(e) =>
                setItem({ ...item, topic_fr: e.target.value })
              }
              placeholder="pl. Politique migratoire"
            />
          </div>
        </div>
      </section>

      <label style={labelStyle}>Slug</label>
      <input
        style={inputStyle}
        value={item.slug || ""}
        onChange={(e) => setItem({ ...item, slug: e.target.value })}
      />

      <label style={labelStyle}>Status</label>
      <select
        style={inputStyle}
        value={item.status || "draft"}
        onChange={(e) => setItem({ ...item, status: e.target.value })}
      >
        <option value="draft">draft</option>
        <option value="review">review</option>
        <option value="published">published</option>
      </select>

      <div style={gridStyle}>
        <section style={boxStyle}>
          <h2>RÉGEN</h2>

          <label style={labelStyle}>Régi állítás</label>
          <textarea
            style={textareaStyle}
            value={item.old_statement || ""}
            onChange={(e) =>
              setItem({ ...item, old_statement: e.target.value })
            }
          />

          <label style={labelStyle}>Régi dátum</label>
          <input
            style={inputStyle}
            value={item.old_date || ""}
            onChange={(e) => setItem({ ...item, old_date: e.target.value })}
          />

          <label style={labelStyle}>Régi forrás</label>
          <input
            style={inputStyle}
            value={item.old_source || ""}
            onChange={(e) => setItem({ ...item, old_source: e.target.value })}
          />
        </section>

        <section style={boxStyle}>
          <h2>MOST</h2>

          <label style={labelStyle}>Új állítás</label>
          <textarea
            style={textareaStyle}
            value={item.new_statement || ""}
            onChange={(e) =>
              setItem({ ...item, new_statement: e.target.value })
            }
          />

          <label style={labelStyle}>Új dátum</label>
          <input
            style={inputStyle}
            value={item.new_date || ""}
            onChange={(e) => setItem({ ...item, new_date: e.target.value })}
          />

          <label style={labelStyle}>Új forrás</label>
          <input
            style={inputStyle}
            value={item.new_source || ""}
            onChange={(e) => setItem({ ...item, new_source: e.target.value })}
          />
        </section>
      </div>

      <label style={labelStyle}>AI összefoglaló / régi fallback</label>
<textarea
  style={{ ...textareaStyle, minHeight: 120 }}
  value={item.ai_summary || ""}
  onChange={(e) => setItem({ ...item, ai_summary: e.target.value })}
/>

<section style={languageBoxStyle}>
  <h2 style={sectionTitleStyle}>Multilingual AI összefoglaló</h2>

  <label style={labelStyle}>AI summary HU</label>
  <textarea
    style={{ ...textareaStyle, minHeight: 110 }}
    value={item.ai_summary_hu || ""}
    onChange={(e) => setItem({ ...item, ai_summary_hu: e.target.value })}
  />

  <label style={labelStyle}>AI summary DE</label>
  <textarea
    style={{ ...textareaStyle, minHeight: 110 }}
    value={item.ai_summary_de || ""}
    onChange={(e) => setItem({ ...item, ai_summary_de: e.target.value })}
  />

  <label style={labelStyle}>AI summary EN</label>
  <textarea
    style={{ ...textareaStyle, minHeight: 110 }}
    value={item.ai_summary_en || ""}
    onChange={(e) => setItem({ ...item, ai_summary_en: e.target.value })}
  />

  <label style={labelStyle}>AI summary FR</label>
  <textarea
    style={{ ...textareaStyle, minHeight: 110 }}
    value={item.ai_summary_fr || ""}
    onChange={(e) => setItem({ ...item, ai_summary_fr: e.target.value })}
  />
</section>

      <div style={buttonRowStyle}>
        <button onClick={save} disabled={saving} style={saveButtonStyle}>
          {saving ? "Mentés..." : "💾 Mentés"}
        </button>

        <a href="/admin/contradictions" style={backButtonStyle}>
          ← Vissza
        </a>

        <a
          href={`/contradictions/${item.slug}?preview=1`}
          target="_blank"
          style={previewButtonStyle}
        >
          Megnyitás →
        </a>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  padding: 32,
  maxWidth: 1100,
};

const titleStyle: React.CSSProperties = {
  marginBottom: 24,
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 20,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 800,
  marginBottom: 6,
  marginTop: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  marginBottom: 8,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 110,
  padding: 10,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  marginBottom: 8,
};

const languageBoxStyle: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  borderRadius: 12,
  padding: 18,
  marginTop: 16,
  marginBottom: 16,
};

const topicGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 18,
  marginTop: 20,
};

const boxStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: 18,
  background: "#fffdf7",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 20,
  flexWrap: "wrap",
};

const saveButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
};

const backButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "1px solid #111827",
  borderRadius: 10,
  textDecoration: "none",
  color: "#111827",
  fontWeight: 800,
};

const previewButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "1px solid #111827",
  borderRadius: 10,
  textDecoration: "none",
  color: "#111827",
  fontWeight: 800,
};
