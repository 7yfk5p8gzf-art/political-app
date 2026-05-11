"use client";

import { useEffect, useState } from "react";

export default function FloatingShareSidebar() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <aside style={wrapStyle}>
      <div style={labelStyle}>SHARE</div>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnStyle, background: "#55acee" }}
        title="X"
      >
        X
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnStyle, background: "#1877f2" }}
        title="Facebook"
      >
        f
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnStyle, background: "#0077b5" }}
        title="LinkedIn"
      >
        in
      </a>

      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnStyle, background: "#25d366" }}
        title="WhatsApp"
      >
        ☎
      </a>

      <a
        href={`mailto:?subject=Érdekes összehasonlítás&body=${encodeURIComponent(url)}`}
        style={{ ...btnStyle, background: "#000" }}
        title="Email"
      >
        ✉
      </a>

      <button
        onClick={copyLink}
        style={{ ...btnStyle, background: copied ? "#16a34a" : "#1f2030" }}
        title="Link másolása"
      >
        {copied ? "✓" : "🔗"}
      </button>

      <style jsx>{`
        @media (max-width: 768px) {
          aside {
            right: 50% !important;
            top: auto !important;
            bottom: 16px !important;
            transform: translateX(50%) !important;
            flex-direction: row !important;
            padding: 10px 12px !important;
            border-radius: 999px !important;
            background: white !important;
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18) !important;
          }

          aside div {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
}

const wrapStyle = {
  position: "fixed",
  right: "22px",
  top: "28%",
  zIndex: 999,
  width: "74px",
  padding: "14px 0",
  background: "white",
  borderRadius: "0",
  boxShadow: "0 14px 36px rgba(15, 23, 42, 0.12)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "11px",
} as const;

const labelStyle = {
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "1.4px",
  color: "#111827",
  marginBottom: "8px",
} as const;

const btnStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  border: "none",
  color: "white",
  fontWeight: 900,
  fontSize: "17px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.18)",
} as const;