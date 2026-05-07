import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json(
      { articles: [], videos: [], summary: "Nincs keresés megadva." },
      { status: 400 }
    );
  }

  const braveRes = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(
      query
    )}&count=5&freshness=pm&extra_snippets=true`,
    {
      headers: {
        "X-Subscription-Token": process.env.BRAVE_API_KEY || "",
        Accept: "application/json",
      },
    }
  );

  const braveData = await braveRes.json();

  const articles =
    braveData.web?.results?.slice(0, 3).map((item: any) => ({
      title: item.title || "",
      url: item.url || "",
      description: item.description || "",
    })) || [];

  const aiPrompt = `
Elemezd ezt a keresést és a talált cikkeket.

Keresés:
"${query}"

Cikkek:
${JSON.stringify(articles, null, 2)}

Adj vissza CSAK tiszta JSON-t:

{
  "summary": "rövid magyar összefoglaló",
  "politician": "",
  "topic": "",
  "country": "",
  "date": ""
}
`;

  const aiRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.3-chat-latest",
      input: aiPrompt,
      text: {
        format: {
          type: "json_object",
        },
      },
    }),
  });

  const aiData = await aiRes.json();

  const text =
    aiData.output_text ||
    aiData.output?.flatMap((o: any) => o.content || [])
      ?.find((c: any) => c.text)?.text ||
    "{}";

  let meta: any = {};

  try {
    meta = JSON.parse(text);
  } catch {
    meta = {};
  }

  return NextResponse.json({
    articles,
    videos: [
      {
        title: `${query} interview`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          query + " interview"
        )}`,
      },
      {
        title: `${query} statement`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          query + " statement"
        )}`,
      },
    ],
    summary: meta.summary || "",
    politician: meta.politician || "",
    topic: meta.topic || "",
    country: meta.country || "",
    date: meta.date || "",
  });
}