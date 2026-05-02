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

    alert("Sikeres belépés!");
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
          width: 360,
          padding: 24,
          border: "1px solid #111827",
          background: "white",
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>
          Bejelentkezés
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 16,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={login}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#111827",
            color: "white",
            fontWeight: 700,
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          Belépés
        </button>

        <button
          onClick={register}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #111827",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Regisztráció
        </button>
      </div>
    </main>
  );
}