type Props = {
  oldDate?: string | null;
  newDate?: string | null;
  oldStatement?: string | null;
  newStatement?: string | null;
};

export default function StatementTimeline({
  oldDate,
  newDate,
  oldStatement,
  newStatement,
}: Props) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9))",
        border: "1px solid rgba(255,255,255,0.75)",
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
          position: "absolute",
          left: 42,
          top: 34,
          bottom: 34,
          width: 3,
          background:
            "linear-gradient(180deg, #6366f1 0%, #8b5cf6 45%, #22c55e 100%)",
          borderRadius: 999,
        }}
      />

      <div
        style={{
          display: "grid",
          gap: 26,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "52px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              boxShadow: "0 10px 25px rgba(79,70,229,0.35)",
            }}
          >
            1
          </div>

          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: 1.2,
                color: "#4338ca",
                marginBottom: 6,
              }}
            >
              RÉGEN
            </div>

            <div
              style={{
                color: "#64748b",
                fontWeight: 800,
                marginBottom: 10,
                fontSize: 14,
              }}
            >
              {oldDate || "Dátum nem ismert"}
            </div>

            <p
              style={{
                margin: 0,
                fontSize: 20,
                lineHeight: 1.6,
                color: "#0f172a",
                fontWeight: 500,
              }}
            >
              {oldStatement || "Nincs régi állítás"}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "52px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              boxShadow: "0 10px 25px rgba(34,197,94,0.35)",
            }}
          >
            2
          </div>

          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: 1.2,
                color: "#15803d",
                marginBottom: 6,
              }}
            >
              MOST
            </div>

            <div
              style={{
                color: "#64748b",
                fontWeight: 800,
                marginBottom: 10,
                fontSize: 14,
              }}
            >
              {newDate || "Dátum nem ismert"}
            </div>

            <p
              style={{
                margin: 0,
                fontSize: 20,
                lineHeight: 1.6,
                color: "#0f172a",
                fontWeight: 500,
              }}
            >
              {newStatement || "Nincs új állítás"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}