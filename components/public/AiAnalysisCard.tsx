type Props = {
  summary: string;
};

export default function AiAnalysisCard({ summary }: Props) {
  return (
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto 24px auto",
        padding: 24,
        borderRadius: 18,
        background: "white",
        borderLeft: "6px solid #991b1b",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        AI ELEMZÉS
      </div>

      <p
        style={{
          lineHeight: 1.7,
          fontSize: 16,
          margin: 0,
        }}
      >
        {summary}
      </p>
    </section>
  );
}