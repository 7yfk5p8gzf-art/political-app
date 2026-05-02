"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  slug: string | null;
  old_statement: string | null;
  old_date: string | null;
  old_source: string | null;
  old_video_url: string | null;
  new_statement: string | null;
  new_date: string | null;
  new_source: string | null;
  new_video_url: string | null;
  ai_summary: string | null;
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

    const { error } = await supabase
      .from("contradictions")
      .update({
        politician: item.politician,
        topic: item.topic,
        slug: item.slug,
        old_statement: item.old_statement,
        old_date: item.old_date,
        old_source: item.old_source,
        old_video_url: item.old_video_url,
        new_statement: item.new_statement,
        new_date: item.new_date,
        new_source: item.new_source,
        new_video_url: item.new_video_url,
        ai_summary: item.ai_summary,
        status: item.status,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert("Mentési hiba: " + error.message);
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

      <label style={labelStyle}>Téma</label>
      <input
        style={inputStyle}
        value={item.topic || ""}
        onChange={(e) => setItem({ ...item, topic: e.target.value })}
      />

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

          <label style={labelStyle}>Régi videó link</label>
          <input
            style={inputStyle}
            placeholder="https://www.youtube.com/watch?v=..."
            value={item.old_video_url || ""}
            onChange={(e) =>
              setItem({ ...item, old_video_url: e.target.value })
            }
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

          <label style={labelStyle}>Új videó link</label>
          <input
            style={inputStyle}
            placeholder="https://www.youtube.com/watch?v=..."
            value={item.new_video_url || ""}
            onChange={(e) =>
              setItem({ ...item, new_video_url: e.target.value })
            }
          />
        </section>
      </div>

      <label style={labelStyle}>AI összefoglaló</label>
      <textarea
        style={{ ...textareaStyle, minHeight: 140 }}
        value={item.ai_summary || ""}
        onChange={(e) => setItem({ ...item, ai_summary: e.target.value })}
      />

      <div style={buttonRowStyle}>
        <button onClick={save} disabled={saving} style={saveButtonStyle}>
          {saving ? "Mentés..." : "💾 Mentés"}
        </button>

        <a href="/admin/contradictions" style={backButtonStyle}>
          ← Vissza
        </a>

        <a
          href={`/compare/${item.slug}`}
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