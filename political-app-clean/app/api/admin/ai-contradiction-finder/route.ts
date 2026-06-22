import { NextResponse } from "next/server";
import { buildContradictionCandidate } from "@/lib/ai/contradictionCandidate";
import { analyzeStance } from "@/lib/ai/stanceAnalysis";

type SelectedSource = {
  title?: string | null;
  url?: string | null;
  snippet?: string | null;
  summary?: string | null;
  sourceType?: string | null;
  publishedAt?: string | null;
  politician?: string | null;
  topic?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const selectedSources = body.selectedSources as SelectedSource[] | undefined;
    const politician = body.politician as string | undefined;
    const topic = body.topic as string | undefined;

    if (!selectedSources || selectedSources.length < 2) {
      return NextResponse.json(
        { error: "At least 2 selected sources are required." },
        { status: 400 }
      );
    }

    const candidates = selectedSources.map((source, index) => {
  const stance = analyzeStance({
    title: source.title,
    summary: source.summary || source.snippet,
    url: source.url,
  });

  const candidateSignal = buildContradictionCandidate({
    semanticIntent: stance.stanceDirection,
    semanticTopicCluster: topic || source.topic || null,
    oldStatementQueries: [
      `${politician || source.politician || ""} ${
        topic || source.topic || ""
      } older statement`,
      `${politician || source.politician || ""} ${
        topic || source.topic || ""
      } previous position`,
    ],
    contradictionProbability: stance.stanceConfidence,
  });

  return {
    id: `candidate-${index + 1}`,
    politician: politician || source.politician || "",
    topic: topic || source.topic || "",
    oldStatement: source.snippet || source.summary || source.title || "",
    newStatement: "",
    confidence: candidateSignal.candidateStrength,
    contradictionCandidate: {
  isCandidate: candidateSignal.isCandidate,
  candidateStrength: candidateSignal.candidateStrength,
  candidateReason: candidateSignal.candidateReason,
},
contradictionProbability: stance.stanceConfidence,
    severity:
      candidateSignal.candidateStrength >= 70
        ? "high"
        : candidateSignal.candidateStrength >= 50
        ? "medium"
        : "low",
    explanation: candidateSignal.candidateReason,
    stance,
    candidateSignal,
    sources: [source],
    status: candidateSignal.isCandidate ? "candidate" : "weak",
    };
});
    return NextResponse.json({
      ok: true,
      candidates,
    });
  } catch (error) {
    console.error("AI contradiction finder error:", error);

    return NextResponse.json(
      { error: "AI contradiction finder failed." },
      { status: 500 }
    );
  }
}