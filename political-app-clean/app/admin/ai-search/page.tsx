"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminBackButton from "@/components/admin/AdminBackButton";
import SourcePreviewCard from "@/components/public/SourcePreviewCard";
import { compareSemantics } from "@/lib/ai/semanticComparison";
import { analyzeTimelineReasoning } from "@/lib/ai/timelineReasoning";
function cleanText(text?: string | null) {
  if (!text) return "";

  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .trim();
}

type SearchResult = {
  title: string;
  url: string;
  summary: string;
  sources?: SearchResult[];
  oldStatement?: string;
newStatement?: string;
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
  old_date?: string | null;
new_date?: string | null;
publishedAt?: string | null;
published_at?: string | null;
source_date?: string | null;
created_at?: string | null;
 
  
} | null;
oldStatementScore?: number;
oldStatementTopMatches?: {
  match: {
    title?: string | null;
    summary?: string | null;
    url?: string | null;
    politician?: string | null;
    topic?: string | null;
    source_date?: string | null;
    created_at?: string | null;
  };
  score: number;
}[];
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

type CandidateAnalysis = {
  analysis: string;
  evidence_summary: string;
  strength: "weak" | "medium" | "strong";
  timeline_hint: string;
  confidence_score: number;
  severity_score: number;
  review_status: string;
};



export default function AiSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedSources, setSelectedSources] = useState<SearchResult[]>([]);
const [candidateResults, setCandidateResults] = useState<SearchResult[]>([]);
const [analyzingSelected, setAnalyzingSelected] = useState(false);
const [candidateAnalyses, setCandidateAnalyses] = useState<
  Record<string, CandidateAnalysis>
>({});
  function getPerspectiveFromUrl(url?: string) {
  const u = url || "";

  if (u.includes("telex") || u.includes("444") || u.includes("hvg")) {
    return "opposition";
  }

  if (
    u.includes("mandiner") ||
    u.includes("magyarnemzet") ||
    u.includes("origo")
  ) {
    return "pro-government";
  }

  if (u.includes("reuters") || u.includes("apnews")) {
    return "international";
  }

  return "neutral";
}
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

  if (!response.ok) {
  const errorText = await response.text();
  console.error("AI SEARCH API ERROR:", response.status, errorText);
  throw new Error(errorText);
}

const data = await response.json();
console.log("FRONTEND DATA:", data);
console.log("FRONTEND VIDEOS:", data.videos);
console.log("FRONTEND RESULTS:", data.results);

  const sortedResults = [...(data.results || [])].sort(
  (a: SearchResult, b: SearchResult) =>
    (b.overallRankScore || 0) - (a.overallRankScore || 0)
);
console.log("FRONTEND RESULTS:", sortedResults);
    
  

setResults(sortedResults);
console.log("AI diversity check:", sortedResults);
  setLoading(false);
}
function toggleSelectedSource(item: SearchResult) {
  setSelectedSources((prev) => {
    const exists = prev.some((x) => x.url === item.url);

    if (exists) {
      return prev.filter((x) => x.url !== item.url);
    }

    return [...prev, item];
  });
}

async function analyzeSelectedSources() {
  const candidates = selectedSources
  .filter((x) => x.contradictionCandidate?.isCandidate)
  .sort(
    (a, b) =>
      (b.contradictionCandidate?.candidateStrength || 0) -
      (a.contradictionCandidate?.candidateStrength || 0)
  );

  setAnalyzingSelected(true);
  const finderResponse = await fetch("/api/admin/ai-contradiction-finder", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    selectedSources,
    politician: selectedSources[0]?.politician || "",
    topic: selectedSources[0]?.topic || "",
  }),
});

const finderData = await finderResponse.json();
console.log("FINDER DATA:", finderData);

if (finderData?.candidates) {
  setCandidateResults(finderData.candidates);
}

  const candidatesForAnalysis = finderData?.candidates?.length
  ? finderData.candidates
  : candidates;
  console.log("CANDIDATES FOR ANALYSIS:", candidatesForAnalysis);

const analysisEntries = await Promise.all(
  candidatesForAnalysis.map(async (item: SearchResult) => {
      try {
        const response = await fetch("/api/ai-contradiction-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  politician: item.politician,
  topic: item.topic,
  old_statement:
    item.oldStatement ||
    `${item.bestOldStatement?.title || ""}

${item.bestOldStatement?.summary || ""}`,
  new_statement:
    item.newStatement ||
    `${item.title}

${item.summary || ""}`,
}),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();

        return [item.url, data] as const;
      } catch (err) {
        console.error("AI contradiction analysis failed:", err);

        return [
          item.url,
          {
            analysis: "AI analysis failed.",
            evidence_summary: "",
            strength: "weak",
            timeline_hint: "",
            confidence_score: 0,
            severity_score: 0,
            review_status: "draft",
          },
        ] as const;
      }
    })
  );

  setCandidateAnalyses(Object.fromEntries(analysisEntries));
  setAnalyzingSelected(false);
}
async function saveSource(item: SearchResult) {
  const { data, error } = await supabase
    .from("sources")
    .insert({
  title: item.title,

  url: item.url,

  article_url:
    item.type === "article"
      ? item.url
      : null,

  video_url:
    item.type === "video"
      ? item.url
      : null,

  summary: item.summary,
  ai_summary: item.summary,

  politician: item.politician || null,
  topic: item.topic || null,

  status: "draft",

  source_type:
    item.type === "video"
      ? "video"
      : "article",

  video_id: item.videoId || null,

  timestamp: item.timestamp || null,

  language:
    item.sourceLanguage || "unknown",
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
      old_statement: cleanText(
  item.oldStatement ||
  item.bestOldStatement?.title ||
  ""
),

new_statement: cleanText(
  item.newStatement ||
  item.title ||
  ""
),

old_source:
  item.sources?.[0]?.url ||
  item.bestOldStatement?.url ||
  "",
  
  

new_source:
  item.sources?.[1]?.url ||
  item.url ||
  "",
  new_date: null,
  
      ai_summary: `${
  candidateAnalyses[item.url]?.analysis ||
  item.summary ||
  item.oldStatement ||
  ""
}



Semantic comparison:
- Possible contradiction: ${semanticResult.possibleContradiction ? "yes" : "no"}
- Detected shift: ${semanticResult.detectedShift || "neutral"}
- Similarity score: ${semanticResult.similarityScore ?? 0}

AI candidate:
- Candidate: ${item.contradictionCandidate?.isCandidate ? "yes" : "no"}
- Strength: ${item.contradictionCandidate?.candidateStrength ?? 0}%
- Reason: ${
  item.contradictionCandidate?.candidateReason ||
  "No candidate reason"}

Timeline reasoning:
- Category: ${timelineResult.timelineCategory || "unknown"}
- Strength: ${timelineResult.timelineStrength ?? 0}
- Years between: ${timelineResult.yearsBetween ?? "unknown"}
- Reasoning: ${timelineResult.reasoning || "No timeline reasoning available"}

Date detection:
- Detected year: ${item.dateSignals?.detectedYear ?? "unknown"}
- Detected date: ${item.dateSignals?.detectedDate ?? "unknown"}
- Date confidence: ${item.dateSignals?.dateConfidence ?? 0}%
- Date reason: ${item.dateSignals?.dateReason || "No date reason"}`,
review_status: "draft",
confidence_score:
  item.overallRankScore ??
  item.contradictionCandidate?.candidateStrength ??
  item.contradictionProbability ??
  0,
severity_score:
  item.contradictionProbability ??
  item.overallRankScore ??
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
        {selectedSources.length > 0 && (
      <div className="mt-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
        <div className="text-sm font-bold text-orange-200">
          Selected sources: {selectedSources.length}
        </div>

        <button
          onClick={analyzeSelectedSources}
          disabled={analyzingSelected}
          className="mt-4 rounded-2xl bg-orange-500 px-6 py-3 font-bold text-black"
        >
          {analyzingSelected ? "Analyzing..." : "Analyze Selected Sources"}
        </button>
        {analyzingSelected && (
  <div className="mt-3 text-sm text-yellow-300">
    AI Contradiction Finder is analyzing sources...
  </div>
)}
      </div>
    )}
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
    {candidateResults.length > 0 && (
      <div className="mt-10 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
        <div className="text-sm uppercase tracking-[0.3em] text-orange-300">
          AI Contradiction Candidates
        </div>

        <div className="mt-3 text-2xl font-bold text-white">
          {candidateResults.length} candidate found
        </div>

        <div className="mt-6 space-y-4">
          {candidateResults.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-black/30 p-5"
            >
              <div className="text-sm font-bold text-orange-200">
                Candidate strength:{" "}
                {item.contradictionCandidate?.candidateStrength ?? 0}%
              </div>

              <h3 className="mt-3 text-xl font-bold text-white">
                {item.title}
              </h3>

              {item.bestOldStatement?.title && (
                <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <div className="text-xs font-bold text-cyan-200">
                    Old statement
                  </div>

                  <div className="mt-2 text-sm text-cyan-100">
                    {item.bestOldStatement.title}
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
                <div className="text-xs font-bold text-orange-200">
                  Candidate reason
                </div>

                <div className="mt-2 text-sm text-orange-100">
                  {item.contradictionCandidate?.candidateReason}
                </div>
              </div>

              <button
                onClick={() => createContradictionDraft(item)}
                className="mt-5 rounded-2xl bg-white px-5 py-3 font-bold text-black"
              >
                <div className="mb-4 rounded-xl bg-black/20 p-4">
  <div className="mb-2 text-xs font-bold uppercase text-orange-300">
    OLD STATEMENT
  </div>

  <div className="text-sm text-white">
    {item.oldStatement ||
      item.bestOldStatement?.summary ||
      item.bestOldStatement?.title ||
      "No old statement available"}
  </div>
</div>

<div className="mb-4 rounded-xl bg-black/20 p-4">
  <div className="mb-2 text-xs font-bold uppercase text-cyan-300">
    NEW STATEMENT
  </div>

  <div className="text-sm text-white">
    {item.newStatement ||
      item.summary ||
      item.title ||
      "No new statement available"}
  </div>
</div>
                {candidateAnalyses[item.url] && (
  <div >
    <div className="text-xs font-bold text-black">
      AI Analysis
    </div>

    <div className="mt-2 text-sm text-black">
  {candidateAnalyses[item.url].analysis}
</div>

    {candidateAnalyses[item.url].evidence_summary && (
      <div className="mt-3 text-sm text-black">
        {candidateAnalyses[item.url].evidence_summary}
      </div>
    )}

    <div className="mt-3 flex flex-wrap gap-2 text-xs">
      <span className="text-neutral-800">
  Strength: {candidateAnalyses[item.url].strength}
</span>

      <span className="rounded-full bg-white/10 px-3 py-1 text-white">
        Confidence: {candidateAnalyses[item.url].confidence_score}%
      </span>

      <span className="rounded-full bg-white/10 px-3 py-1 text-white">
        Severity: {candidateAnalyses[item.url].severity_score}%
      </span>
    </div>

    {candidateAnalyses[item.url].timeline_hint && (
      <div className="mt-3 text-xs text-black">
        {candidateAnalyses[item.url].timeline_hint}
      </div>
    )}
  </div>
)}
                Create Draft
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="mt-10 space-y-6">
  {results.map((item, index) => (
    <div key={index}>
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <input
          type="checkbox"
          checked={selectedSources.some((x) => x.url === item.url)}
          onChange={() => toggleSelectedSource(item)}
          className="h-5 w-5"
        />

        <div className="text-sm text-neutral-300">
          Select for contradiction analysis
        </div>

        {item.contradictionCandidate?.isCandidate && (
          <div className="ml-auto rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-200">
            Candidate {item.contradictionCandidate.candidateStrength}%
          </div>
        )}
      </div>

      <SourcePreviewCard
        title={item.title}
        summary={item.summary}
        source={item.politician || item.topic || "AI Search"}
        type={item.type === "video" ? "video" : "article"}
        url={item.url}
      />
      



{item.sourcePerspective && (
          <div className="mt-3 flex flex-wrap gap-2">
    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-200">
      {getPerspectiveFromUrl(item.url)}
    </span>

    {item.sourceDomain && (
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
        {item.sourceDomain}
      </span>
    )}

    {item.sourceLanguage && (
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
        {item.sourceLanguage}
      </span>
    )}
  </div>
)}

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
              {item.oldStatementTopMatches &&
  item.oldStatementTopMatches.length > 0 && (
    <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
      <div className="text-xs font-bold text-sky-200">
        Top old statement candidates
      </div>

      <div className="mt-3 space-y-3">
        {item.oldStatementTopMatches.map((candidate, index) => (
          <div
            key={index}
            className="rounded-lg border border-white/10 bg-black/20 p-3"
          >
            <div className="text-xs font-bold text-sky-100">
              #{index + 1} · Score: {candidate.score}%
            </div>

            <div className="mt-2 text-sm text-white">
              {candidate.match.title}
            </div>

            {candidate.match.summary && (
              <div className="mt-1 text-xs text-neutral-300">
                {candidate.match.summary}
              </div>
            )}

            {(candidate.match.source_date ||
              candidate.match.created_at) && (
              <div className="mt-2 text-xs text-sky-200/80">
                Date:{" "}
                {candidate.match.source_date ||
                  candidate.match.created_at}
              </div>
            )}
          </div>
        ))}
      </div>
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