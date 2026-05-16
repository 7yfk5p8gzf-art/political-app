type ContradictionCardProps = {
  id: string;
  politician: string | null;
  topic: string | null;
  oldStatement: string | null;
  newStatement: string | null;
};

export default function ContradictionCard({
  id,
  politician,
  topic,
  oldStatement,
  newStatement,
}: ContradictionCardProps) {
  return (
    <a
      href={`/contradictions/${id}`}
      className="block rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-neutral-300">
          {politician || "Unknown"}
        </div>

        <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-neutral-300">
          {topic || "No topic"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-red-500/10 p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-red-300">
            Older Statement
          </p>

          <p>{oldStatement || "No statement"}</p>
        </div>

        <div className="rounded-xl bg-green-500/10 p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-green-300">
            Newer Statement
          </p>

          <p>{newStatement || "No statement"}</p>
        </div>
      </div>
    </a>
  );
}