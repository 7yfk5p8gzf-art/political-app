"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Source = {
  id: string;
  title: string;
  summary: string | null;
  source_date: string | null;
  url: string | null;
  politician: string | null;
  topic: string | null;
};

type Contradiction = {
  id: string;
  slug: string | null;
  old_source_id: string | null;
  new_source_id: string | null;
};

export default function SingleContradictionPage({ params }: any) {
  const [item, setItem] = useState<Contradiction | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const key = params.id;

  useEffect(() => {
    async function load() {
      const { data: bySlug } = await supabase
        .from("contradictions")
        .select("*")
        .eq("slug", key)
        .maybeSingle();

      const { data: byId } = !bySlug
        ? await supabase
            .from("contradictions")
            .select("*")
            .eq("id", key)
            .maybeSingle()
        : { data: null };

      const found = bySlug || byId;
      const { data: sData } = await supabase.from("sources").select("*");

      if (!found) {
        setNotFound(true);
      } else {
        setItem(found);
      }

      setSources(sData || []);
    }

    load();
  }, [key]);

  function getSource(id: string | null) {
    if (!id) return null;
    return sources.find((s) => s.id === id) || null;
  }

  if (notFound) {
    return <main style={{ padding: 32 }}>Nem található ez az ellentmondás.</main>;
  }

  if (!item) {
    return <main style={{ padding: 32 }}>Betöltés...</main>;
  }

  const oldS = getSource(item.old_source_id);
  const newS = getSource(item.new_source_id);

  const person = oldS?.politician || newS?.politician || "Ismeretlen";
  const topic = oldS?.topic || newS?.topic || "Nincs téma";

  return (
    <main style={{ padding: 32, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>
        {person} – {topic}
      </h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          style={shareButtonStyle}
        >
          🔗 Link másolása
        </button>

        <button
          onClick={() => {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent(`${person} – ${topic}`);
            window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
          }}
          style={whatsappButtonStyle}
        >
          WhatsApp
        </button>

        <button
          onClick={() => {
            const url = encodeURIComponent(window.location.href);
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${url}`,
              "_blank"
            );
          }}
          style={facebookButtonStyle}
        >
          Facebook
        </button>
      </div>

      {copied && (
        <p style={{ color: "#16a34a", fontWeight: 700 }}>Link kimásolva ✔</p>
      )}

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <div style={boxStyle}>
          <h3>RÉGEN</h3>
          <h4>{oldS?.title || "Nincs adat"}</h4>
          {oldS?.source_date && <p>Dátum: {oldS.source_date}</p>}
          {oldS?.summary && <p>{oldS.summary}</p>}
          {oldS?.url && (
            <a href={oldS.url} target="_blank" rel="noreferrer">
              Forrás
            </a>
          )}
        </div>

        <div style={boxStyle}>
          <h3>MOST</h3>
          <h4>{newS?.title || "Nincs adat"}</h4>
          {newS?.source_date && <p>Dátum: {newS.source_date}</p>}
          {newS?.summary && <p>{newS.summary}</p>}
          {newS?.url && (
            <a href={newS.url} target="_blank" rel="noreferrer">
              Forrás
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

const boxStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: 10,
  padding: 16,
};

const shareButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #0f172a",
  borderRadius: 6,
  cursor: "pointer",
  background: "#0f172a",
  color: "white",
};

const whatsappButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #16a34a",
  borderRadius: 6,
  cursor: "pointer",
  background: "#16a34a",
  color: "white",
};

const facebookButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #1d4ed8",
  borderRadius: 6,
  cursor: "pointer",
  background: "#1d4ed8",
  color: "white",
};