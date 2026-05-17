"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ContradictionCard from "@/components/public/ContradictionCard";

type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
};

export default function ContradictionsPage() {
  const [items, setItems] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    try {
      const query = supabase
        .from("contradictions")
        .select(`
          id,
          politician,
          topic,
          old_statement,
          new_statement
        `)
        .limit(20);

      const timeout = new Promise<{ data: null; error: string }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: "timeout" }), 5000)
      );

      const result: any = await Promise.race([query, timeout]);

      if (result.error) {
        console.error("Contradictions load error:", result.error);
        setItems([]);
        return;
      }

      setItems(result.data || []);
    } catch (error) {
      console.error("Contradictions load crash:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
          Public Feed
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Political Contradictions
        </h1>
      </div>

      {loading && <div className="text-neutral-400">Loading...</div>}

      {!loading && items.length === 0 && (
        <div className="text-neutral-400">
          No contradictions found.
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-6">
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
      )}
    </main>
  );
}