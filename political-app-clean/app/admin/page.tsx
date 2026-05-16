"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [sourcesCount, setSourcesCount] = useState(0);
const [contradictionsCount, setContradictionsCount] = useState(0);
const [publishedCount, setPublishedCount] = useState(0);
const [reviewCount, setReviewCount] = useState(0);
const [draftCount, setDraftCount] = useState(0);
const [userRole, setUserRole] = useState<string | null>(null);
const [latestContradictions, setLatestContradictions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
    if (user) {
  loadDashboard();
}
  }, [user, loading]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-neutral-400">Checking access...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }
  async function loadDashboard() {
  const { count: sources } = await supabase
    .from("sources")
    .select("*", { count: "exact", head: true });

  const { count: contradictions } = await supabase
    .from("contradictions")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const { count: published } = await supabase
    .from("contradictions")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .is("deleted_at", null);

  const { count: review } = await supabase
    .from("contradictions")
    .select("*", { count: "exact", head: true })
    .eq("status", "review")
    .is("deleted_at", null);

  const { count: draft } = await supabase
    .from("contradictions")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft")
    .is("deleted_at", null);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

    const { data: latest } = await supabase
  .from("contradictions")
  .select("id, slug, politician, topic, status")
  .is("deleted_at", null)
  .order("created_at", { ascending: false })
  .limit(5);

  setSourcesCount(sources || 0);
  setContradictionsCount(contradictions || 0);
  setPublishedCount(published || 0);
  setReviewCount(review || 0);
  setDraftCount(draft || 0);
  setUserRole(profile?.role || null);
  setLatestContradictions(latest || []);
}

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
        Admin
      </p>

      <h1 className="mt-3 text-4xl font-bold">Admin Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-5">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <p className="text-sm text-neutral-400">Sources</p>
    <p className="mt-2 text-3xl font-bold">{sourcesCount}</p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <p className="text-sm text-neutral-400">Contradictions</p>
    <p className="mt-2 text-3xl font-bold">
      {contradictionsCount}
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <p className="text-sm text-neutral-400">Published</p>
    <p className="mt-2 text-3xl font-bold text-green-300">
      {publishedCount}
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <p className="text-sm text-neutral-400">Review</p>
    <p className="mt-2 text-3xl font-bold text-yellow-300">
      {reviewCount}
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <p className="text-sm text-neutral-400">Draft</p>
    <p className="mt-2 text-3xl font-bold text-neutral-300">
      {draftCount}
    </p>
  </div>
</div>
<div className="mt-8 flex flex-wrap gap-3">
  <a
    href="/admin/ai-search"
    className="rounded-full bg-purple-500/20 px-5 py-3 text-sm font-semibold text-purple-200 hover:bg-purple-500/30"
  >
    🤖 AI Search
  </a>

  <a
    href="/admin/sources"
    className="rounded-full bg-blue-500/20 px-5 py-3 text-sm font-semibold text-blue-200 hover:bg-blue-500/30"
  >
    ➕ New Source
  </a>

  <a
    href="/admin/contradictions"
    className="rounded-full bg-green-500/20 px-5 py-3 text-sm font-semibold text-green-200 hover:bg-green-500/30"
  >
    ➕ New Contradiction
  </a>

  <a
    href="/admin/contradictions?status=review"
    className="rounded-full bg-yellow-500/20 px-5 py-3 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/30"
  >
    🧠 Review Queue
  </a>
</div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <a
          href="/admin/sources"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
        >
          Sources
        </a>

        <a
          href="/admin/contradictions"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
        >
          Contradictions
        </a>

        <a
          href="/admin/users"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
        >
          Users / Roles
        </a>
      </div>
      <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
  <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral-500">
    Latest contradictions
  </p>

  <div className="space-y-3">
    {latestContradictions.map((item) => (
      <a
        key={item.id}
        href={`/admin/contradictions/${item.id}`}
        className="block rounded-2xl border border-white/10 bg-black/30 p-4 hover:bg-white/10"
      >
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase">
            {item.status || "draft"}
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase">
            {item.politician || "Unknown"}
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase">
            {item.topic || "No topic"}
          </span>
        </div>

        <p className="font-semibold">
          {item.slug || "Untitled contradiction"}
        </p>
      </a>
    ))}
  </div>
</section>
    </main>
  );
}