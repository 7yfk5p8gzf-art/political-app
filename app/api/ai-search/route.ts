import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();

  const prompt = `
Keresd meg a legfontosabb forrásokat erről:
"${query}"

Adj vissza:

- 3 cikk (title, url)
- 2 videó (title, url)
- rövid összefoglaló

ÉS elemezd:

- politikus (ha van)
- téma (1 szó pl: migration, war, economy)
- ország (pl: DE, HU, EU)
- dátum (YYYY-MM-DD ha van)

JSON formátumban:

{
  articles: [{title, url}],
  videos: [{title, url}],
  summary: "",
  politician: "",
  topic: "",
  country: "",
  date: ""
}

Csak tiszta JSON-t adj vissza.
`;
    const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.3-chat-latest",
      input: prompt,
      text: {
        format: {
          type: "json_object",
        },
      },
    }),
  });

  const data = await res.json();
  console.log("OPENAI STATUS:", res.status);
console.log("OPENAI RAW:", JSON.stringify(data, null, 2));

  const text =
  data.output_text ||
  data.output?.flatMap((o: any) => o.content || [])
    ?.find((c: any) => c.text)?.text ||
  "";

  let parsed = null;

  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {
      articles: [],
      videos: [],
      summary: text,
    };
  }

  return NextResponse.json(parsed);
}