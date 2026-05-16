"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Registration successful. Check your email if confirmation is enabled.");
    window.location.href = "/login";
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">
      <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
          Create account
        </p>

        <h1 className="mt-3 text-4xl font-bold">Register</h1>

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
            onClick={register}
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-3 font-bold text-black transition hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "Loading..." : "Create account"}
          </button>
        </div>

        <p className="mt-6 text-sm text-neutral-400">
          Already have an account?{" "}
          <a href="/login" className="text-white underline">
            Login
          </a>
        </p>
      </section>
    </main>
  );
}