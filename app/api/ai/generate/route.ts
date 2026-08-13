import { NextResponse } from "next/server";
import { authenticateRequest } from '@/lib/serverAuth';

export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest(req, ['superadmin', 'admin', 'reviewer']);
    if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });

    const body = await req.json();
    const prompt = body?.prompt || body?.topic || body?.title;

    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 12000) {
      return NextResponse.json({ error: "Hiányzik a prompt" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `
${prompt}

Írj rövid, semleges magyar elemzést.

A válaszod PONTOSAN ebben a formátumban legyen:

ELLENTMONDÁS: igen

MAGYARÁZAT:
maximum 2 rövid mondat

MI VÁLTOZOTT:
maximum 1 rövid mondat

LEHETSÉGES OK:
maximum 1 rövid mondat

Szabályok:
- Az ELLENTMONDÁS lehet: igen, nem, részben
- Ne írj hosszú szöveget
- Ne propagandát írj
- Ne ismételj
`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "OpenAI API hiba" },
        { status: 500 }
      );
    }

    const text = data.output?.[0]?.content?.[0]?.text || "";

    if (!text) {
      return NextResponse.json({ error: "AI nem adott választ" }, { status: 500 });
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("AI route hiba:", err);
    return NextResponse.json({ error: "AI hiba" }, { status: 500 });
  }
}
