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
  "strength": "weak",
  "timeline_hint": "2017 NATO support → 2026 NATO criticism"
}

A strength csak ez lehet:
- weak
- medium
- strong

Az analysis rövid, semleges szerkesztői elemzés legyen magyarul.
A timeline_hint rövid idővonal összefoglaló legyen.
Ne találj ki tényeket.`,
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

    try {
      const parsed = JSON.parse(raw);

      analysis = parsed.analysis || analysis;
      strength = parsed.strength || strength;
      timeline_hint =
  parsed.timeline_hint || timeline_hint;
    } catch {
      analysis = raw || analysis;
    }

    return NextResponse.json({
      analysis,
      strength,
      timeline_hint,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}