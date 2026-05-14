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
    <section>
      <div>
        <strong>RÉGEN</strong>
        <p>{oldDate || "Dátum nem ismert"}</p>
        <p>{oldStatement}</p>
      </div>

      <div>
        <strong>MOST</strong>
        <p>{newDate || "Dátum nem ismert"}</p>
        <p>{newStatement}</p>
      </div>
    </section>
  );
}