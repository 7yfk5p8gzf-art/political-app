"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Source = {
  id: string;
  title: string;
  url: string | null;
  politician: string | null;
  topic: string | null;
  source_date: string | null;
  language: string | null;
};

type Contradiction = {
  id: string;
  old_source_id: string | null;
  new_source_id: string | null;
  slug: string | null;
  ai_summary: string | null;
  status: string | null;
};

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminContradictionsPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [items, setItems] = useState<Contradiction[]>([]);
  const [oldSource, setOldSource] = useState("");
  const [newSource, setNewSource] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  

const [userEmail, setUserEmail] = useState<string | null>(null);
const [role, setRole] = useState<string>("editor");
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
    
setRole(role);

    if (
  role !== "editor" &&
  role !== "reviewer" &&
  role !== "admin" &&
  role !== "superadmin"
) {
  alert("Nincs jogosultságod ehhez az oldalhoz");
  window.location.href = "/";
  return;
}

    setUserEmail(user.email || null);
    setAuthLoading(false);
    loadSources();
    loadContradictions();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function loadSources() {
    const { data } = await supabase
      .from("sources")
      .select("*")
      .order("created_at", { ascending: false });

    setSources(data || []);
  }

  async function loadContradictions() {
    const { data } = await supabase
      .from("contradictions")
      .select("*")
      .order("id", { ascending: false });

    setItems(data || []);
  }

  function getSource(id: string | null) {
    return sources.find((s) => s.id === id) || null;
  }

  async function create() {
    if (!oldSource || !newSource) {
      alert("Válassz ki 2 source-t");
      return;
    }

    if (oldSource === newSource) {
      alert("A két source nem lehet ugyanaz");
      return;
    }

    const oldS = getSource(oldSource);
    const newS = getSource(newSource);

    const person =
      oldS?.politician?.trim() || newS?.politician?.trim() || "ismeretlen";

    const topic = oldS?.topic?.trim() || newS?.topic?.trim() || "tema";

    const slugBase = makeSlug(
      `${person}-${topic}-${oldS?.source_date || "regen"}-vs-${
        newS?.source_date || "most"
      }`
    );

    const slug = `${slugBase}-${Date.now()}`;

   const { error } = await supabase.from("contradictions").insert([
  {
    old_source_id: oldSource,
    new_source_id: newSource,
    politician: person,
    topic,
    slug,
    language: oldS?.language || newS?.language || "hu",

    old_statement: oldS?.title || null,
    old_date: oldS?.source_date || null,
    old_source: oldS?.url || null,

    new_statement: newS?.title || null,
    new_date: newS?.source_date || null,
    new_source: newS?.url || null,

    ai_summary: "",
    status: "draft",
  },
]);

    if (error) {
      alert("Mentési hiba: " + error.message);
      return;
    }

    setOldSource("");
    setNewSource("");
    await loadContradictions();
    alert("Mentve draftként");
  }

  async function remove(id: string) {
    await supabase.from("contradictions").delete().eq("id", id);
    loadContradictions();
  }

  async function updateStatus(id: string, status: "draft" | "review" | "published") {
    const { error } = await supabase
      .from("contradictions")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Status hiba: " + error.message);
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
      body: JSON.stringify({ prompt }),
    });

    const json = await res.json();

    await supabase
      .from("contradictions")
      .update({ ai_summary: json.text })
      .eq("id", id);

    alert("AI kész");
    loadContradictions();
  }

  if (authLoading) {
    return <div style={{ padding: 32 }}>Betöltés...</div>;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: 20 }}>
        <span>{userEmail}</span>
        <button onClick={logout}>Kijelentkezés</button>
      </div>

      <main style={{ padding: 32 }}>
        <h1>Contradictions Admin</h1>

        <div style={{ marginTop: 20 }}>
          <select value={oldSource} onChange={(e) => setOldSource(e.target.value)}>
            <option value="">OLD source</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <br />
          <br />

          <select value={newSource} onChange={(e) => setNewSource(e.target.value)}>
            <option value="">NEW source</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <br />
          <br />

          <button onClick={create}>Mentés draftként</button>
        </div>

        <h2 style={{ marginTop: 40 }}>Lista</h2>

        {items.map((item) => {
          const oldS = getSource(item.old_source_id);
          const newS = getSource(item.new_source_id);

          return (
            <div
              key={item.id}
              style={{
                marginBottom: 20,
                padding: 16,
                border: "1px solid #ccc",
                borderRadius: 10,
              }}
            >
              <p>
                <strong>OLD:</strong> {oldS?.title}
              </p>
              <p>
                <strong>NEW:</strong> {newS?.title}
              </p>
              <p>
                <strong>Status:</strong> {item.status}
              </p>

              <div style={{ marginTop: 10 }}>
                <a
                  href={`/admin/contradictions/${item.id}/edit`}
                  style={{
                    marginRight: 10,
                    padding: "6px 10px",
                    border: "1px solid black",
                    textDecoration: "none",
                  }}
                >
                  ✏️ Szerkesztés
                </a>

                {item.status === "draft" && (
  <button onClick={() => updateStatus(item.id, "review")} style={{ marginLeft: 10 }}>
    Review-ra küld
  </button>
)}

{(role === "reviewer" || role === "admin" || role === "superadmin") &&
  item.status === "review" && (
    <>
      <button onClick={() => updateStatus(item.id, "draft")} style={{ marginLeft: 10 }}>
        Reject
      </button>

      <button onClick={() => updateStatus(item.id, "draft")} style={{ marginLeft: 10 }}>
        Vissza draft
      </button>
    </>
  )}

{(role === "admin" || role === "superadmin") && item.status === "review" && (
  <button onClick={() => updateStatus(item.id, "published")} style={{ marginLeft: 10 }}>
    Publish
  </button>
)}

{(role === "admin" || role === "superadmin") && item.status === "published" && (
  <button onClick={() => updateStatus(item.id, "review")} style={{ marginLeft: 10 }}>
    Vissza review
  </button>
)}

{(role === "admin" || role === "superadmin") && (
  <button onClick={() => remove(item.id)} style={{ marginLeft: 10 }}>
    Törlés
  </button>
)}

                <button onClick={() => generateAI(item.id)} style={{ marginLeft: 10 }}>
                  🤖 AI
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </>
  );
}