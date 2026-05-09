"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, t, type Lang } from "@/lib/i18n";

type Item = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  language: string | null;
  old_statement: string | null;
  new_statement: string | null;
  old_date: string | null;
  new_date: string | null;
  old_source: string | null;
  new_source: string | null;
  old_video_url: string | null;
new_video_url: string | null;
  ai_summary: string | null;
  status: string | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
  vote_type: "yes" | "no";
};

export default function ContradictionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [item, setItem] = useState<Item | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [lang, setLang] = useState<Lang>("hu");

  useEffect(() => {
     setLang(detectBrowserLang());
    load();
  }, [slug]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contradictions")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error(error);
      setItem(null);
      setLoading(false);
      return;
    }

    if (!data) {
      setItem(null);
      setLoading(false);
      return;
    }

    setItem(data);

    const { data: voteData } = await supabase
      .from("contradiction_votes")
      .select("*")
      .eq("contradiction_id", data.id);

    setVotes((voteData || []) as Vote[]);

    const localVote = localStorage.getItem(`vote_${data.id}`);
    setVoted(Boolean(localVote));

    setLoading(false);
  }

  async function vote(type: "yes" | "no") {
    if (!item || voted) return;

    const { error } = await supabase.from("contradiction_votes").insert({
      contradiction_id: item.id,
      vote_type: type,
    });

    if (error) {
      alert("Szavazási hiba: " + error.message);
      return;
    }

    localStorage.setItem(`vote_${item.id}`, type);
    setVoted(true);
    await load();
  }

  
  function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("Link kimásolva");
}

function getShareText() {
  return `${item?.politician || "Politikus"} – ${
    item?.topic || "ellentmondás"
  }: régen mást mondott, mint most?`;
}

function shareUrl(
  platform: "x" | "facebook" | "whatsapp" | "telegram" | "reddit"
) {
  const publicUrl = `https://political-app-six.vercel.app/contradictions/${slug}`;
const url = encodeURIComponent(publicUrl);
  const text = encodeURIComponent(getShareText());

  const links = {
    x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    reddit: `https://www.reddit.com/submit?url=${url}&title=${text}`,
  };

  window.open(links[platform], "_blank", "noopener,noreferrer");
}
  function getYouTubeEmbedUrl(url: string | null) {
  if (!url) return null;

  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

const oldEmbedUrl = getYouTubeEmbedUrl(item?.old_video_url || null);
const newEmbedUrl = getYouTubeEmbedUrl(item?.new_video_url || null);

  const totalVotes = votes.length;
  const yesVotes = votes.filter((v) => v.vote_type === "yes").length;
  const noVotes = totalVotes - yesVotes;
  const yesPercent = totalVotes ? Math.round((yesVotes / totalVotes) * 100) : 0;
  const noPercent = totalVotes ? 100 - yesPercent : 0;

  if (loading) {
    return (
      <main style={pageStyle}>
        <section style={containerStyle}>{t[lang].loading}</section>
      </main>
    );
  }

  if (!item) {
    return (
      <main style={pageStyle}>
        <section style={containerStyle}>
          <a href="/contradictions" style={backStyle}>
            ← Vissza
          </a>

          <div style={emptyCardStyle}>
            <h1>{t[lang].notFound}</h1>
            <p>Lehet, hogy még draft/review státuszban van, vagy törölve lett.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <a href="/contradictions" style={backStyle}>
          ← ← {t[lang].back}
        </a>

        <header style={heroStyle}>
          <div style={badgeRowStyle}>
            <span style={darkBadgeStyle}>{item.topic || "Nincs téma"}</span>
            <span style={lightBadgeStyle}>
              {(item.language || "hu").toUpperCase()}
            </span>
          </div>

          <h1 style={titleStyle}>
            {item.politician || "Ismeretlen"} – {item.topic || "téma"}
          </h1>

          <p style={leadStyle}>
            Régi és új állítás összehasonlítása dátummal, forrással,
            AI-elemzéssel és közösségi szavazással.
          </p>

          <div style={shareRowStyle}>
  <button onClick={copyLink} style={shareButtonStyle}>
    🔗 {t[lang].copyLink}
  </button>

  <button onClick={() => shareUrl("x")} style={shareButtonStyle}>
    X
  </button>

  <button onClick={() => shareUrl("facebook")} style={shareButtonStyle}>
    Facebook
  </button>

  <button onClick={() => shareUrl("whatsapp")} style={shareButtonStyle}>
    WhatsApp
  </button>

  <button onClick={() => shareUrl("telegram")} style={shareButtonStyle}>
    Telegram
  </button>

  <button onClick={() => shareUrl("reddit")} style={shareButtonStyle}>
    Reddit
  </button>
</div>
        </header>
        <section style={timelineCardStyle}>
  <div style={timelineLineStyle} />

  <div style={timelineItemStyle}>
    <div style={timelineDotOldStyle}>1</div>
    <div>
      <div style={timelineLabelStyle}>RÉGEN</div>
      <div style={timelineDateStyle}>{item.old_date || t[lang].unknownDate}</div>
      <p style={timelineTextStyle}>
        {item.old_statement || "Nincs régi állítás"}
      </p>
    </div>
  </div>

  <div style={timelineItemStyle}>
    <div style={timelineDotNewStyle}>2</div>
    <div>
      <div style={timelineLabelStyle}>MOST</div>
     <div style={timelineDateStyle}>
  {item.new_date || t[lang].unknownDate}
</div> 
      <p style={timelineTextStyle}>
        {item.new_statement || "Nincs új állítás"}
      </p>
    </div>
  </div>
</section>

        <section style={compareGridStyle}>
          <article style={oldCardStyle}>
            <div style={kickerStyle}>{t[lang].old}</div>
            <div style={dateStyle}>{item.old_date || "{item.old_date || t[lang].unknownDate}"}</div>
            <p style={statementStyle}>
              {item.old_statement || "{t[lang].noOldStatement}"}
            </p>

            {item.old_source && (
              <a href={item.old_source} target="_blank" style={sourceButtonStyle}>
                {t[lang].openOldSource} →
              </a>
            )}
            {item.old_video_url && (
  <a href={item.old_video_url} target="_blank" style={videoButtonStyle}>
    {t[lang].openOldVideo} →
  </a>
)}
{oldEmbedUrl && (
  <iframe
    src={oldEmbedUrl}
    style={videoFrameStyle}
    allowFullScreen
  />
)}
          </article>

          <article style={newCardStyle}>
            <div style={kickerStyle}>{t[lang].now}</div>
            <div style={dateStyle}>{item.new_date || "{item.new_date || t[lang].unknownDate}"}</div>
            <p style={statementStyle}>
              {item.new_statement || "{t[lang].noNewStatement}"}
            </p>

            {item.new_source && (
              <a href={item.new_source} target="_blank" style={sourceButtonStyle}>
                {t[lang].openNewSource} →
              </a>
            )}
            {item.new_video_url && (
  <a href={item.new_video_url} target="_blank" style={videoButtonStyle}>
    {t[lang].openNewVideo} →
  </a>
)}
{newEmbedUrl && (
  <iframe
    src={newEmbedUrl}
    style={videoFrameStyle}
    allowFullScreen
  />
)}
          </article>
        </section>

        <section style={analysisCardStyle}>
          <div style={kickerStyle}>{t[lang].aiAnalysis.toUpperCase()}</div>
          <p style={analysisTextStyle}>
            {item.ai_summary || "Ehhez még nincs AI elemzés."}
          </p>
        </section>

        <section style={sourcesCardStyle}>
          <h2 style={sectionTitleStyle}>{t[lang].sources}</h2>

          <div style={sourceGridStyle}>
            <div style={sourceMiniCardStyle}>
              <strong>{t[lang].oldStatementSource}</strong>
              <p style={mutedTextStyle}>
                {item.old_source
  ? t[lang].externalSourceAvailable
  : "Nincs forrás megadva."
}
              </p>

              {item.old_source && (
                <a href={item.old_source} target="_blank" style={plainLinkStyle}>
                  {t[lang].openButton} →
                </a>
              )}
            </div>

            <div style={sourceMiniCardStyle}>
              <strong>{t[lang].newStatementSource}</strong>
              <p style={mutedTextStyle}>
                {item.new_source
  ? t[lang].externalSourceAvailable
  : "Nincs forrás megadva."
}
              </p>

              {item.new_source && (
                <a href={item.new_source} target="_blank" style={plainLinkStyle}>
                  {t[lang].openButton} →
                </a>
              )}
            </div>
          </div>
        </section>

        <section style={voteCardStyle}>
          <h2 style={sectionTitleStyle}>{t[lang].voteQuestion}</h2>

          <p style={voteTextStyle}>
            👍 {yesPercent}% {t[lang].yes} · 👎 {noPercent}% {t[lang].no} · {t[lang].total} {totalVotes} {t[lang].votes}
          </p>

          <div style={progressOuterStyle}>
            <div style={{ ...progressInnerStyle, width: `${yesPercent}%` }} />
          </div>

          <div style={buttonRowStyle}>
            <button
              disabled={voted}
              onClick={() => vote("yes")}
              style={voted ? disabledButtonStyle : voteYesButtonStyle}
            >
              👍 {t[lang].yes}
            </button>

            <button
              disabled={voted}
              onClick={() => vote("no")}
              style={voted ? disabledButtonStyle : voteNoButtonStyle}
            >
              👎 {t[lang].no}
            </button>
          </div>

          {voted && <p style={thanksStyle}>{t[lang].alreadyVoted}</p>}
        </section>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  color: "#0f172a",
  padding: "32px 18px",
};

const containerStyle: CSSProperties = {
  maxWidth: 1080,
  margin: "0 auto",
};

const backStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: 22,
  color: "#0f172a",
  fontWeight: 800,
  textDecoration: "none",
};

const heroStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 28,
  marginBottom: 22,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 14,
  flexWrap: "wrap",
};

const darkBadgeStyle: CSSProperties = {
  background: "#0f172a",
  color: "white",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
};

const lightBadgeStyle: CSSProperties = {
  background: "#e2e8f0",
  color: "#0f172a",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
};

const titleStyle: CSSProperties = {
  fontSize: 46,
  lineHeight: 1.05,
  margin: "0 0 12px",
  fontWeight: 900,
};

const leadStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.55,
  color: "#475569",
  maxWidth: 820,
  marginBottom: 16,
};

const shareButtonStyle: CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #0f172a",
  borderRadius: 10,
  background: "white",
  color: "#0f172a",
  cursor: "pointer",
  fontWeight: 800,
};

const compareGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 18,
  marginBottom: 22,
};

const oldCardStyle: CSSProperties = {
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  borderRadius: 18,
  padding: 22,
};

const newCardStyle: CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  borderRadius: 18,
  padding: 22,
};

const kickerStyle: CSSProperties = {
  fontSize: 13,
  letterSpacing: 1.5,
  fontWeight: 900,
  marginBottom: 10,
};

const dateStyle: CSSProperties = {
  fontSize: 15,
  color: "#475569",
  fontWeight: 800,
  marginBottom: 12,
};

const statementStyle: CSSProperties = {
  fontSize: 23,
  lineHeight: 1.35,
  marginBottom: 18,
};

const sourceButtonStyle: CSSProperties = {
  display: "inline-block",
  padding: "10px 13px",
  background: "#0f172a",
  color: "white",
  borderRadius: 10,
  fontWeight: 800,
  textDecoration: "none",
};

const analysisCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderLeft: "6px solid #991b1b",
  borderRadius: 18,
  padding: 24,
  marginBottom: 22,
};

const analysisTextStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.7,
  margin: 0,
};

const sourcesCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
  marginBottom: 22,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 26,
  marginTop: 0,
  marginBottom: 16,
  fontWeight: 900,
};

const sourceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
};

const sourceMiniCardStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 16,
};

const mutedTextStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.5,
};

const plainLinkStyle: CSSProperties = {
  color: "#0f172a",
  fontWeight: 900,
};

const voteCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
};

const voteTextStyle: CSSProperties = {
  fontWeight: 800,
  color: "#334155",
};

const progressOuterStyle: CSSProperties = {
  height: 12,
  background: "#e5e7eb",
  borderRadius: 999,
  overflow: "hidden",
  marginBottom: 16,
};

const progressInnerStyle: CSSProperties = {
  height: "100%",
  background: "#16a34a",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const voteYesButtonStyle: CSSProperties = {
  padding: "11px 16px",
  border: "none",
  borderRadius: 10,
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const voteNoButtonStyle: CSSProperties = {
  padding: "11px 16px",
  border: "1px solid #0f172a",
  borderRadius: 10,
  background: "white",
  color: "#0f172a",
  cursor: "pointer",
  fontWeight: 900,
};

const disabledButtonStyle: CSSProperties = {
  padding: "11px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "#e5e7eb",
  color: "#64748b",
  cursor: "not-allowed",
  fontWeight: 900,
};

const thanksStyle: CSSProperties = {
  marginTop: 12,
  color: "#166534",
  fontWeight: 800,
};

const emptyCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 28,
};
const videoButtonStyle: CSSProperties = {
  ...sourceButtonStyle,
  marginLeft: 8,
  background: "#7c3aed",
};
const videoFrameStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  border: "none",
  borderRadius: 14,
  marginTop: 14,
};

const timelineCardStyle: CSSProperties = {
  position: "relative",
  background: "white",
  border: "1px solid #dbe0e6",
  borderRadius: 18,
  padding: 24,
  marginBottom: 22,
  overflow: "hidden",
};

const timelineLineStyle: CSSProperties = {
  position: "absolute",
  left: 38,
  top: 34,
  bottom: 34,
  width: 3,
  background: "#cbd5e1",
};

const timelineItemStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "48px 1fr",
  gap: 14,
  marginBottom: 22,
  zIndex: 1,
};

const timelineDotOldStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "#4f46e5",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const timelineDotNewStyle: CSSProperties = {
  ...timelineDotOldStyle,
  background: "#16a34a",
};

const timelineLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const timelineDateStyle: CSSProperties = {
  color: "#64748b",
  fontWeight: 800,
  marginTop: 4,
  marginBottom: 8,
};

const timelineTextStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.55,
  margin: 0,
};
const shareRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 16,
};