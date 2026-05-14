type RelatedItem = {
  id: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
};

type Props = {
  items: RelatedItem[];
};

export default function RelatedContradictions({
  items,
}: Props) {
  return (
    <section>
      <h2>Kapcsolódó ellentmondások</h2>

      {items.map((item) => (
        <div key={item.id}>
          <strong>
            {item.politician} • {item.topic}
          </strong>

          <p>
            {item.old_statement} → {item.new_statement}
          </p>
        </div>
      ))}
    </section>
  );
}