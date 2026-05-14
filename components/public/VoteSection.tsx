type Props = {
  yesPercent: number;
  noPercent: number;
  totalVotes: number;
  voted?: boolean;
  onVote?: (type: "yes" | "no") => void;
};

export default function VoteSection({
  yesPercent,
  noPercent,
  totalVotes,
  voted = false,
  onVote,
}: Props) {
  return (
    <section
      style={{
        padding: 24,
        background: "white",
        borderRadius: 18,
        marginTop: 24,
      }}
    >
      <h2>Ez szerinted ellentmondás?</h2>

      <div style={{ marginBottom: 8 }}>
        👍 {yesPercent}% igen · 👎 {noPercent}% nem · összesen{" "}
        {totalVotes} szavazat
      </div>

      <div
        style={{
          height: 12,
          background: "#e5e7eb",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: `${yesPercent}%`,
            height: "100%",
            background: "#16a34a",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          disabled={voted}
          onClick={() => onVote?.("yes")}
        >
          👍 igen
        </button>

        <button
          disabled={voted}
          onClick={() => onVote?.("no")}
        >
          👎 nem
        </button>
      </div>

      {voted && (
        <p style={{ marginTop: 12 }}>
          Köszönjük, erre már szavaztál.
        </p>
      )}
    </section>
  );
}