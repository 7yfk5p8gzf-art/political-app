"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminBackButton from "@/components/admin/AdminBackButton";
import SourcePreviewCard from "@/components/public/SourcePreviewCard";

type SearchResult = {
  title: string;
  url: string;
  summary: string;
  politician?: string;
  topic?: string;
  type: string;
  timestamp?: string | null;
  videoId?: string | null;
  possibleContradictionSearch?: string;
possibleContradictionHint?: string;
contradictionProbability?: number;
contradictionReasons?: string[];
};

export default function AiSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  async function search(searchQuery = query) {
  if (!searchQuery) return;

  setLoading(true);

  const response = await fetch("/api/ai-search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: searchQuery }),
});

  const data = await response.json();

  setResults(data.results || []);
  setLoading(false);
}
async function saveSource(item: SearchResult) {
  const { data, error } = await supabase
    .from("sources")
    .insert({
      title: item.title,
      url: item.url,
      article_url: item.url,
      summary: item.summary,
      ai_summary: item.summary,
      politician: item.politician || null,
      topic: item.topic || null,
      status: "draft",
      source_type: "article",
    })
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  try {
    await fetch("/api/ai/translate-source", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: data.id,
      }),
    });
  } catch (err) {
    console.error("Source translation failed", err);
  }

  alert("Source saved.");
}
async function createContradictionDraft(item: SearchResult) {
  const slug =
    `${item.politician || "unknown"}-${item.topic || "topic"}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const { data, error } = await supabase
    .from("contradictions")
    .insert({
      slug,
      politician: item.politician || null,
      topic: item.topic || null,
      old_statement: "",
      new_statement: item.title,
      old_source: "",
      new_source: item.url,
      ai_summary: item.summary,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }
  try {
  await fetch("/api/ai/translate-contradiction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: data.id,
    }),
  });
} catch (err) {
  console.error("Contradiction translation failed", err);
}

  alert("Contradiction draft created.");
}
return (
  <main className="mx-auto max-w-6xl px-6 py-10">
    <AdminBackButton />

    <p className="mt-6 text-sm uppercase tracking-[0.3em] text-neutral-500">
      Admin AI Search
    </p>

    <h1 className="mt-3 text-4xl font-bold">AI Research Workspace</h1>

    <div className="mt-8 flex gap-4">
      <input
        type="text"
        placeholder="Search politician, topic, contradiction..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none focus:border-white/30"
      />

      <button
        onClick={() => search()}
        disabled={loading}
        className="rounded-2xl bg-white px-6 py-4 font-bold text-black transition hover:opacity-90 disabled:opacity-40"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </div>

    <div className="mt-10 space-y-6">
      {results.map((item, index) => (
        <div key={index}>
          <SourcePreviewCard
  title={item.title}
  summary={item.summary}
  source={item.politician || item.topic || "AI Search"}
  type={item.type === "video" ? "video" : "article"}
  url={item.url}
/>

 {item.possibleContradictionHint && (
  <div className="mt-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
    <div>⚠️ {item.possibleContradictionHint}</div>
    {typeof item.contradictionProbability === "number" && (
  <div className="mt-2 text-xs font-bold text-yellow-100">
    Possible contradiction probability: {item.contradictionProbability}%
  </div>
)}
{item.contradictionReasons &&
  item.contradictionReasons.length > 0 && (
    <div className="mt-3 space-y-1 text-xs text-yellow-100/80">
      {item.contradictionReasons.map((reason, index) => (
        <div key={index}>• {reason}</div>
      ))}
    </div>
)}

    {item.possibleContradictionSearch && (
      <button
        onClick={() => setQuery(item.possibleContradictionSearch || "")}
        className="mt-3 rounded-xl border border-yellow-400/30 px-4 py-2 text-xs font-bold text-yellow-100 hover:bg-yellow-400/10"
      >
        Search Older Statements
      </button>
    )}
  </div>
)}          

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
              className="mt-4 mb-4 rounded-2xl"
            />
          )}

          <div className="mt-4 flex gap-4">
            <button
              onClick={() => saveSource(item)}
              className="rounded-2xl bg-white px-5 py-3 font-bold text-black"
            >
              Save Source
            </button>

            <button
  onClick={() => createContradictionDraft(item)}
  className="rounded-2xl border border-white/20 px-5 py-3 font-bold"
>
  Create Contradiction Draft
</button>
          </div>
        </div>
      ))}
    </div>
  </main>
);
  
}