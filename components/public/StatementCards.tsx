type Props = {
  oldStatement?: string | null;
  newStatement?: string | null;
};

export default function StatementCards({
  oldStatement,
  newStatement,
}: Props) {
  return (
    <section>
      <div>
        <h2>Korábban ezt mondta</h2>
        <p>{oldStatement || "Nincs régi állítás."}</p>
      </div>

      <div>
        <h2>Most ezt mondja</h2>
        <p>{newStatement || "Nincs új állítás."}</p>
      </div>
    </section>
  );
}