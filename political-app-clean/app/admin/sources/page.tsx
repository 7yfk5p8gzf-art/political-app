"use client";

import { useEffect, useState } from "react";
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
  created_at: string | null;
};

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setSources([]);
    } else {
      setSources(data || []);
    }

    setLoading(false);
  }
  const filteredSources = sources.filter((source) => {
  const text = [
    source.title,
    source.summary,
    source.url,
    source.type,
    source.politician,
    source.topic,
    source.timestamp,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(search.toLowerCase());
});

  return (
    <main className="min-h-screen bg-black px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-neutral-500">
          Admin Sources
        </p>

        <h1 className="text-4xl font-bold">Saved Sources</h1>

        <p className="mt-3 text-neutral-400">
  Elmentett cikkek és videók az AI Search Workspace-ből.
</p>
<input
            
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search sources by title, politician, topic, type..."
  className="mt-8 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
/>

          

        {loading && <p className="mt-10 text-neutral-400">Loading...</p>}

        {!loading && sources.length === 0 && (
          <p className="mt-10 text-neutral-400">Nincs még elmentett source.</p>
        )}

        <div className="mt-10 space-y-6">
          {filteredSources.map((source) => (
            <article
              key={source.id}
              className="rounded-3xl border border-white/10 bg-white/[0.07] p-6"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase">
                  {source.type || "source"}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase">
                  {source.politician || "Unknown"}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase">
                  {source.topic || "No topic"}
                </span>
              </div>

              <h2 className="text-2xl font-bold">
                {source.title || "Untitled source"}
              </h2>

              {source.summary && (
                <p className="mt-4 text-neutral-300">{source.summary}</p>
              )}

              {source.timestamp && (
                <div className="mt-3 inline-block rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-300">
                  ⏱ Timestamp: {source.timestamp}
                </div>
              )}

              {source.video_id && (
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${source.video_id}`}
                  title={source.title || "Video source"}
                  frameBorder="0"
                  allowFullScreen
                  className="mt-5 rounded-2xl"
                />
              )}

              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  className="mt-5 inline-block text-sm text-blue-400 underline"
                >
                  Open source
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}