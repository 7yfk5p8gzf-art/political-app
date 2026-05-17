"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { detectBrowserLanguage, getPublicLabels } from "@/lib/getPublicLabels";

type Vote = {
  id: string;
  vote_type: "yes" | "no";
};

type VoteSectionProps = {
  contradictionId: string;
};

export default function VoteSection({ contradictionId }: VoteSectionProps) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setLang(detectBrowserLanguage());

    function handleLanguageChange() {
      setLang(detectBrowserLanguage());
    }

    window.addEventListener("language-change", handleLanguageChange);

    return () => {
      window.removeEventListener("language-change", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    loadVotes();

    const savedVote = localStorage.getItem(`vote_${contradictionId}`);
    setHasVoted(Boolean(savedVote));
  }, [contradictionId]);

  async function loadVotes() {
    const { data } = await supabase
      .from("contradiction_votes")
      .select("id, vote_type")
      .eq("contradiction_id", contradictionId);

    setVotes((data || []) as Vote[]);
  }

  async function vote(type: "yes" | "no") {
    if (hasVoted) return;

    await supabase.from("contradiction_votes").insert({
      contradiction_id: contradictionId,
      vote_type: type,
    });

    localStorage.setItem(`vote_${contradictionId}`, type);
    setHasVoted(true);
    await loadVotes();
  }

  const labels = getPublicLabels(lang);

  const stats = useMemo(() => {
    const yes = votes.filter((vote) => vote.vote_type === "yes").length;
    const no = votes.filter((vote) => vote.vote_type === "no").length;
    const total = yes + no;

    return {
      yes,
      no,
      total,
      yesPercent: total ? Math.round((yes / total) * 100) : 0,
      noPercent: total ? Math.round((no / total) * 100) : 0,
    };
  }, [votes]);

  return (
    <section className="mt-8 rounded-xl border border-white/10 bg-black/30 p-5">
      <p className="mb-2 text-xs uppercase tracking-wide text-neutral-400">
        {labels.communityVote}
      </p>

      <h2 className="text-2xl font-bold">{labels.contradictionQuestion}</h2>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => vote("yes")}
          disabled={hasVoted}
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {labels.yes} ({stats.yesPercent}%)
        </button>

        <button
          onClick={() => vote("no")}
          disabled={hasVoted}
          className="rounded-xl border border-white/20 px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          {labels.no} ({stats.noPercent}%)
        </button>
      </div>

      <p className="mt-4 text-sm text-neutral-400">
        {labels.totalVotes}: {stats.total}
      </p>
    </section>
  );
}