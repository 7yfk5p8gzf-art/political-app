import { supabase } from "../../lib/supabase";

type TopicRow = {
  topic: string | null;
};

export default async function TopicsPage() {
  const { data } = await supabase
    .from("contradictions")
    .select("topic")
    .not("topic", "is", null);

  const topics = Array.from(
    new Set((data || []).map((item: TopicRow) => item.topic).filter(Boolean))
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
        Browse
      </p>

      <h1 className="mt-3 text-4xl font-bold">Topics</h1>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <a
            key={topic}
            href={`/topics/${encodeURIComponent(String(topic))}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
          >
            <p className="text-xl font-semibold">{topic}</p>
          </a>
        ))}
      </div>
    </main>
  );
}