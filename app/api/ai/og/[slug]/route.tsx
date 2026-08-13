import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const title = slug.replaceAll("-", " ").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#f5f1e8",
          color: "#111827",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 4 }}>
          POLITIKAI ÖSSZEHASONLÍTÓ
        </div>

        <div>
          <div
            style={{
              display: "inline-block",
              background: "#7f1d1d",
              color: "white",
              padding: "12px 18px",
              fontSize: 26,
              fontWeight: 900,
              marginBottom: 30,
            }}
          >
            ELLENTMONDÁS: IGEN
          </div>

          <div style={{ fontSize: 72, lineHeight: 1.05, fontWeight: 700 }}>
            {title}
          </div>
        </div>

        <div style={{ fontSize: 26, fontWeight: 700 }}>
          Régi és új állítás összehasonlítása
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
