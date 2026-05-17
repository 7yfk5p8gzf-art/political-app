"use client";

import { useParams } from "next/navigation";

export default function ContradictionDetailPage() {
  const params = useParams();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-white">
      <a href="/contradictions" className="text-sm text-neutral-400">
        ← Back to contradictions
      </a>

      <h1 className="mt-8 text-4xl font-bold">
        TEST DETAIL PAGE
      </h1>

      <p className="mt-4 text-neutral-400">
        ID: {String(params.id)}
      </p>
    </main>
  );
}