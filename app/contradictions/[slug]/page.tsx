"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type Contradiction = {
  id: string;
  politician: string | null;
  topic: string | null;
  language: string | null;
  slug: string | null;
  old_statement: string | null;
  old_date: string | null;
  old_source: string | null;
  new_statement: string | null;
  new_date: string | null;
  new_source: string | null;
  ai_summary: string | null;
  status: string | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
  vote_type: "yes" | "no";
};

function getYoutubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

export default function ContradictionDetailPage() {
  const params = useParams();
const searchParams = useSearchParams();
const slug = params.slug as string;
const isPreview = searchParams.get("preview") === "1";

  const [item, setItem] = useState<Contradiction | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    load();
  }, [slug]);

  async function load() {
  let canPreview = false;

  if (isPreview) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      canPreview =
        !!profile && ["admin", "editor"].includes(profile.role);
    }
  }

  let query = supabase
    .from("contradictions")
    .select("*")
    .eq("slug", slug);

  if (!canPreview) {
    query = query.eq("status", "published");
  }

  const { data } = await query.single();

  if (data) {
    setItem(data);

    const { data: voteData } = await supabase
      .from("contradiction_votes")
      .select("*")
      .eq("contradiction_id", data.id);

    setVotes((voteData || []) as Vote[]);

    const localVote = localStorage.getItem(`vote_${data.id}`);
    setVoted(Boolean(localVote));
  }

  setLoading(false);
}

  async function vote(type: "yes" | "no") {
    if (!item || voted) return;

    const { error } = await supabase.from("contradiction_votes").insert({
      contradiction_id: item.id,
      vote_type: type,
    });

    if (!error) {
      localStorage.setItem(`vote_${item.id}`, type);
      setVoted(true);
      load();
    }
  }

  function stats() {
  const total = votes.length;
  const yes = votes.filter((v) => v.vote_type === "yes").length;

  const yesPercent = total ? Math.round((yes / total) * 100) : 0;
  const noPercent = 100 - yesPercent;

  return { total, yes, no: total - yes, yesPercent, noPercent };
}

  if (loading) return <main style={pageStyle}>Betöltés...</main>;

  if (!item) {
    return (
      <main style={pageStyle}>
        {isPreview && (
  <div style={previewBannerStyle}>
    ⚠️ PREVIEW MODE – nem publikus
  </div>
)}
        <section style={containerStyle}>
          <h1>Nincs ilyen publikált cikk.</h1>
          <a href="/contradictions" style={buttonStyle}>Vissza</a>
        </section>
      </main>
    );
  }

  const s = stats();

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <a href="/contradictions" style={backStyle}>← Vissza az ellentmondásokhoz</a>

        <header style={heroStyle}>
          <div style={metaRowStyle}>
            <span style={darkBadgeStyle}>{item.topic || "Nincs téma"}</span>
            <span style={lightBadgeStyle}>{item.language?.toUpperCase() || "HU"}</span>
          </div>

          <h1 style={titleStyle}>
            {item.politician || "Ismeretlen"} – álláspont változás
          </h1>

          <p style={leadStyle}>
            Régi és új állítás összehasonlítása dátummal, forrással, AI elemzéssel és közösségi szavazással.
          </p>
        </header>

        <section style={timelineStyle}>
          <div style={timeBoxStyle}>
            <p style={labelStyle}>RÉGEN</p>
            <h2 style={dateStyle}>{item.old_date || "Dátum nem ismert"}</h2>
            <p style={statementStyle}>{item.old_statement || "Nincs régi állítás"}</p>
            

          </div>

          <div style={arrowStyle}>→</div>

          <div style={timeBoxStyle}>
            <p style={labelStyle}>MOST</p>
            <h2 style={dateStyle}>{item.new_date || "Dátum nem ismert"}</h2>
            <p style={statementStyle}>{item.new_statement || "Nincs új állítás"}</p>
            {item.new_source && (
              <a href={item.new_source} target="_blank" style={sourceButtonStyle}>
                Új forrás megnyitása →
              </a>
            )}
          </div>
        </section>

        <section style={analysisStyle}>
          <p style={sectionKickerStyle}>AI ELEMZÉS</p>
          <p style={summaryStyle}>
            {item.ai_summary || "Ehhez még nincs AI elemzés."}
          </p>
        </section>

        <section style={sourcePanelStyle}>
  <h2 style={smallTitleStyle}>Források</h2>

  <div style={sourceGridStyle}>
    <div style={sourceCardStyle}>
      <strong>Régi állítás forrása</strong>
      <p>
        {item.old_source
          ? "Elérhető külső linken."
          : "Nincs megadott forrás."}
      </p>

      {item.old_source && getYoutubeId(item.old_source) && (
        <iframe
          width="100%"
          height="220"
          src={`https://www.youtube.com/embed/${getYoutubeId(item.old_source)}`}
          title="Régi forrás videó"
          frameBorder="0"
          allowFullScreen
          style={{ marginTop: 12 }}
        />
      )}

      {item.old_source && (
        <a href={item.old_source} target="_blank" style={plainLinkStyle}>
          Megnyitás →
        </a>
      )}
    </div>

    <div style={sourceCardStyle}>
      <strong>Új állítás forrása</strong>
      <p>
        {item.new_source
          ? "Elérhető külső linken."
          : "Nincs megadott forrás."}
      </p>

      {item.new_source && getYoutubeId(item.new_source) && (
        <iframe
          width="100%"
          height="220"
          src={`https://www.youtube.com/embed/${getYoutubeId(item.new_source)}`}
          title="Új forrás videó"
          frameBorder="0"
          allowFullScreen
          style={{ marginTop: 12 }}
        />
      )}

      {item.new_source && (
        <a href={item.new_source} target="_blank" style={plainLinkStyle}>
          Megnyitás →
        </a>
      )}
    </div>
  </div>
</section>

        <section style={votePanelStyle}>
          <h2 style={smallTitleStyle}>Ez szerinted ellentmondás?</h2>

          <p style={voteTextStyle}>
            👍 {s.yesPercent}% szerint igen · 👎 {s.noPercent}% szerint nem · összesen {s.total} szavazat
          </p>

          <div style={progressStyle}>
            <div style={{ ...progressFillStyle, width: `${s.yesPercent}%` }} />
          </div>

          <div style={buttonRowStyle}>
            <button disabled={voted} onClick={() => vote("yes")} style={voteButtonStyle}>
              👍 Igen
            </button>
            <button disabled={voted} onClick={() => vote("no")} style={voteButtonSecondaryStyle}>
              👎 Nem
            </button>
          </div>

          {voted && <p style={thanksStyle}>Már szavaztál erre.</p>}
        </section>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f5f1e8",
  padding: 32,
  color: "#111827",
};

const containerStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
};

const backStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: 22,
  color: "#111827",
  fontWeight: 900,
  textDecoration: "none",
};

const heroStyle: CSSProperties = {
  borderTop: "1px solid #111827",
  borderBottom: "5px solid #111827",
  padding: "34px 0",
  marginBottom: 30,
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const darkBadgeStyle: CSSProperties = {
  background: "#111827",
  color: "white",
  padding: "6px 10px",
  fontWeight: 900,
  fontSize: 12,
  letterSpacing: 1,
};

const lightBadgeStyle: CSSProperties = {
  border: "1px solid #111827",
  padding: "6px 10px",
  fontWeight: 900,
  fontSize: 12,
};

const titleStyle: CSSProperties = {
  fontSize: 58,
  lineHeight: 1,
  margin: "18px 0 12px",
  fontFamily: "serif",
};

const leadStyle: CSSProperties = {
  fontSize: 19,
  color: "#374151",
  maxWidth: 780,
};

const timelineStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  gap: 18,
  alignItems: "stretch",
  marginBottom: 26,
};

const timeBoxStyle: CSSProperties = {
  background: "#fffdf7",
  border: "1px solid #d6d3c7",
  borderLeft: "5px solid #111827",
  padding: 24,
};

const arrowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: 38,
  fontWeight: 900,
};

const labelStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 2,
  color: "#6b7280",
};

const dateStyle: CSSProperties = {
  margin: "8px 0 14px",
  fontSize: 20,
};

const statementStyle: CSSProperties = {
  fontFamily: "serif",
  fontSize: 26,
  lineHeight: 1.25,
};

const sourceButtonStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 16,
  padding: "10px 13px",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  textDecoration: "none",
};

const analysisStyle: CSSProperties = {
  background: "#fffdf7",
  border: "1px solid #d6d3c7",
  borderLeft: "5px solid #991b1b",
  padding: 26,
  marginBottom: 26,
};

const sectionKickerStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: 2,
};

const summaryStyle: CSSProperties = {
  fontSize: 19,
  lineHeight: 1.65,
};

const sourcePanelStyle: CSSProperties = {
  background: "#fffaf0",
  border: "1px solid #d6d3c7",
  padding: 24,
  marginBottom: 26,
};

const smallTitleStyle: CSSProperties = {
  marginTop: 0,
  fontFamily: "serif",
  fontSize: 30,
};

const sourceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
};

const sourceCardStyle: CSSProperties = {
  background: "#fffdf7",
  border: "1px solid #d6d3c7",
  padding: 18,
};

const plainLinkStyle: CSSProperties = {
  color: "#111827",
  fontWeight: 900,
};

const votePanelStyle: CSSProperties = {
  background: "#fffdf7",
  border: "1px solid #d6d3c7",
  padding: 24,
};

const voteTextStyle: CSSProperties = {
  fontWeight: 900,
};

const progressStyle: CSSProperties = {
  height: 10,
  background: "#e5e7eb",
  marginBottom: 18,
};

const progressFillStyle: CSSProperties = {
  height: "100%",
  background: "#16a34a",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const voteButtonStyle: CSSProperties = {
  padding: "12px 18px",
  background: "#111827",
  color: "white",
  border: "1px solid #111827",
  fontWeight: 900,
  cursor: "pointer",
};

const voteButtonSecondaryStyle: CSSProperties = {
  padding: "12px 18px",
  background: "#fffaf0",
  color: "#111827",
  border: "1px solid #111827",
  fontWeight: 900,
  cursor: "pointer",
};

const thanksStyle: CSSProperties = {
  fontWeight: 900,
  color: "#166534",
};

const buttonStyle: CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  background: "#111827",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
};
const previewBannerStyle: CSSProperties = {
  background: "#991b1b",
  color: "white",
  padding: "10px 16px",
  fontWeight: 900,
  textAlign: "center",
  marginBottom: 16,
};