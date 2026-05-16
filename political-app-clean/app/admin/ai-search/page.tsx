"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type SearchResult = {
  title: string;
  url: string;
  summary: string;
  politician?: string;
  topic?: string;
  type: string;
  timestamp?: string | null;
  videoId?: string | null;
};

export default function AiSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  async function search() {
  if (!query) return;

  setLoading(true);

  const response = await fetch("/api/ai-search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  setResults(data.results || []);
  setLoading(false);
}
async function saveSource(item: SearchResult) {
  const { error } = await supabase.from("sources").insert({
    title: item.title,
    url: item.url,
    article_url: item.url,
    summary: item.summary,
    ai_summary: item.summary,
    politician: item.politician || null,
    topic: item.topic || null,
    status: "draft",
    source_type: "article",
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Source saved.");
}

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
        Admin AI Search
      </p>

      <h1 className="mt-3 text-4xl font-bold">
        <a
  href="/admin"
  className="mt-5 inline-block rounded-full bg-white/10 px-4 py-2 text-sm text-white"
>
  ← Back to Admin Dashboard
</a>
        AI Research Workspace
      </h1>

      <div className="mt-8 flex gap-4">
        <input
          type="text"
          placeholder="Search politician, topic, contradiction..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none focus:border-white/30"
        />

        <button
          onClick={search}
          disabled={loading}
          className="rounded-2xl bg-white px-6 py-4 font-bold text-black transition hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="mt-10 space-y-6">
        {results.map((item, index) => (
          <article
            key={index}
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            <div className="mb-4 flex gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-neutral-300">
                {item.politician || "Unknown"}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-neutral-300">
                {item.topic || "No topic"}
              </span>
            </div>

            <h2 className="text-2xl font-bold">
              {item.title}
            </h2>

            <p className="mt-4 text-neutral-300">
              {item.summary}
            </p>
            {item.timestamp && (
  <div className="mt-3 inline-block rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-300">
    ⏱ Suggested timestamp: {item.timestamp}
  </div>
)}
            {item.type === "video" && (
  <iframe
    width="100%"
    height="315"
    src={`https://www.youtube.com/embed/${
      item.url.includes("v=")
        ? item.url.split("v=")[1].split("&")[0]
        : item.url.split("/").pop()
    }`}
    title={item.title}
    frameBorder="0"
    allowFullScreen
    className="rounded-2xl mb-4"
  />
)}

            <a
              href={item.url}
              target="_blank"
              className="mt-6 inline-block text-sm text-blue-400 underline"
            >
              Open source
            </a>

            <div className="mt-8 flex gap-4">
              <button
  onClick={() => saveSource(item)}
  className="rounded-2xl bg-white px-5 py-3 font-bold text-black"
>
  Save Source
</button>

              <button className="rounded-2xl border border-white/20 px-5 py-3 font-bold">
                Create Contradiction Draft
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}