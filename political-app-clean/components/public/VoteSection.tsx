"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getPublicLabels } from "@/lib/getPublicLabels";
import { usePublicLanguage } from "@/lib/usePublicLanguage";

type Lang = "hu" | "de" | "en" | "fr";

type Vote = {
  id: string;
  vote_type: "yes" | "no";
};

type VoteSectionProps = {
  contradictionId: string;
};

export default function VoteSection({ contradictionId }: VoteSectionProps) {
  const lang = usePublicLanguage() as Lang;
  const labels = getPublicLabels(lang);

  const [votes, setVotes] = useState<Vote[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

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
    if (hasVoted || voting) return;

    setVoting(true);

    const { error } = await supabase.from("contradiction_votes").insert({
      contradiction_id: contradictionId,
      vote_type: type,
    });

    if (!error) {
      localStorage.setItem(`vote_${contradictionId}`, type);
      setHasVoted(true);
      await loadVotes();
    }

    setVoting(false);
  }

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
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
        {labels.communityVote}
      </p>

      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
        {labels.contradictionQuestion}
      </h2>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <button
          onClick={() => vote("yes")}
          disabled={hasVoted || voting}
          className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-200"
        >
          {labels.yes} ({stats.yesPercent}%)
        </button>

        <button
          onClick={() => vote("no")}
          disabled={hasVoted || voting}
          className="rounded-2xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-900 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-white dark:hover:border-blue-400 dark:hover:text-blue-300"
        >
          {labels.no} ({stats.noPercent}%)
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{ width: `${stats.yesPercent}%` }}
        />
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {labels.totalVotes}: {stats.total}
      </p>

      {hasVoted && (
        <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
          {labels.alreadyVoted}
        </p>
      )}
    </section>
  );
}