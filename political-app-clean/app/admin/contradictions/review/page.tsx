"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReviewQueuePage() {
  const [items, setItems] = useState<any[]>([]);

  async function loadItems() {
    const { data } = await supabase
  .from("contradictions")
  .select("*")
  .eq("review_status", "draft")
  .eq("status", "draft")
  .gte("confidence_score", 50)
  .order("confidence_score", { ascending: false })
  .order("created_at", { ascending: false });

    setItems(data || []);
  }
  async function approveItem(id: string) {
  await supabase
    .from("contradictions")
    .update({
      review_status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  loadItems();
}
async function rejectItem(id: string) {
  await supabase
    .from("contradictions")
    .update({
      review_status: "rejected",
      reviewed_at: new Date().toISOString(),
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
        Contradiction Review Queue
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
                    ? new Date(
                        item.created_at
                      ).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3">
                  {item.politician}
                </td>

                <td className="p-3">
                  {item.topic}
                </td>

                <td className="p-3">
                  {item.confidence_score}
                </td>

                <td className="p-3">
                  {item.review_status}
                </td>

                <td className="p-3">
                  {item.status}
                </td>
                <td className="p-3">
  <div className="flex gap-2">
  <button
    onClick={() => approveItem(item.id)}
    className="rounded-lg bg-green-600 px-3 py-1 text-sm font-bold text-white"
  >
    Approve
  </button>

  <button
    onClick={() => rejectItem(item.id)}
    className="rounded-lg bg-red-600 px-3 py-1 text-sm font-bold text-white"
  >
    Reject
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