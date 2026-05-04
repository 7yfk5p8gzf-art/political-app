"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  slug: string;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
  old_source: string | null;
  new_source: string | null;
  politician: string | null;
  topic: string | null;
  ai_summary: string | null;
  published_at: string | null;
};

export default function PublicContradictionsPage() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("contradictions")
      .select("*")
      .eq("status", "published")
      .order("id", { ascending: false });

    setItems(data || []);
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 32 }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>
        Politikai ellentmondások
      </h1>

      {items.length === 0 && <p>Nincs még publikált tartalom.</p>}

      <div style={{ display: "grid", gap: 20 }}>
        {items.map((item) => (
          <article
            key={item.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 20,
              background: "white",
            }}
          >
            <h2 style={{ marginBottom: 10 }}>
              {item.politician || "Ismeretlen"} – {item.topic}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div style={{ background: "#eef2ff", padding: 12, borderRadius: 8 }}>
                <strong>RÉGEN</strong>
                <p>{item.old_statement}</p>
                <small>{item.old_date}</small>
                <br />
                {item.old_source && (
                  <a href={item.old_source} target="_blank">
                    Forrás
                  </a>
                )}
              </div>

              <div style={{ background: "#ecfdf5", padding: 12, borderRadius: 8 }}>
                <strong>MOST</strong>
                <p>{item.new_statement}</p>
                <small>{item.new_date}</small>
                <br />
                {item.new_source && (
                  <a href={item.new_source} target="_blank">
                    Forrás
                  </a>
                )}
              </div>
            </div>

            {item.ai_summary && (
              <p
                style={{
                  marginTop: 14,
                  background: "#f8fafc",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                🤖 {item.ai_summary}
              </p>
            )}

            <a
              href={`/contradictions/${item.slug}`}
              style={{ display: "block", marginTop: 10 }}
            >
              <p style={{ fontSize: 12, color: "#64748b" }}>
  Publikálva: {item.published_at ? item.published_at.slice(0, 10) : "-"}
</p>
              Megnyitás →
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}