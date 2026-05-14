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
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
        color: "white",
        borderRadius: 30,
        padding: 30,
        marginTop: 24,
        marginBottom: 24,
        boxShadow: "0 28px 80px rgba(15,23,42,0.22)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(59,130,246,0.2), transparent 30%), radial-gradient(circle at bottom right, rgba(168,85,247,0.22), transparent 28%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            padding: "7px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.14)",
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: 0.5,
            marginBottom: 16,
          }}
        >
          COMMUNITY VOTE
        </div>

        <h2
          style={{
            margin: "0 0 14px",
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 1.08,
            fontWeight: 950,
            letterSpacing: "-1px",
          }}
        >
          Ez szerinted ellentmondás?
        </h2>

        <div
          style={{
            marginBottom: 14,
            color: "rgba(255,255,255,0.82)",
            fontWeight: 800,
          }}
        >
          👍 {yesPercent}% igen · 👎 {noPercent}% nem · összesen {totalVotes}{" "}
          szavazat
        </div>

        <div
          style={{
            height: 14,
            background: "rgba(255,255,255,0.16)",
            borderRadius: 999,
            overflow: "hidden",
            marginBottom: 18,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              width: `${yesPercent}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #22c55e 0%, #86efac 100%)",
              borderRadius: 999,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            disabled={voted}
            onClick={() => onVote?.("yes")}
            style={voted ? disabledButtonStyle : yesButtonStyle}
          >
            👍 Igen, ellentmondás
          </button>

          <button
            disabled={voted}
            onClick={() => onVote?.("no")}
            style={voted ? disabledButtonStyle : noButtonStyle}
          >
            👎 Nem, nem az
          </button>
        </div>

        {voted && (
          <p
            style={{
              marginTop: 14,
              marginBottom: 0,
              color: "#bbf7d0",
              fontWeight: 900,
            }}
          >
            Köszönjük, erre már szavaztál.
          </p>
        )}
      </div>
    </section>
  );
}

const yesButtonStyle = {
  padding: "12px 16px",
  border: "none",
  borderRadius: 14,
  background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
  boxShadow: "0 14px 30px rgba(34,197,94,0.28)",
};

const noButtonStyle = {
  padding: "12px 16px",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.12)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const disabledButtonStyle = {
  padding: "12px 16px",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.55)",
  cursor: "not-allowed",
  fontWeight: 900,
};