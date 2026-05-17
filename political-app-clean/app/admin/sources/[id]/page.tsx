"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Source = {
  id: string;
  title: string | null;
  summary: string | null;
  url: string | null;
  type: string | null;
  politician: string | null;
  topic: string | null;
  timestamp: string | null;
  video_id: string | null;
};

export default function EditSourcePage() {
  const params = useParams();
  const id = String(params.id);

  const [source, setSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSource();
  }, [id]);

  async function loadSource() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      setSource(null);
    } else {
      setSource(data);
    }

    setLoading(false);
  }

  async function saveSource() {
    if (!source) return;

    setSaving(true);

    const { error } = await supabase
      .from("sources")
      .update({
        title: source.title,
        summary: source.summary,
        url: source.url,
        type: source.type,
        politician: source.politician,
        topic: source.topic,
        timestamp: source.timestamp,
        video_id: source.video_id,
      })
      .eq("id", source.id);

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

  if (!source) {
    return (
      <main className="min-h-screen bg-black px-6 py-14 text-white">
        Source not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-14 text-white">
      <div className="mx-auto max-w-4xl">
        <a
          href="/admin/sources"
          className="rounded-full bg-white/10 px-4 py-2 text-sm text-white"
        >
          ← Back to sources
        </a>

        <p className="mt-8 mb-3 text-xs uppercase tracking-[0.35em] text-neutral-500">
          Edit Source
        </p>

        <h1 className="text-4xl font-bold">Edit source</h1>

        <div className="mt-10 space-y-5">
          <input
            value={source.title || ""}
            onChange={(e) =>
              setSource({ ...source, title: e.target.value })
            }
            placeholder="Title"
            className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
          />

          <textarea
            value={source.summary || ""}
            onChange={(e) =>
              setSource({ ...source, summary: e.target.value })
            }
            placeholder="Summary"
            rows={6}
            className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
          />

          <input
            value={source.url || ""}
            onChange={(e) =>
              setSource({ ...source, url: e.target.value })
            }
            placeholder="URL"
            className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <input
              value={source.politician || ""}
              onChange={(e) =>
                setSource({ ...source, politician: e.target.value })
              }
              placeholder="Politician"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
            />

            <input
              value={source.topic || ""}
              onChange={(e) =>
                setSource({ ...source, topic: e.target.value })
              }
              placeholder="Topic"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <input
              value={source.type || ""}
              onChange={(e) =>
                setSource({ ...source, type: e.target.value })
              }
              placeholder="Type"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
            />

            <input
              value={source.timestamp || ""}
              onChange={(e) =>
                setSource({ ...source, timestamp: e.target.value })
              }
              placeholder="Timestamp"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
            />

            <input
              value={source.video_id || ""}
              onChange={(e) =>
                setSource({ ...source, video_id: e.target.value })
              }
              placeholder="Video ID"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
            />
          </div>

          {source.video_id && (
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${source.video_id}`}
              title={source.title || "Video source"}
              frameBorder="0"
              allowFullScreen
              className="rounded-2xl"
            />
          )}

          <button
            onClick={saveSource}
            disabled={saving}
            className="rounded-full bg-white px-6 py-3 font-bold text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save source"}
          </button>
        </div>
      </div>
    </main>
  );
}