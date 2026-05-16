"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">
      <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
          Welcome back
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Login
        </h1>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
          />

          <button
            onClick={login}
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-3 font-bold text-black transition hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </div>

        <p className="mt-6 text-sm text-neutral-400">
          No account yet?{" "}
          <a
            href="/register"
            className="text-white underline"
          >
            Register
          </a>
        </p>
      </section>
    </main>
  );
}