type RelatedItem = {
  id: string;
  slug?: string | null;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
};

type Props = {
  items: RelatedItem[];
};

export default function RelatedContradictions({ items }: Props) {
  if (!items.length) return null;

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9))",
        border: "1px solid rgba(255,255,255,0.72)",
        borderRadius: 30,
        padding: 28,
        marginBottom: 24,
        boxShadow:
          "0 18px 50px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background:
              "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
            color: "white",
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
          }}
        >
          ↺
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 950,
              letterSpacing: "-0.8px",
            }}
          >
            Kapcsolódó ellentmondások
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            Hasonló témák és politikai fordulatok
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            typeof window !== "undefined" && window.innerWidth < 900
              ? "1fr"
              : "1fr 1fr",
          gap: 18,
        }}
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={`/contradictions/${item.slug || item.id}`}
            style={{
              position: "relative",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, rgba(248,250,252,0.92), rgba(241,245,249,0.82))",
              border: "1px solid rgba(226,232,240,0.9)",
              borderRadius: 24,
              padding: 22,
              textDecoration: "none",
              color: "#0f172a",
              boxShadow: "0 14px 35px rgba(15,23,42,0.05)",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 11px",
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #111827 0%, #1e293b 50%, #334155 100%)",
                color: "white",
                fontWeight: 900,
                fontSize: 12,
                marginBottom: 16,
                boxShadow: "0 8px 22px rgba(15,23,42,0.14)",
              }}
            >
              RELATED
            </div>

            <h3
              style={{
                margin: "0 0 14px",
                fontSize: 24,
                lineHeight: 1.15,
                fontWeight: 950,
                letterSpacing: "-0.5px",
              }}
            >
              {item.politician} – {item.topic}
            </h3>

            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "rgba(79,70,229,0.08)",
                  border: "1px solid rgba(99,102,241,0.18)",
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: 1,
                    color: "#4338ca",
                    marginBottom: 8,
                  }}
                >
                  RÉGEN
                </div>

                <div
                  style={{
                    color: "#0f172a",
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {item.old_statement}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.18)",
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: 1,
                    color: "#15803d",
                    marginBottom: 8,
                  }}
                >
                  MOST
                </div>

                <div
                  style={{
                    color: "#0f172a",
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {item.new_statement}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}