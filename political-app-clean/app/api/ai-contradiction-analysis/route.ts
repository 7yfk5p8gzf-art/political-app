import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { old_statement, new_statement, politician, topic } =
      await req.json();

    if (!old_statement || !new_statement) {
      return NextResponse.json(
        { error: "Missing statements" },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.3-chat-latest",
        input: [
          {
  role: "system",
  content: `Te politikai ellentmondásokat elemzel.

Válaszolj JSON formátumban:

{
  "analysis": "...",
  "evidence_summary": "...",

  "confidence_score": 0,
  "severity_score": 0,
  "review_status": "approved",
  "strength": "medium",
  "timeline_hint": "...",
  "transcript_quote": "...",
  "timestamp": "00:00",
  "quote_precision": "medium"
}

A strength csak ez lehet:
- weak
- medium
- strong

Az analysis rövid, semleges szerkesztői elemzés legyen magyarul.
A timeline_hint rövid idővonal összefoglaló legyen.
Ne találj ki tényeket.
Az evidence_summary rövid, ütős összefoglaló legyen arról,
mi változott a politikus álláspontjában és miért fontos ez.

Ha van videós vagy beszéd jellegű állítás,
adj vissza egy rövid transcript_quote mezőt
és hozzá egy timestampet MM:SS formátumban.

A quote_precision csak ez lehet:
- low
- medium
- high
`,
},
          {
            role: "user",
            content: `
Politikus: ${politician || "unknown"}
Téma: ${topic || "unknown"}

Régi állítás:
${old_statement}

Új állítás:
${new_statement}

Írj rövid elemzést és strength értéket.
`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();

      console.error("OpenAI error:", errorText);

      return NextResponse.json(
        { error: "AI request failed" },
        { status: 500 }
      );
    }

    const data = await res.json();

    const raw =
      data.output_text ||
      data.output
        ?.flatMap((item: any) => item.content || [])
        ?.map((content: any) => {
          if (typeof content === "string") return content;

          return content.text || content.value || "";
        })
        ?.join("\n")
        ?.trim() ||
      "";

    let analysis = "Nem sikerült AI elemzést készíteni.";
    let strength = "weak";
    let timeline_hint = "";
    let confidence_score = 0;
let severity_score = 0;
let review_status = "approved";
let old_transcript_quote = "";
let old_timestamp = "";
let old_quote_precision = "medium";

let new_transcript_quote = "";
let new_timestamp = "";
let new_quote_precision = "medium";
let evidence_summary = "";

    try {
      const parsed = JSON.parse(raw);

      analysis = parsed.analysis || analysis;
      evidence_summary =
  parsed.evidence_summary || evidence_summary;
      strength = parsed.strength || strength;
      timeline_hint =
  parsed.timeline_hint || timeline_hint;
  old_transcript_quote =
  parsed.old_transcript_quote || old_transcript_quote;

old_timestamp =
  parsed.old_timestamp || old_timestamp;

old_quote_precision =
  parsed.old_quote_precision || old_quote_precision;

new_transcript_quote =
  parsed.new_transcript_quote || new_transcript_quote;

new_timestamp =
  parsed.new_timestamp || new_timestamp;

new_quote_precision =
  parsed.new_quote_precision || new_quote_precision;
  confidence_score =
  parsed.confidence_score || confidence_score;

severity_score =
  parsed.severity_score || severity_score;

review_status =
  parsed.review_status || review_status;
    } catch {
      analysis = raw || analysis;
    }

    return NextResponse.json({
  analysis,
  strength,
  timeline_hint,

  confidence_score,
  severity_score,
  review_status,

  old_transcript_quote,
  old_timestamp,
  old_quote_precision,

  new_transcript_quote,
  new_timestamp,
  new_quote_precision,
  evidence_summary,
});
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}