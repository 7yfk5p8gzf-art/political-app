"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
};

type RelatedContradictionsProps = {
  currentId: string;
  politician?: string | null;
  topic?: string | null;
};

export default function RelatedContradictions({
  currentId,
  politician,
  topic,
}: RelatedContradictionsProps) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    loadItems();
  }, [currentId]);

  async function loadItems() {
    let query = supabase
      .from("contradictions")
      .select(`
        id,
        politician,
        topic,
        old_statement,
        new_statement
      `)
      .neq("id", currentId)
      .limit(3);

    if (politician) {
      query = query.eq("politician", politician);
    } else if (topic) {
      query = query.eq("topic", topic);
    }

    const { data } = await query;

    setItems((data || []) as Item[]);
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Related contradictions
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
          Hasonló esetek
        </h2>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/contradictions/${item.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex flex-wrap gap-2">
              {item.politician && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {item.politician}
                </span>
              )}

              {item.topic && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {item.topic}
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                  Korábban
                </p>

                <p className="line-clamp-3 text-sm text-slate-900 dark:text-white">
                  {item.old_statement || "Nincs adat"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                  Most
                </p>

                <p className="line-clamp-3 text-sm text-slate-900 dark:text-white">
                  {item.new_statement || "Nincs adat"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}