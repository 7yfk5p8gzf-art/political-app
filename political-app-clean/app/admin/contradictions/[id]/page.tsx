"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Contradiction = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
  status: string | null;
  ai_summary: string | null;
  contradiction_strength: string | null;
};

export default function EditContradictionPage() {
  const params = useParams();
  const id = String(params.id);

  const [item, setItem] = useState<Contradiction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadItem();
  }, []);

  async function loadItem() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contradictions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      setItem(null);
    } else {
      setItem(data);
    }

    setLoading(false);
  }

  async function saveItem() {
    if (!item) return;

    setSaving(true);

    const { error } = await supabase
      .from("contradictions")
      .update({
        slug: item.slug,
        politician: item.politician,
        topic: item.topic,
        old_statement: item.old_statement,
        new_statement: item.new_statement,
        status: item.status,
        ai_summary: item.ai_summary,
        contradiction_strength: item.contradiction_strength,
      })
      .eq("id", item.id);

    setSaving(false);

    if (error) {
      console.error(error);
      alert("Save failed");
      return;
    }

    alert("Saved");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-14 text-white">
        Loading...
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-black px-6 py-14 text-white">
        Contradiction not found.
      </main>
    );
  }
  async function generateSlug() {
  if (!item) return;

  const slug = [
    item.politician,
    item.topic,
  ]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  setItem({
    ...item,
    slug,
  });
}
async function generateAiAnalysis() {
  if (!item) return;

  try {
    const res = await fetch("/api/ai-contradiction-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        politician: item.politician,
        topic: item.topic,
        old_statement: item.old_statement,
        new_statement: item.new_statement,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("AI analysis failed");
      return;
    }

    setItem({
      ...item,
      ai_summary: data.analysis,
    });
  } catch (error) {
    console.error(error);
    alert("AI analysis failed");
  }
}

  return (
    <main className="min-h-screen bg-black px-6 py-14 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-neutral-500">
          Edit Contradiction
        </p>

        <h1 className="text-4xl font-bold">Edit contradiction</h1>
        <a
  href="/admin/contradictions"
  className="mt-5 inline-block rounded-full bg-white/10 px-4 py-2 text-sm text-white"
>
  ← Back to workflow
</a>

        <div className="mt-10 space-y-5">
          <input
            value={item.slug || ""}
            onChange={(e) => setItem({ ...item, slug: e.target.value })}
            placeholder="Slug"
            className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
          />

          <input
            value={item.politician || ""}
            onChange={(e) => setItem({ ...item, politician: e.target.value })}
            placeholder="Politician"
            className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
          />

          <input
            value={item.topic || ""}
            onChange={(e) => setItem({ ...item, topic: e.target.value })}
            placeholder="Topic"
            className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
          />

          <textarea
            value={item.old_statement || ""}
            onChange={(e) =>
              setItem({ ...item, old_statement: e.target.value })
            }
            placeholder="Old statement"
            rows={5}
            className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
          />

          <textarea
            value={item.new_statement || ""}
            onChange={(e) =>
              setItem({ ...item, new_statement: e.target.value })
            }
            placeholder="New statement"
            rows={5}
            className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
          />
          <textarea
  value={item.ai_summary || ""}
  onChange={(e) =>
    setItem({ ...item, ai_summary: e.target.value })
  }
  placeholder="AI analysis"
  rows={6}
  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
/>
<select
  value={item.contradiction_strength || "weak"}
  onChange={(e) =>
    setItem({
      ...item,
      contradiction_strength: e.target.value,
    })
  }
  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
>
  <option value="weak">weak</option>
  <option value="medium">medium</option>
  <option value="strong">strong</option>
</select>

          <select
            value={item.status || "draft"}
            onChange={(e) => setItem({ ...item, status: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
          >
            <option value="draft">draft</option>
            <option value="review">review</option>
            <option value="published">published</option>
          </select>
          <button
  onClick={generateAiAnalysis}
  className="rounded-full bg-purple-500/20 px-6 py-3 font-bold text-purple-200"
>
  Generate AI analysis
</button>
          <button
  onClick={generateSlug}
  className="rounded-full bg-blue-500/20 px-6 py-3 font-bold text-blue-200"
>
  Generate slug
</button>

          <button
            onClick={saveItem}
            disabled={saving}
            className="rounded-full bg-white px-6 py-3 font-bold text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </main>
  );
}