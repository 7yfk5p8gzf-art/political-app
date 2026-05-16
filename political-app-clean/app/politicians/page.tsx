import { supabase } from "../../lib/supabase";

type PoliticianRow = {
  politician: string | null;
};

export default async function PoliticiansPage() {
  const { data } = await supabase
    .from("contradictions")
    .select("politician")
    .not("politician", "is", null);

  const politicians = Array.from(
    new Set(
      (data || [])
        .map((item: PoliticianRow) => item.politician)
        .filter(Boolean)
    )
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
        Browse
      </p>

      <h1 className="mt-3 text-4xl font-bold">Politicians</h1>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {politicians.map((politician) => (
          <a
            key={politician}
            href={`/politicians/${encodeURIComponent(String(politician))}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
          >
            <p className="text-xl font-semibold">
              {politician}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}