import { supabase } from "../../../lib/supabase";
import ContradictionCard from "@/components/public/ContradictionCard";
import VoteSection from "@/components/public/VoteSection";
import ShareButtons from "@/components/public/ShareButtons";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ContradictionDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: item } = await supabase
    .from("contradictions")
    .select("*")
    .eq("id", id)
    .single();
    await supabase.rpc("increment_views", {
  row_id: id,
});
    const { data: related } = await supabase
  .from("contradictions")
  .select(`
    id,
    politician,
    topic,
    old_statement,
    new_statement
  `)
  .neq("id", id)
  .or(
    `politician.eq.${item?.politician},topic.eq.${item?.topic}`
  )
  .limit(4);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <a href="/contradictions" className="text-sm text-neutral-400">
        ← Back to contradictions
      </a>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="mb-6 flex gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-neutral-300">
            {item?.politician || "Unknown"}
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-neutral-300">
            {item?.topic || "No topic"}
          </span>
        </div>
        <div className="mt-4 text-sm text-neutral-400">
  Views: {item?.views || 0}
</div>

        <h1 className="text-3xl font-bold">Contradiction detail</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-red-500/10 p-5">
            <p className="mb-2 text-xs uppercase tracking-wide text-red-300">
              Older Statement
            </p>
            <p>{item?.old_statement || "No statement"}</p>
          </div>

          <div className="rounded-xl bg-green-500/10 p-5">
            <p className="mb-2 text-xs uppercase tracking-wide text-green-300">
              Newer Statement
            </p>
            <p>{item?.new_statement || "No statement"}</p>
          </div>
          <div className="mt-8 rounded-xl border border-white/10 bg-black/30 p-5">
  <p className="mb-2 text-xs uppercase tracking-wide text-neutral-400">
    AI Summary
  </p>

  <p className="text-neutral-200">
    {item?.ai_summary || "No AI summary yet."}
  </p>
</div>

<div className="mt-6 grid gap-4 md:grid-cols-2">
  <a
    href={item?.old_source || "#"}
    target="_blank"
    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
  >
    <p className="mb-2 text-xs uppercase tracking-wide text-neutral-400">
      Old Source
    </p>
    <p className="break-all text-sm text-neutral-300">
      {item?.old_source || "No source"}
    </p>
  </a>

  <a
    href={item?.new_source || "#"}
    target="_blank"
    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
  >
    <p className="mb-2 text-xs uppercase tracking-wide text-neutral-400">
      New Source
    </p>
    <p className="break-all text-sm text-neutral-300">
      {item?.new_source || "No source"}
    </p>
  </a>
</div>
        </div>
        <VoteSection contradictionId={id} />
        <ShareButtons
  url={`http://localhost:3000/contradictions/${id}`}
  title={`${item?.politician} - ${item?.topic}`}
/>

      </section>
      <section className="mt-10">
  <h2 className="mb-4 text-2xl font-bold">Related contradictions</h2>

  <div className="space-y-6">
    {(related || []).map((relatedItem) => (
      <ContradictionCard
        key={relatedItem.id}
        id={relatedItem.id}
        politician={relatedItem.politician}
        topic={relatedItem.topic}
        oldStatement={relatedItem.old_statement}
        newStatement={relatedItem.new_statement}
      />
    ))}
  </div>
</section>
    </main>
  );
}