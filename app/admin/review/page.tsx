"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders } from '@/lib/clientAuth';

type Item = {
  id: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
  status: string | null;
};

export default function AdminReviewPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

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

    if (role !== "reviewer" && role !== "admin" && role !== "superadmin") {
      alert("Nincs jogosultságod a review oldalhoz");
      window.location.href = "/";
      return;
    }

    setAuthLoading(false);
    loadItems();
  }

  async function loadItems() {
    const { data } = await supabase
      .from("contradictions")
      .select("*")
      .eq("status", "review")
      .order("id", { ascending: false });

    setItems(data || []);
  }

  async function updateStatus(id: string, status: "draft" | "published") {
  const updateData: any = { status };

  if (status === "published") {
    updateData.published_at = new Date().toISOString();
  }

  await supabase
    .from("contradictions")
    .update(updateData)
    .eq("id", id);

  loadItems();
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

  await supabase
    .from("contradictions")
    .update({ ai_summary: json.text })
    .eq("id", id);

  alert("AI kész");
  loadItems();
}

  if (authLoading) {
    return <div style={{ padding: 32 }}>Betöltés...</div>;
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Review lista</h1>

      {items.length === 0 && <p>Nincs review-ra váró anyag.</p>}

      <div style={{ display: "grid", gap: 16 }}>
        {items.map((item) => (
          <article
            key={item.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 14,
              padding: 18,
              background: "white",
            }}
          >
            <h2>{item.politician || "Ismeretlen"}</h2>
            <p>{item.topic || "Nincs téma"}</p>

            <p>
              <strong>Régen:</strong> {item.old_statement || "-"}
            </p>

            <p>
              <strong>Most:</strong> {item.new_statement || "-"}
            </p>

            <button onClick={() => updateStatus(item.id, "published")}>
              Publish
            </button>

            <button
              onClick={() => updateStatus(item.id, "draft")}
              style={{ marginLeft: 10 }}
            >
              Vissza draft
            </button>
            <button
  onClick={() => generateAI(item.id)}
  style={{ marginLeft: 10 }}
>
  AI
</button>
          </article>
        ))}
      </div>
    </main>
  );
}
