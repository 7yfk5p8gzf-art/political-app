"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminBackButton from "@/components/admin/AdminBackButton";
import SourcePreviewCard from "@/components/public/SourcePreviewCard";
import { compareSemantics } from "@/lib/ai/semanticComparison";
import { analyzeTimelineReasoning } from "@/lib/ai/timelineReasoning";

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
overallRankScore?: number;
rankLabel?: string;
rankReason?: string;
sourcePerspective?: "opposition" | "conservative" | "pro-government" | "neutral" | "international" | "unknown";
sourceDomain?: string;
sourceLanguage?: string;
contradictionCandidate?: {
  isCandidate: boolean;
  candidateStrength: number;
  candidateReason: string;};
  bestOldStatement?: {
  title?: string | null;
  summary?: string | null;
  url?: string | null;
  politician?: string | null;
 
  
} | null;
oldStatementScore?: number;
timelineResult?: {
  yearsBetween: number | null;
  timelineStrength: number;
  timelineCategory: "recent" | "medium" | "long" | "unknown";
  reasoning: string;
};

politicalEvolution?: {
  evolutionType:
    | "strategic_shift"
    | "ideological_shift"
    | "crisis_reaction"
    | "rhetoric_escalation"
    | "unclear";
  evolutionStrength: number;
  explanation: string;
};
dateSignals?: {
  detectedYear: number | null;
  detectedDate: string | null;
  dateConfidence: number;
  dateReason: string;
};

};




export default function AiSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const diversityStats = useMemo(() => {
  return {
    opposition: results.filter(
      (x) => x.sourcePerspective === "opposition"
    ).length,

    proGovernment: results.filter(
      (x) => x.sourcePerspective === "pro-government"
    ).length,

    international: results.filter(
      (x) => x.sourcePerspective === "international"
    ).length,

    neutral: results.filter(
      (x) => x.sourcePerspective === "neutral"
    ).length,

    languages: [
      ...new Set(
        results.map((x) => x.sourceLanguage).filter(Boolean)
      ),
    ],

    domains: [
      ...new Set(
        results.map((x) => x.sourceDomain).filter(Boolean)
      ),
    ],
  };
}, [results]);

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

  const sortedResults = [...(data.results || [])].sort(
  (a: SearchResult, b: SearchResult) =>
    (b.overallRankScore || 0) - (a.overallRankScore || 0)
);
    
  

setResults(sortedResults);
console.log("AI diversity check:", sortedResults);
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
const timelineResult = analyzeTimelineReasoning({
  oldDate: null,
  newDate: null,
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
  "No candidate reason"}

Timeline reasoning:
- Category: ${timelineResult.timelineCategory}
- Strength: ${timelineResult.timelineStrength}%
- Years between: ${timelineResult.yearsBetween ?? "unknown"}
- Reasoning: ${timelineResult.reasoning}

Date detection:
- Detected year: ${item.dateSignals?.detectedYear ?? "unknown"}
- Detected date: ${item.dateSignals?.detectedDate ?? "unknown"}
- Date confidence: ${item.dateSignals?.dateConfidence ?? 0}%
- Date reason: ${item.dateSignals?.dateReason || "No date reason"}`,
review_status: "draft",
confidence_score: item.contradictionCandidate?.candidateStrength ?? 0,
severity_score:
  semanticResult.similarityScore +
  timelineResult.timelineStrength,
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


function getRankStyle(label?: string) {
  if (label === "critical") {
    return {
      box: "border-red-500/40 bg-red-500/10",
      text: "text-red-100",
      badge: "bg-red-500/20 text-red-100",
      title: "text-red-200",
    };
  }

  if (label === "high") {
    return {
      box: "border-orange-500/40 bg-orange-500/10",
      text: "text-orange-100",
      badge: "bg-orange-500/20 text-orange-100",
      title: "text-orange-200",
    };
  }

  if (label === "medium") {
    return {
      box: "border-yellow-500/40 bg-yellow-500/10",
      text: "text-yellow-100",
      badge: "bg-yellow-500/20 text-yellow-100",
      title: "text-yellow-200",
    };
  }

  return {
    box: "border-slate-500/30 bg-slate-500/10",
    text: "text-slate-100",
    badge: "bg-slate-500/20 text-slate-100",
    title: "text-slate-200",
  };
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
    {results.length > 0 && (
  <div className="mb-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
    <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">
      Research diversity
    </div>

    <div className="mt-3 text-2xl font-bold text-white">
      {diversityStats.domains.length} unique domains
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <div className="rounded-xl bg-black/20 p-3">
        <div className="text-xs text-cyan-200">Opposition</div>
        <div className="text-xl font-bold">
          {diversityStats.opposition}
        </div>
      </div>

      <div className="rounded-xl bg-black/20 p-3">
        <div className="text-xs text-cyan-200">
          Pro-government
        </div>
        <div className="text-xl font-bold">
          {diversityStats.proGovernment}
        </div>
      </div>

      <div className="rounded-xl bg-black/20 p-3">
        <div className="text-xs text-cyan-200">
          International
        </div>
        <div className="text-xl font-bold">
          {diversityStats.international}
        </div>
      </div>

      <div className="rounded-xl bg-black/20 p-3">
        <div className="text-xs text-cyan-200">Neutral</div>
        <div className="text-xl font-bold">
          {diversityStats.neutral}
        </div>
      </div>
    </div>

    <div className="mt-4 text-sm text-cyan-100">
      Languages: {diversityStats.languages.join(", ")}
    </div>
  </div>
)}

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
          {typeof item.overallRankScore === "number" && (
    <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
    <div className="flex items-center justify-between">
      <div className="text-sm font-bold text-red-200">
        Overall AI contradiction score
      </div>

      <div className="rounded-full bg-red-500/20 px-3 py-1 text-sm font-bold text-red-100">
        {item.overallRankScore}%
      </div>
    </div>

    <div className="mt-2 text-xs uppercase tracking-wide text-red-300">
      {item.rankLabel}
    </div>

    <div className="mt-2 text-sm text-red-100">
      {item.rankReason}
    </div>
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
{item.dateSignals && (
  <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
    <div className="text-xs font-bold text-sky-200">
      Date detection
    </div>

    <div className="mt-1 text-xs text-sky-100">
      Detected year:{" "}
      {item.dateSignals.detectedYear ?? "unknown"}
    </div>

    <div className="mt-1 text-xs text-sky-100">
      Confidence: {item.dateSignals.dateConfidence}%
    </div>

    <div className="mt-2 text-xs text-sky-200/80">
      {item.dateSignals.dateReason}
    </div>
  </div>
)}
{item.timelineResult && (
  <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
    <div className="text-xs font-bold text-violet-200">
      Timeline reasoning
    </div>

    <div className="mt-1 text-xs text-violet-100">
      Category: {item.timelineResult.timelineCategory}
    </div>

    <div className="mt-1 text-xs text-violet-100">
      Timeline strength: {item.timelineResult.timelineStrength}%
    </div>

    <div className="mt-1 text-xs text-violet-100">
      Years between:{" "}
      {item.timelineResult.yearsBetween ?? "unknown"}
    </div>

    <div className="mt-2 text-xs text-violet-200/80">
      {item.timelineResult.reasoning}
    </div>
  </div>
)}
{item.politicalEvolution && (
  <div className="mt-3 rounded-xl border border-pink-500/20 bg-pink-500/10 p-3">
    <div className="text-xs font-bold text-pink-200">
      Political evolution
    </div>

    <div className="mt-1 text-xs text-pink-100">
      Type: {item.politicalEvolution.evolutionType}
    </div>

    <div className="mt-1 text-xs text-pink-100">
      Strength: {item.politicalEvolution.evolutionStrength}%
    </div>

    <div className="mt-2 text-xs text-pink-200/80">
      {item.politicalEvolution.explanation}
    </div>
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