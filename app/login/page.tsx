"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) window.location.href = getSafeNextPath();
    });
  }, []);

  function getSafeNextPath() {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  }

  async function login() {
    if (!email.trim() || !password) {
      setMessageType("error");
      setMessage("Add meg az email címedet és a jelszavadat.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    window.location.href = getSafeNextPath();
  }

  async function register() {
    if (!email.trim() || password.length < 8) {
      setMessageType("error");
      setMessage("A regisztrációhoz érvényes email és legalább 8 karakteres jelszó szükséges.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: email.split("@")[0] } },
    });

    setLoading(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    setMessageType("success");
    setMessage(data.session ? "Regisztráció sikeres, most már beléphetsz." : "Regisztráció sikeres. Ellenőrizd az email címedet a belépéshez.");
  }

  async function loginWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setLoading(false);
      setMessageType("error");
      setMessage(error.message);
    }
  }

  async function loginWithApple() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setLoading(false);
      setMessageType("error");
      setMessage(error.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef1f4] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] sm:p-8">
        <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Political Intelligence</div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Bejelentkezés</h1>
        </div>

        <p className="mb-5 text-sm leading-6 text-slate-600">
          Lépj be emaillel, Google-fiókkal vagy Apple ID-val.
        </p>

        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={loading}
          className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={loginWithApple}
          disabled={loading}
          className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue with Apple
        </button>

        <div style={dividerStyle}>vagy emaillel</div>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">Email</span>
          <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-600 focus:ring-4 focus:ring-amber-400/20"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">Jelszó</span>
          <input
          type="password"
          placeholder="Jelszó"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-600 focus:ring-4 focus:ring-amber-400/20"
          />
        </label>

        {message ? (
          <p className={`mb-3 rounded-xl border px-3 py-2 text-sm ${messageType === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`} role="alert">
            {message}
          </p>
        ) : null}

        <button type="button" onClick={login} disabled={loading} className="mb-3 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
          Belépés
        </button>

        <button type="button" onClick={register} disabled={loading} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
          Regisztráció
        </button>
      </div>
    </main>
  );
}

const dividerStyle = {
  textAlign: "center" as const,
  color: "#64748b",
  fontWeight: 800,
  margin: "16px 0",
};
