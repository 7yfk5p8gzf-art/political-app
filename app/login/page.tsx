"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

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

  async function register() {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data?.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          role: "editor",
        },
      ]);
    }

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Regisztráció sikeres! Jelentkezz be.");
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  }

  async function loginWithApple() {
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f1e8",
      }}
    >
      <div
        style={{
          width: 380,
          padding: 26,
          border: "1px solid #111827",
          background: "white",
          borderRadius: 18,
          boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
        }}
      >
        <h1 style={{ fontSize: 30, marginBottom: 8 }}>Bejelentkezés</h1>

        <p style={{ color: "#64748b", marginBottom: 20 }}>
          Lépj be emaillel, Google-fiókkal vagy Apple ID-val.
        </p>

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          style={socialButtonStyle}
        >
          Continue with Google
        </button>

        <button
          onClick={loginWithApple}
          disabled={loading}
          style={socialButtonStyle}
        >
          Continue with Apple
        </button>

        <div style={dividerStyle}>vagy emaillel</div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={login} disabled={loading} style={primaryButtonStyle}>
          Belépés
        </button>

        <button onClick={register} disabled={loading} style={secondaryButtonStyle}>
          Regisztráció
        </button>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 10,
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  fontSize: 15,
};

const primaryButtonStyle = {
  width: "100%",
  padding: 12,
  background: "#111827",
  color: "white",
  fontWeight: 800,
  marginBottom: 10,
  cursor: "pointer",
  borderRadius: 10,
  border: "none",
};

const secondaryButtonStyle = {
  width: "100%",
  padding: 12,
  border: "1px solid #111827",
  fontWeight: 800,
  cursor: "pointer",
  borderRadius: 10,
  background: "white",
};

const socialButtonStyle = {
  width: "100%",
  padding: 12,
  border: "1px solid #111827",
  background: "#f8fafc",
  color: "#111827",
  fontWeight: 900,
  cursor: "pointer",
  borderRadius: 10,
  marginBottom: 10,
};

const dividerStyle = {
  textAlign: "center" as const,
  color: "#64748b",
  fontWeight: 800,
  margin: "16px 0",
};