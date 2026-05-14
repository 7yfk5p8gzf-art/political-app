type Props = {
  oldStatement?: string | null;
  newStatement?: string | null;
};

export default function StatementCards({
  oldStatement,
  newStatement,
}: Props) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns:
          typeof window !== "undefined" && window.innerWidth < 900
            ? "1fr"
            : "1fr 1fr",
        gap: 22,
        marginBottom: 24,
      }}
    >
      <article
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(238,242,255,0.92), rgba(224,231,255,0.82))",
          border: "1px solid rgba(199,210,254,0.9)",
          borderRadius: 28,
          padding: 26,
          boxShadow: "0 18px 45px rgba(79,70,229,0.08)",
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
            boxShadow: "0 10px 24px rgba(79,70,229,0.28)",
          }}
        >
          ◀ RÉGI ÁLLÍTÁS
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 24,
            lineHeight: 1.6,
            color: "#0f172a",
            fontWeight: 500,
          }}
        >
          {oldStatement || "Nincs régi állítás."}
        </p>
      </article>

      <article
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(236,253,245,0.92), rgba(220,252,231,0.82))",
          border: "1px solid rgba(134,239,172,0.9)",
          borderRadius: 28,
          padding: 26,
          boxShadow: "0 18px 45px rgba(34,197,94,0.08)",
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
            boxShadow: "0 10px 24px rgba(34,197,94,0.28)",
          }}
        >
          ▶ MOSTANI ÁLLÍTÁS
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 24,
            lineHeight: 1.6,
            color: "#0f172a",
            fontWeight: 500,
          }}
        >
          {newStatement || "Nincs új állítás."}
        </p>
      </article>
    </section>
  );
}