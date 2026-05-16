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
            content:
              "Te politikai ellentmondásokat elemzel. Rövid, semleges, admin szerkesztői elemzést írj magyarul. Ne találj ki tényeket.",
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

Írj 3-5 mondatos elemzést arról, hogy van-e lehetséges ellentmondás, mennyire erős, és mire kell figyelni publikálás előtt.
`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "AI request failed" },
        { status: 500 }
      );
    }

    const data = await res.json();

    const analysis =
  data.output_text ||
  data.output
    ?.flatMap((item: any) => item.content || [])
    ?.map((content: any) => {
      if (typeof content === "string") return content;
      return content.text || content.value || "";
    })
    ?.join("\n")
    ?.trim() ||
  data.output
    ?.map((item: any) => item.text || "")
    ?.join("\n")
    ?.trim() ||
  "Nem sikerült AI elemzést készíteni.";
  console.log("AI analysis result:", analysis);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}