import { NextResponse } from "next/server";
import { buildContradictionCandidate } from "@/lib/ai/contradictionCandidate";
import { analyzeStance } from "@/lib/ai/stanceAnalysis";
import { compareSemantics } from "@/lib/ai/semanticComparison";

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

    const candidates: any[] = [];

for (let i = 0; i < selectedSources.length; i++) {
  for (let j = i + 1; j < selectedSources.length; j++) {
    const oldSource = selectedSources[i];
    const newSource = selectedSources[j];

    const semanticResult = compareSemantics({
      oldStatement:
        oldSource.summary ||
        oldSource.snippet ||
        oldSource.title,

      newStatement:
        newSource.summary ||
        newSource.snippet ||
        newSource.title,
    });

    // TEMP TEST
if (
  !semanticResult.possibleContradiction &&
  semanticResult.similarityScore < 80
) {
  candidates.push({
    id: `test-${i}-${j}`,
    politician:
      politician ||
      oldSource.politician ||
      newSource.politician ||
      "",

    topic:
      topic ||
      oldSource.topic ||
      newSource.topic ||
      "",

    oldStatement:
      oldSource.summary ||
      oldSource.title ||
      "",

    newStatement:
      newSource.summary ||
      newSource.title ||
      "",

    confidence: 50,

    contradictionCandidate: {
      isCandidate: false,
      candidateStrength: 50,
      candidateReason: "Manual review candidate",
    },

    explanation: "Manual review candidate",
    severity: "low",
    sources: [oldSource, newSource],
    status: "candidate",
  });

  continue;
}

    candidates.push({
      id: `candidate-${i}-${j}`,

      politician:
        politician ||
        oldSource.politician ||
        newSource.politician ||
        "",

      topic:
        topic ||
        oldSource.topic ||
        newSource.topic ||
        "",

      oldStatement:
        oldSource.summary ||
        oldSource.snippet ||
        oldSource.title ||
        "",

      newStatement:
        newSource.summary ||
        newSource.snippet ||
        newSource.title ||
        "",

      confidence: semanticResult.similarityScore,

      contradictionCandidate: {
        isCandidate: true,
        candidateStrength:
          semanticResult.similarityScore,
        candidateReason:
          semanticResult.detectedShift,
      },

      detectedShift:
        semanticResult.detectedShift,

      severity:
        semanticResult.similarityScore >= 80
          ? "high"
          : "medium",

      explanation: `Detected shift: ${semanticResult.detectedShift}`,

      sources: [oldSource, newSource],

      status: "candidate",
    });
  }
}

  
    return NextResponse.json({
      ok: true,
      candidates,
    });
    if (candidates.length === 0) {
  selectedSources?.forEach((source, index) => {
    const stance = analyzeStance({
      title: source.title,
      summary: source.summary || source.snippet,
      url: source.url,
    });

    const fallbackStrength = Math.max(45, stance.stanceConfidence);

    candidates.push({
      id: `fallback-candidate-${index + 1}`,
      politician: politician || source.politician || "",
      topic: topic || source.topic || "",
      oldStatement: source.summary || source.snippet || source.title || "",
      newStatement: "",
      confidence: fallbackStrength,
      contradictionCandidate: {
        isCandidate: false,
        candidateStrength: fallbackStrength,
        candidateReason:
          "No direct OLD vs NEW contradiction pair found. Fallback candidate for manual review.",
      },
      contradictionProbability: stance.stanceConfidence,
      severity: "low",
      explanation:
        "No direct semantic contradiction pair was detected, but this source is kept for manual review.",
      stance,
      sources: [source],
      status: "weak",
    });
  });
}
  } catch (error) {
    console.error("AI contradiction finder error:", error);

    return NextResponse.json(
      { error: "AI contradiction finder failed." },
      { status: 500 }
    );
  }
}