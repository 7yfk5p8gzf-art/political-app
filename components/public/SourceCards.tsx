type Props = {
  oldSource?: string | null;
  newSource?: string | null;
};

export default function SourceCards({
  oldSource,
  newSource,
}: Props) {
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
          ↗
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
            Források
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            Cikkek, interjúk és hivatkozások
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
          gap: 20,
        }}
      >
        <article
          style={{
            background:
              "linear-gradient(135deg, rgba(238,242,255,0.85), rgba(224,231,255,0.7))",
            border: "1px solid rgba(199,210,254,0.9)",
            borderRadius: 24,
            padding: 22,
            boxShadow: "0 14px 35px rgba(79,70,229,0.08)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "white",
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: 0.4,
              marginBottom: 18,
            }}
          >
            ◀ RÉGI FORRÁS
          </div>

          {oldSource ? (
            <a
              href={oldSource}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                color: "#312e81",
                fontWeight: 800,
                lineHeight: 1.7,
                wordBreak: "break-word",
                textDecoration: "none",
              }}
            >
              {oldSource}
            </a>
          ) : (
            <p
              style={{
                margin: 0,
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              Nincs forrás megadva.
            </p>
          )}
        </article>

        <article
          style={{
            background:
              "linear-gradient(135deg, rgba(236,253,245,0.85), rgba(220,252,231,0.7))",
            border: "1px solid rgba(134,239,172,0.9)",
            borderRadius: 24,
            padding: 22,
            boxShadow: "0 14px 35px rgba(34,197,94,0.08)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
              color: "white",
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: 0.4,
              marginBottom: 18,
            }}
          >
            ▶ ÚJ FORRÁS
          </div>

          {newSource ? (
            <a
              href={newSource}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                color: "#166534",
                fontWeight: 800,
                lineHeight: 1.7,
                wordBreak: "break-word",
                textDecoration: "none",
              }}
            >
              {newSource}
            </a>
          ) : (
            <p
              style={{
                margin: 0,
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              Nincs forrás megadva.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}