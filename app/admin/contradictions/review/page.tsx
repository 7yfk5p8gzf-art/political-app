"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
function makeSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  ai_summary: string | null;
  confidence_score: number | null;
  status: string | null;
  review_status: string | null;
  created_at: string | null;
};

export default function ReviewQueuePage() {
  const [items, setItems] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contradictions")
      .select(`
        id,
        politician,
        topic,
        ai_summary,
        confidence_score,
        status,
        review_status,
        created_at
      `)
      .eq("review_status", "draft")
      .order("created_at", {
        ascending: false,
      });

    if (!error && data) {
      setItems(data);
    }

    setLoading(false);
  }

  async function updateReviewStatus(
    id: string,
    reviewStatus: "review" | "rejected" | "approved",
    status: "draft" | "rejected" | "published"
  ) {
    const { error } = await supabase
      .from("contradictions")
      .update({
        slug:
  status === "published"
    ? makeSlug(`${items.find((x) => x.id === id)?.politician || "politician"}-${items.find((x) => x.id === id)?.topic || "contradiction"}`)
    : undefined,
        review_status: reviewStatus,
        status,
        reviewed_at: new Date().toISOString(),
        published_at:
          status === "published"
            ? new Date().toISOString()
            : null,
      })
      .eq("id", id);

    if (!error) {
      await loadItems();
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div
      style={{
        padding: 24,
        color: "white",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 24,
        }}
      >
        Contradiction Review Queue
      </h1>

      {loading && <p>Loading...</p>}

      {!loading && items.length === 0 && (
        <p>No draft contradictions.</p>
      )}

      <div
        style={{
          display: "grid",
          gap: 16,
        }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/admin/contradictions/review/${item.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                border: "1px solid #333",
                borderRadius: 12,
                padding: 16,
                background: "#111",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {item.politician}
              </div>

              <div
                style={{
                  opacity: 0.8,
                  marginBottom: 8,
                }}
              >
                {item.topic}
              </div>

              <div
                style={{
                  marginBottom: 12,
                }}
              >
                {item.ai_summary}
              </div>

              <div
                style={{
                  fontSize: 14,
                  opacity: 0.7,
                }}
              >
                Confidence: {item.confidence_score || 0}
              </div>

              <div
                style={{
                  fontSize: 14,
                  opacity: 0.7,
                }}
              >
                Status: {item.review_status}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();

                    updateReviewStatus(
                      item.id,
                      "approved",
                      "published"
                    );
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background: "#15803d",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  Approve
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();

                    updateReviewStatus(
                      item.id,
                      "rejected",
                      "rejected"
                    );
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background: "#b91c1c",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  Reject
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();

                    updateReviewStatus(
                      item.id,
                      "review",
                      "draft"
                    );
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background: "#1d4ed8",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  Review
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}