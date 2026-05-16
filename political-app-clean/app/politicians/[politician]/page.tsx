import ContradictionCard from "@/components/public/ContradictionCard";
import { supabase } from "../../../../lib/supabase";

type PageProps = {
  params: Promise<{
    politician: string;
  }>;
};

type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
};

export default async function PoliticianDetailPage({ params }: PageProps) {
  const { politician } = await params;

  const decodedPolitician = decodeURIComponent(politician);

  const { data } = await supabase
    .from("contradictions")
    .select(`
      id,
      politician,
      topic,
      old_statement,
      new_statement
    `)
    .eq("politician", decodedPolitician);

  const items = (data || []) as Contradiction[];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
        Politician
      </p>

      <h1 className="mt-3 text-4xl font-bold">{decodedPolitician}</h1>

      <div className="mt-10 space-y-6">
        {items.map((item) => (
          <ContradictionCard
            key={item.id}
            id={item.id}
            politician={item.politician}
            topic={item.topic}
            oldStatement={item.old_statement}
            newStatement={item.new_statement}
          />
        ))}
      </div>
    </main>
  );
}