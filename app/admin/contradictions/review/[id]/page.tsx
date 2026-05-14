"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type Contradiction = {
  id: string;
  politician: string | null;
  severity_score?: number;
  topic: string | null;

  old_statement: string | null;
  new_statement: string | null;

  old_source: string | null;
  new_source: string | null;

  old_video_url: string | null;
  new_video_url: string | null;

  old_date: string | null;
  new_date: string | null;

  ai_summary: string | null;

  confidence_score: number | null;

  timeline_data: any;
  draft_data: any;

  review_status: string | null;
  status: string | null;
};

export default function ContradictionDetailPage() {
  const params = useParams();

  const id = params.id as string;

  const [item, setItem] =
    useState<Contradiction | null>(null);

  const [loading, setLoading] = useState(true);

  async function loadItem() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contradictions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      setItem(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        Loading...
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        Contradiction not found.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        color: "white",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {item.politician}
      </h1>

      <div
        style={{
          opacity: 0.7,
          marginBottom: 24,
        }}
      >
        {item.topic}
      </div>

      <div
        style={{
          background: "#111",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            marginBottom: 16,
          }}
        >
          AI Summary
        </h2>

        <div>{item.ai_summary}</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#111",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <h2
            style={{
              marginBottom: 12,
            }}
          >
            Old Statement
          </h2>

          <div
            style={{
              marginBottom: 12,
            }}
          >
            {item.old_statement}
          </div>

          <div
            style={{
              fontSize: 14,
              opacity: 0.7,
              marginBottom: 8,
            }}
          >
            {item.old_date}
          </div>

          {item.old_source && (
            <a
              href={item.old_source}
              target="_blank"
              style={{
                color: "#60a5fa",
              }}
            >
              Open Source
            </a>
          )}
        </div>

        <div
          style={{
            background: "#111",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <h2
            style={{
              marginBottom: 12,
            }}
          >
            New Statement
          </h2>

          <div
            style={{
              marginBottom: 12,
            }}
          >
            {item.new_statement}
          </div>

          <div
            style={{
              fontSize: 14,
              opacity: 0.7,
              marginBottom: 8,
            }}
          >
            {item.new_date}
          </div>

          {item.new_source && (
            <a
              href={item.new_source}
              target="_blank"
              style={{
                color: "#60a5fa",
              }}
            >
              Open Source
            </a>
          )}
        </div>
      </div>

      <div
        style={{
          background: "#111",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <h2
          style={{
            marginBottom: 12,
          }}
        >
          AI Metadata
        </h2>

        <div>
          Confidence:
          {" "}
          {item.confidence_score || 0}
        </div>

        <div>
          Review Status:
          {" "}
          {item.review_status}
        </div>

        <div>
          Status:
          {" "}
          {item.status}
          </div>

  <h3 style={{ marginBottom: 12 }}>
    Timeline Data
  </h3>
  {item.timeline_data?.timeline_hint && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
      overflowX: "auto",
    }}
  >
    {String(item.timeline_data.timeline_hint)
      .split("->")
      .map((step: string, index: number) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "#1d4ed8",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {step.trim()}
          </div>

          {index <
            String(item.timeline_data.timeline_hint)
              .split("->").length -
              1 && (
            <div
              style={{
                opacity: 0.6,
                fontSize: 20,
              }}
            >
              →
            </div>
          )}
        </div>
      ))}
  </div>
)}

  <pre
    style={{
      whiteSpace: "pre-wrap",
      fontSize: 13,
      opacity: 0.85,
    }}
  >
    {JSON.stringify(item.timeline_data, null, 2)}
  </pre>
</div>

<div
  style={{
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1px solid #333",
  }}
>
  <h3 style={{ marginBottom: 12 }}>
    Draft Data
  </h3>

  <pre
    style={{
      whiteSpace: "pre-wrap",
      fontSize: 13,
      opacity: 0.85,
    }}
  >
    {JSON.stringify(item.draft_data, null, 2)}
  </pre>
</div>
        </div>
      
    
  );
}