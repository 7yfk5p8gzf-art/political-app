import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
);

const LANGS = ["hu", "de", "en", "fr"] as const;

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing source id" },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from("sources")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !item) {
      return NextResponse.json(
        { error: "Source not found" },
        { status: 404 }
      );
    }

    const sourceText = {
      title: item.title || "",
      topic: item.topic || "",
      summary: item.summary || "",
      ai_summary: item.ai_summary || "",
    };

    const prompt = `
Translate this political source content into Hungarian, German, English and French.

Return ONLY valid JSON.

Required JSON shape:
{
  "hu": {
    "title": "",
    "topic": "",
    "summary": "",
    "ai_summary": ""
  },
  "de": {
    "title": "",
    "topic": "",
    "summary": "",
    "ai_summary": ""
  },
  "en": {
    "title": "",
    "topic": "",
    "summary": "",
    "ai_summary": ""
  },
  "fr": {
    "title": "",
    "topic": "",
    "summary": "",
    "ai_summary": ""
  }
}

Rules:
- Keep politician names unchanged.
- Keep meaning accurate.
- Use natural public website language.
- If a field is empty, return empty string.

Content:
${JSON.stringify(sourceText, null, 2)}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_object",
        },
      },
    });

    const raw = response.output_text || "{}";
    const translated = JSON.parse(raw);

    const updateData: Record<string, string | null> = {};

    for (const lang of LANGS) {
      updateData[`title_${lang}`] =
        translated?.[lang]?.title || null;

      updateData[`topic_${lang}`] =
        translated?.[lang]?.topic || null;

      updateData[`summary_${lang}`] =
        translated?.[lang]?.summary || null;

      updateData[`ai_summary_${lang}`] =
        translated?.[lang]?.ai_summary || null;
    }

    const { error: updateError } = await supabase
      .from("sources")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      translated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Translation failed" },
      { status: 500 }
    );
  }
}