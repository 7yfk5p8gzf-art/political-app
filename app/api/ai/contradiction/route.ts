import { NextResponse } from "next/server";
import { authenticateRequest } from '@/lib/serverAuth';

export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest(req, ['superadmin', 'admin', 'reviewer']);
    if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });

    const body = await req.json();

    const politician = body?.politician || "";
    const oldStatement = body?.oldStatement || "";
    const oldDate = body?.oldDate || "";
    const newStatement = body?.newStatement || "";
    const newDate = body?.newDate || "";

    if (!politician || !oldStatement || !newStatement ||
        [politician, oldStatement, newStatement, oldDate, newDate].some((value) => value.length > 12000)) {
      return NextResponse.json(
        { error: "Hiányzik a politikus, régi állítás vagy új állítás" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Az AI szolgáltatás nincs konfigurálva." }, { status: 503 });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Elemezd röviden magyarul, hogy van-e ellentmondás.

Politikus: ${politician}

Régi állítás dátuma: ${oldDate}
Régi állítás:
${oldStatement}

Új állítás dátuma: ${newDate}
Új állítás:
${newStatement}

Adj 5-8 mondatos szerkesztői összefoglalót. Legyen benne:
- miben változott az álláspont
- mennyire erős az ellentmondás
- ha nem egyértelmű, azt is írd le.`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "OpenAI API hiba" },
        { status: 500 }
      );
    }

    const summary = data.output?.[0]?.content?.[0]?.text || "";

    if (!summary) {
      return NextResponse.json(
        { error: "AI nem adott választ" },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Contradiction AI hiba:", err);
    return NextResponse.json({ error: "AI hiba" }, { status: 500 });
  }
}
