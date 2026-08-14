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
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Jelszó"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {message ? (
          <p style={{ color: messageType === "error" ? "#b91c1c" : "#047857", margin: "4px 0 12px" }} role="alert">
            {message}
          </p>
        ) : null}

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
