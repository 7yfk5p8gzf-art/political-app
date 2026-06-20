"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ApprovedContradictionsPage() {
  const [items, setItems] = useState<any[]>([]);

  async function loadItems() {
    const { data } = await supabase
      .from("contradictions")
      .select("*")
      .eq("review_status", "approved")
      .eq("status", "draft")
      .order("confidence_score", { ascending: false })
      .order("created_at", { ascending: false });

    setItems(data || []);
  }

  async function publishItem(id: string) {
    await supabase
      .from("contradictions")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", id);

    loadItems();
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-4xl font-bold">
        Approved Contradictions
      </h1>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Politician</th>
              <th className="p-3 text-left">Topic</th>
              <th className="p-3 text-left">Confidence</th>
              <th className="p-3 text-left">Review</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-white/5"
              >
                <td className="p-3">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3">{item.politician}</td>

                <td className="p-3">{item.topic}</td>

                <td className="p-3">{item.confidence_score}</td>

                <td className="p-3">{item.review_status}</td>

                <td className="p-3">{item.status}</td>

                <td className="p-3">
  <div className="flex gap-2 flex-wrap">

    <a
      href={`/contradictions/${item.slug}`}
      target="_blank"
      className="rounded-lg bg-sky-600 px-3 py-1 text-sm font-bold text-white"
    >
      View
    </a>

    <button
      onClick={() => publishItem(item.id)}
      className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-bold text-white"
    >
      Publish
    </button>

  </div>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}