import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function normalizePolitician(value: string | null | undefined, slug: string) {
  let name = value || slug;

  name = name
    .toLowerCase()
    .replace("ov", "Orbán Viktor")
    .replace("orban viktor", "Orbán Viktor")
    .replace("orbán viktor", "Orbán Viktor")
    .replace("orban", "Orbán")
    .replaceAll("-", " ");

  return name.toUpperCase();
}

function cleanAiSummary(text: string | null | undefined) {
  let teaser = text || "";

  if (teaser.includes("MAGYARÁZAT:")) {
    teaser = teaser.split("MAGYARÁZAT:")[1];
  }

  if (teaser.includes("MI VÁLTOZOTT:")) {
    teaser = teaser.split("MI VÁLTOZOTT:")[0];
  }

  teaser = teaser.trim();

  return teaser.length > 120 ? teaser.slice(0, 120) + "..." : teaser;
}

function shortStatement(text: string | null | undefined) {
  if (!text) return "Nincs megadott állítás";
  return text.length > 80 ? text.slice(0, 140) + "..." : text;
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { data } = await supabase
    .from("contradictions")
    .select("politician, old_statement, new_statement, ai_summary")
    .eq("slug", params.slug)
    .maybeSingle();

  const politician = normalizePolitician(data?.politician, params.slug);

  const ai = (data?.ai_summary || "").toLowerCase();

  let statusText = "ELLENTMONDÁS: ?";
  let statusColor = "#374151";

  if (ai.includes("ellentmondás: igen")) {
    statusText = "ELLENTMONDÁS: IGEN";
    statusColor = "#7f1d1d";
  } else if (ai.includes("ellentmondás: részben")) {
    statusText = "ELLENTMONDÁS: RÉSZBEN";
    statusColor = "#b45309";
  } else if (ai.includes("ellentmondás: nem")) {
    statusText = "ELLENTMONDÁS: NEM";
    statusColor = "#065f46";
  }

  const teaser = cleanAiSummary(data?.ai_summary);
  const oldText = shortStatement(data?.old_statement);
  const newText = shortStatement(data?.new_statement);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#111827",
          display: "flex",
          padding: "28px",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#f3efe6",
            color: "#111827",
            display: "flex",
            flexDirection: "column",
            padding: "46px",
            border: "6px solid #f5f1e8",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "4px solid #111827",
              paddingBottom: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: 4,
              }}
            >
              POLITIKAI ÖSSZEHASONLÍTÓ
            </div>

            <div
              style={{
                display: "flex",
                background: statusColor,
                color: "white",
                padding: "10px 16px",
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              {statusText}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 54,
              lineHeight: 1.05,
              fontWeight: 900,
              marginTop: "30px",
            }}
          >
            {politician} – ÁLLÁSPONT VÁLTOZÁS
          </div>

          <div
            style={{
              display: "flex",
              gap: "18px",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                background: "#fffdf7",
                borderLeft: "6px solid #111827",
                padding: "18px",
                minHeight: "125px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 25,
                  fontWeight: 900,
                  color: "#6b7280",
                  marginBottom: "12px",
                }}
              >
                RÉGEN
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 25,
                  lineHeight: 1.25,
                  fontWeight: 800,
                }}
              >
                {oldText?.replace(/^"|"$/g, "")}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                background: "#fffdf7",
                borderLeft: "10px solid #7f1d1d",
                padding: "18px",
                minHeight: "125px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#6b7280",
                  marginBottom: "12px",
                }}
              >
                MOST
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 25,
                  lineHeight: 1.25,
                  fontWeight: 800,
                }}
              >
                {newText?.replace(/^"|"$/g, "")}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 24,
              lineHeight: 1.35,
              color: "#374151",
              marginTop: "28px",
            }}
          >
            {teaser || "Régi és új állítás összehasonlítása források alapján."}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}