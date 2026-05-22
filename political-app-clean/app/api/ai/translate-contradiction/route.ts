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
        { error: "Missing contradiction id" },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from("contradictions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !item) {
      return NextResponse.json(
        { error: "Contradiction not found" },
        { status: 404 }
      );
    }

    const sourceText = {
      politician: item.politician || "",
      topic: item.topic || "",
      old_statement: item.old_statement || "",
      new_statement: item.new_statement || "",
      ai_summary: item.ai_summary || "",
    };

    const prompt = `
Translate this political contradiction content into Hungarian, German, English and French.

Return ONLY valid JSON.

Required JSON shape:
{
  "hu": {
    "topic": "",
    "old_statement": "",
    "new_statement": "",
    "ai_summary": ""
  },
  "de": {
    "topic": "",
    "old_statement": "",
    "new_statement": "",
    "ai_summary": ""
  },
  "en": {
    "topic": "",
    "old_statement": "",
    "new_statement": "",
    "ai_summary": ""
  },
  "fr": {
    "topic": "",
    "old_statement": "",
    "new_statement": "",
    "ai_summary": ""
  }
}

Rules:
- Keep politician names unchanged.
- Keep meaning accurate, do not add new claims.
- Use natural public website language.
- If a field is empty, return empty string.

Content:
${JSON.stringify(sourceText, null, 2)}
`;

    const response = await openai.responses.create({
      model: "gpt-5.3-chat-latest",
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
      updateData[`topic_${lang}`] = translated?.[lang]?.topic || null;
      updateData[`old_statement_${lang}`] =
        translated?.[lang]?.old_statement || null;
      updateData[`new_statement_${lang}`] =
        translated?.[lang]?.new_statement || null;
      updateData[`ai_summary_${lang}`] =
        translated?.[lang]?.ai_summary || null;
    }

    const { error: updateError } = await supabase
      .from("contradictions")
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