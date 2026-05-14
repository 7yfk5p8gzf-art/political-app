type Props = {
  summary: string;
};

export default function AiAnalysisCard({ summary }: Props) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        maxWidth: 1080,
        margin: "0 auto 24px auto",
        padding: 30,
        borderRadius: 30,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9))",
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow:
          "0 18px 50px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(239,68,68,0.12), transparent 30%), radial-gradient(circle at bottom right, rgba(168,85,247,0.12), transparent 28%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.4,
            color: "#7f1d1d",
            marginBottom: 14,
          }}
        >
          AI ELEMZÉS
        </div>

        <p
          style={{
            lineHeight: 1.8,
            fontSize: 18,
            color: "#334155",
            fontWeight: 500,
            margin: 0,
          }}
        >
          {summary}
        </p>
      </div>
    </section>
  );
}