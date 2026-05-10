"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type AuditLog = {
  id: string;
  created_at: string;
  user_email: string | null;
  user_role: string | null;
  action: string;
  table_name: string | null;
  details: string | null;
};

function getActionInfo(log: AuditLog) {
  const text = `${log.action} ${log.details || ""}`.toLowerCase();

  if (text.includes("published") || text.includes("publish")) {
    return { icon: "✅", label: "Publish", style: publishBadgeStyle };
  }

  if (text.includes("delete") || text.includes("töröl")) {
    return { icon: "🗑️", label: "Delete", style: deleteBadgeStyle };
  }

  if (text.includes("generate_ai") || text.includes("ai")) {
    return { icon: "✨", label: "AI", style: aiBadgeStyle };
  }

  if (text.includes("review")) {
    return { icon: "🔎", label: "Review", style: reviewBadgeStyle };
  }

  if (text.includes("draft")) {
    return { icon: "📝", label: "Draft", style: draftBadgeStyle };
  }

  if (text.includes("create") || text.includes("létrehoz")) {
    return { icon: "➕", label: "Create", style: createBadgeStyle };
  }

  return { icon: "📌", label: log.action, style: defaultBadgeStyle };
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Audit log hiba: " + error.message);
      return;
    }

    setLogs(data || []);
    setLoading(false);
  }

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();

    const matchesSearch = [
      log.user_email,
      log.user_role,
      log.action,
      log.table_name,
      log.details,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);

    if (activeFilter === "all") return matchesSearch;

    const text = `${log.action} ${log.details || ""}`.toLowerCase();

    if (activeFilter === "publish") {
      return matchesSearch && (text.includes("publish") || text.includes("published"));
    }

    if (activeFilter === "review") {
      return matchesSearch && text.includes("review");
    }

    if (activeFilter === "draft") {
      return matchesSearch && text.includes("draft");
    }

    if (activeFilter === "delete") {
      return matchesSearch && (text.includes("delete") || text.includes("töröl"));
    }

    if (activeFilter === "ai") {
      return matchesSearch && text.includes("ai");
    }

    if (activeFilter === "create") {
      return matchesSearch && (text.includes("create") || text.includes("létrehoz"));
    }

    return matchesSearch;
  });

  if (loading) {
    return <div style={{ padding: 32 }}>Betöltés...</div>;
  }

  return (
    <main style={pageStyle}>
      <div style={topStyle}>
        <div>
          <h1 style={titleStyle}>Audit Logs</h1>
          <p style={subtitleStyle}>Admin aktivitások és rendszer napló</p>
        </div>

        <a href="/admin" style={backButtonStyle}>
          ← Dashboard
        </a>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={filtersRowStyle}>
          {[
            ["all", "Összes"],
            ["publish", "Publish"],
            ["review", "Review"],
            ["draft", "Draft"],
            ["delete", "Delete"],
            ["ai", "AI"],
            ["create", "Create"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              style={{
                ...filterButtonStyle,
                ...(activeFilter === value ? activeFilterButtonStyle : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          placeholder="Keresés email, role, action szerint..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchStyle}
        />
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {filteredLogs.map((log) => {
          const actionInfo = getActionInfo(log);

          return (
            <article key={log.id} style={cardStyle}>
              <div style={rowStyle}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ ...badgeBaseStyle, ...actionInfo.style }}>
                      {actionInfo.icon} {actionInfo.label}
                    </span>

                    <span style={rawActionStyle}>{log.action}</span>
                  </div>

                  <div style={metaStyle}>
                    {log.user_email || "ismeretlen"}
                    {" · "}
                    {log.user_role || "-"}
                    {" · "}
                    {log.table_name || "-"}
                  </div>
                </div>

                <div style={dateStyle}>
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>

              {log.details && <div style={detailsStyle}>{log.details}</div>}
            </article>
          );
        })}
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = {
  padding: 32,
  maxWidth: 1100,
  margin: "0 auto",
  minHeight: "100vh",
  background: "#f3f4f6",
};

const topStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 24,
  flexWrap: "wrap",
};

const titleStyle: CSSProperties = {
  fontSize: 38,
  margin: 0,
  fontWeight: 900,
  color: "#0f172a",
};

const subtitleStyle: CSSProperties = {
  color: "#64748b",
  marginTop: 8,
};

const backButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "white",
  border: "1px solid #cbd5e1",
  textDecoration: "none",
  color: "#111827",
  fontWeight: 700,
};

const searchStyle: CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "white",
};

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: 18,
  border: "1px solid #dbe0e6",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const metaStyle: CSSProperties = {
  color: "#64748b",
  marginTop: 8,
  fontSize: 14,
};

const dateStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
};

const detailsStyle: CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 10,
  background: "#f8fafc",
  lineHeight: 1.5,
};

const rawActionStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 700,
};

const badgeBaseStyle: CSSProperties = {
  display: "inline-block",
  padding: "7px 11px",
  borderRadius: 999,
  fontWeight: 900,
  fontSize: 14,
};

const publishBadgeStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
};

const deleteBadgeStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
};

const aiBadgeStyle: CSSProperties = {
  background: "#ede9fe",
  color: "#5b21b6",
};

const reviewBadgeStyle: CSSProperties = {
  background: "#dbeafe",
  color: "#1d4ed8",
};

const draftBadgeStyle: CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
};

const createBadgeStyle: CSSProperties = {
  background: "#e0f2fe",
  color: "#075985",
};

const defaultBadgeStyle: CSSProperties = {
  background: "#e2e8f0",
  color: "#334155",
};

const filtersRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 14,
};

const filterButtonStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const activeFilterButtonStyle: CSSProperties = {
  background: "#0f172a",
  color: "white",
  border: "1px solid #0f172a",
};