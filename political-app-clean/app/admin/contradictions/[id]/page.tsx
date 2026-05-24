"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createSlug } from "@/lib/slug";

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
  timeline_hint: string | null;
  confidence_score?: number | null;
severity_score?: number | null;
review_status?: string | null;

transcript_quote?: string | null;
timestamp?: string | null;
quote_precision?: string | null;
old_transcript_quote?: string | null;
old_timestamp?: string | null;
old_quote_precision?: string | null;

new_transcript_quote?: string | null;
new_timestamp?: string | null;
new_quote_precision?: string | null;
evidence_summary?: string | null;
video_context?: any | null;
};
type RelatedContradiction = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  contradiction_strength: string | null;
  status: string | null;
};

export default function EditContradictionPage() {
  const params = useParams();
  const id = String(params.id);

  const [item, setItem] = useState<Contradiction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [relatedItems, setRelatedItems] = useState<RelatedContradiction[]>([]);

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
  await loadRelatedItems(data);
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
        evidence_summary: item.evidence_summary,
        contradiction_strength: item.contradiction_strength,
        timeline_hint: item.timeline_hint,
        confidence_score: item.confidence_score,
severity_score: item.severity_score,
review_status: item.review_status,
old_transcript_quote: item.old_transcript_quote,
old_timestamp: item.old_timestamp,
old_quote_precision: item.old_quote_precision,

new_transcript_quote: item.new_transcript_quote,
new_timestamp: item.new_timestamp,
new_quote_precision: item.new_quote_precision,


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

  const slug = createSlug([
  item.politician,
  item.topic,
]);

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
  evidence_summary: data.evidence_summary || "",
  contradiction_strength: data.strength || "weak",
  timeline_hint: data.timeline_hint || "",
  confidence_score: data.confidence_score || 0,
  video_context: data.video_context || null,
severity_score: data.severity_score || 0,
review_status: data.review_status || "approved",
old_transcript_quote: data.old_transcript_quote || "",
old_timestamp: data.old_timestamp || "",
old_quote_precision: data.old_quote_precision || "medium",

new_transcript_quote: data.new_transcript_quote || "",
new_timestamp: data.new_timestamp || "",
new_quote_precision: data.new_quote_precision || "medium",


});
  } catch (error) {
    console.error(error);
    alert("AI analysis failed");
  }
}
async function loadRelatedItems(current: Contradiction) {
  const { data, error } = await supabase
    .from("contradictions")
    .select("id, slug, politician, topic, contradiction_strength, status")
    .neq("id", current.id)
    .is("deleted_at", null)
    .or(
      `politician.eq.${current.politician || ""},topic.eq.${
        current.topic || ""
      }`
    )
    .limit(5);

  if (error) {
    console.error(error);
    setRelatedItems([]);
    return;
  }

  setRelatedItems(data || []);
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
<div className="grid gap-4 md:grid-cols-2">
  <textarea
    value={item.old_transcript_quote || ""}
    onChange={(e) =>
      setItem({
        ...item,
        old_transcript_quote: e.target.value,
      })
    }
    placeholder="Old transcript quote"
    rows={4}
    className="w-full rounded-2xl border border-blue-500/30 bg-black px-5 py-4 text-white outline-none"
  />

  <textarea
    value={item.new_transcript_quote || ""}
    onChange={(e) =>
      setItem({
        ...item,
        new_transcript_quote: e.target.value,
      })
    }
    placeholder="New transcript quote"
    rows={4}
    className="w-full rounded-2xl border border-red-500/30 bg-black px-5 py-4 text-white outline-none"
  />
</div>

<div className="mt-4 grid gap-4 md:grid-cols-2">
  <input
    value={item.old_timestamp || ""}
    onChange={(e) =>
      setItem({
        ...item,
        old_timestamp: e.target.value,
      })
    }
    placeholder="Old timestamp (00:00)"
    className="w-full rounded-2xl border border-blue-500/30 bg-black px-5 py-4 text-white outline-none"
  />

  <input
    value={item.new_timestamp || ""}
    onChange={(e) =>
      setItem({
        ...item,
        new_timestamp: e.target.value,
      })
    }
    placeholder="New timestamp (00:00)"
    className="w-full rounded-2xl border border-red-500/30 bg-black px-5 py-4 text-white outline-none"
  />
</div>

<input
  value={item.timeline_hint || ""}
  onChange={(e) =>
    setItem({
      ...item,
      timeline_hint: e.target.value,
    })
  }
  placeholder="Timeline hint"
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
          {relatedItems.length > 0 && (
  <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.06] p-6">
    <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
      Related contradictions
    </p>

    <div className="space-y-3">
      {relatedItems.map((related) => (
        <a
          key={related.id}
          href={`/admin/contradictions/${related.id}`}
          className="block rounded-2xl border border-white/10 bg-black/40 p-4 hover:bg-white/10"
        >
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase">
              {related.status || "draft"}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase">
              {related.contradiction_strength || "weak"}
            </span>
          </div>

          <p className="font-semibold">
            {related.slug || "Untitled contradiction"}
          </p>

          <p className="mt-1 text-sm text-neutral-400">
            {related.politician || "Unknown"} · {related.topic || "No topic"}
          </p>
        </a>
      ))}
    </div>
  </section>
)}
        </div>
      </div>
    </main>
  );
}