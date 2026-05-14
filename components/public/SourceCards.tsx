type Props = {
  oldSource?: string | null;
  newSource?: string | null;
};

export default function SourceCards({
  oldSource,
  newSource,
}: Props) {
  return (
    <section>
      <h2>Források</h2>

      <div>
        <strong>Régi állítás forrása</strong>
        <p>{oldSource || "Nincs forrás megadva."}</p>
      </div>

      <div>
        <strong>Új állítás forrása</strong>
        <p>{newSource || "Nincs forrás megadva."}</p>
      </div>
    </section>
  );
}