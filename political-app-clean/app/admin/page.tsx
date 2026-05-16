"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
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

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
        Admin
      </p>

      <h1 className="mt-3 text-4xl font-bold">Admin Dashboard</h1>

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
    </main>
  );
}