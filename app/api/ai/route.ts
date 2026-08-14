import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/serverAuth';

export async function POST(req: Request) {
  const auth = await authenticateRequest(req, ['superadmin', 'admin', 'reviewer']);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });

  const body = await req.json().catch(() => null);
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt || prompt.length > 12000) {
    return NextResponse.json({ error: 'A prompt kötelező és legfeljebb 12000 karakter lehet.' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Az AI szolgáltatás nincs konfigurálva.' }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
    }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'AI szolgáltatási hiba.' }, { status: 502 });
    }

    return NextResponse.json({
      text: data.output?.[0]?.content?.[0]?.text || "Nem sikerült AI választ generálni.",
    });
  } catch (error) {
    console.error('AI request failed:', error);
    return NextResponse.json({ error: 'Az AI szolgáltatás átmenetileg nem elérhető.' }, { status: 502 });
  }
}
