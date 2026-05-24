"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminBackButton from "@/components/admin/AdminBackButton";
import SourcePreviewCard from "@/components/public/SourcePreviewCard";
import { compareSemantics } from "@/lib/ai/semanticComparison";

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
stanceDirection?: string;
supportMatches?: string[];
opposeMatches?: string[];
stanceConfidence?: number;
hasVideo?: boolean;
transcriptReady?: boolean;
detectedLanguage?: string;
detectedQuote?: string | null;
detectedTimestamp?: string | null;
semanticTopicCluster?: string | null;
semanticIntent?: string;
contradictionCandidate?: {
  isCandidate: boolean;
  candidateStrength: number;
  candidateReason: string;};
  bestOldStatement?: {
  title?: string | null;
  summary?: string | null;
  url?: string | null;
  politician?: string | null;
  topic?: string | null;
} | null;
oldStatementScore?: number;

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
  
  const semanticResult = compareSemantics({
  oldStatement: "",
  newStatement: item.title,
});
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
      old_statement: item.bestOldStatement?.title || "",
          new_statement: item.title,
          old_source: item.bestOldStatement?.url || "",

          new_source: item.url,
      ai_summary: `${item.summary}



Semantic comparison:
- Possible contradiction: ${semanticResult.possibleContradiction ? "yes" : "no"}
- Detected shift: ${semanticResult.detectedShift}
- Similarity score: ${semanticResult.similarityScore}%

AI candidate:
- Candidate: ${item.contradictionCandidate?.isCandidate ? "yes" : "no"}
- Strength: ${item.contradictionCandidate?.candidateStrength ?? 0}%
- Reason: ${
  item.contradictionCandidate?.candidateReason ||
  "No candidate reason"
}`,
review_status: "draft",
confidence_score: item.contradictionCandidate?.candidateStrength ?? 0,
severity_score: semanticResult.similarityScore,
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
          {item.contradictionCandidate && (
  <div className="mt-2 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3">
    <div className="text-xs font-bold text-orange-200">
      AI contradiction candidate
    </div>

    <div className="mt-1 text-xs text-orange-100">
      Candidate strength: {item.contradictionCandidate.candidateStrength}%
    </div>

    <div className="mt-1 text-xs text-orange-200/80">
      {item.contradictionCandidate.candidateReason}
    </div>
  </div>
)}

{item.stanceDirection && (
  <div className="mt-3 text-xs font-bold text-cyan-200">
    Stance direction: {item.stanceDirection}
  </div>
)}

{typeof item.stanceConfidence === "number" && (
  <div className="mt-1 text-xs text-cyan-100/80">
    Stance confidence: {item.stanceConfidence}%
  </div>
)}

{item.supportMatches && item.supportMatches.length > 0 && (
  <div className="mt-2 text-xs text-emerald-200">
    Support signals: {item.supportMatches.join(", ")}
  </div>
)}

{item.opposeMatches && item.opposeMatches.length > 0 && (
  <div className="mt-2 text-xs text-red-200">
    Oppose signals: {item.opposeMatches.join(", ")}
  </div>
)}

{item.contradictionReasons && item.contradictionReasons.length > 0 && (
  <div className="mt-3 space-y-1 text-xs text-yellow-100/80">
    {item.contradictionReasons.map((reason, index) => (
      <div key={index}>• {reason}</div>
    ))}
  </div>
)}

          {item.bestOldStatement && (
            <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
              <div className="text-xs font-bold text-cyan-200">
                Possible old statement match
              </div>

              <div className="mt-2 text-sm text-cyan-100">
                {item.bestOldStatement.title}
              </div>

              {item.bestOldStatement.summary && (
                <div className="mt-1 text-xs text-cyan-100/80">
                  {item.bestOldStatement.summary}
                </div>
              )}

              {typeof item.oldStatementScore === "number" && (
                <div className="mt-2 text-xs text-cyan-200/80">
                  Match score: {item.oldStatementScore}%
                </div>
              )}
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