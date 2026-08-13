"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders } from '@/lib/clientAuth';

type Comparison = {
  id: string;
  title: string;
  slug: string;
  status: string;
  left_actor: string;
  right_actor: string;
  left_headline?: string;
  right_headline?: string;
  left_body?: string;
  right_body?: string;
  created_at?: string;
};

export default function DashboardStats() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<Comparison[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [leftHeadline, setLeftHeadline] = useState("");
  const [rightHeadline, setRightHeadline] = useState("");
  const [leftBody, setLeftBody] = useState("");
  const [rightBody, setRightBody] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setLeft("");
    setRight("");
    setLeftHeadline("");
    setRightHeadline("");
    setLeftBody("");
    setRightBody("");
  };

  const loadItems = async () => {
    const { data, error } = await supabase
      .from("comparisons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setItems(data || []);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const makeSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "AI hiba");
        return;
      }

      const parsed = data.result || data;

      setTitle(parsed.title || "");
      setLeft(parsed.left_actor || "");
      setRight(parsed.right_actor || "");
      setLeftHeadline(parsed.left_headline || "");
      setRightHeadline(parsed.right_headline || "");
      setLeftBody(parsed.left_body || "");
      setRightBody(parsed.right_body || "");
    } catch (err) {
      console.error(err);
      alert("AI hiba");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        title,
        topic: title,
        slug: editingId ? undefined : `${makeSlug(title)}-${Date.now()}`,
        left_actor: left,
        right_actor: right,
        left_headline: leftHeadline,
        right_headline: rightHeadline,
        left_body: leftBody,
        right_body: rightBody,
        status: "draft",
      };

      const response = await fetch(editingId ? `/api/admin/comparisons/${editingId}` : "/api/admin/comparisons", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        alert((await response.json().catch(() => null))?.error || "Mentési hiba");
        return;
      }

      alert(editingId ? "Frissítve!" : "Mentve!");
      resetForm();
      await loadItems();
    } catch (err) {
      console.error(err);
      alert("Mentési hiba");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Comparison) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setLeft(item.left_actor || "");
    setRight(item.right_actor || "");
    setLeftHeadline(item.left_headline || "");
    setRightHeadline(item.right_headline || "");
    setLeftBody(item.left_body || "");
    setRightBody(item.right_body || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Biztos törlöd?")) return;

    const response = await fetch(`/api/admin/comparisons/${id}`, { method: "DELETE", headers: await getAuthHeaders() });
    if (!response.ok) {
      alert((await response.json().catch(() => null))?.error || "Törlési hiba");
      return;
    }

    await loadItems();
  };

  const handlePublish = async (id: string) => {
    const response = await fetch(`/api/admin/comparisons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({ status: "published" }),
    });
    if (!response.ok) {
      alert((await response.json().catch(() => null))?.error || "Publikálási hiba");
      return;
    }

    await loadItems();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">AI generálás</h2>

        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          className="min-h-[110px] w-full rounded-2xl border border-slate-200 px-4 py-4"
          placeholder="Írj be egy témát..."
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 rounded-2xl bg-indigo-600 text-white px-5 py-3 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Dolgozik..." : "AI generálás"}
        </button>
      </section>

      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">
          {editingId ? "Téma szerkesztése" : "Új téma felvitele"}
        </h2>

        <div className="space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-4" placeholder="Cím" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={left} onChange={(e) => setLeft(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-4" placeholder="Bal oldal neve" />
            <input value={right} onChange={(e) => setRight(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-4" placeholder="Jobb oldal neve" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={leftHeadline} onChange={(e) => setLeftHeadline(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-4" placeholder="Bal headline" />
            <input value={rightHeadline} onChange={(e) => setRightHeadline(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-4" placeholder="Jobb headline" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea value={leftBody} onChange={(e) => setLeftBody(e.target.value)} className="min-h-[160px] rounded-2xl border border-slate-200 px-4 py-4" placeholder="Bal oldal szöveg" />
            <textarea value={rightBody} onChange={(e) => setRightBody(e.target.value)} className="min-h-[160px] rounded-2xl border border-slate-200 px-4 py-4" placeholder="Jobb oldal szöveg" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-slate-900 text-white px-5 py-3 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Mentés..." : editingId ? "Frissítés" : "Mentés draftként"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-2xl bg-slate-100 text-slate-700 px-5 py-3 text-sm font-medium"
              >
                Mégse
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Mentett témák</h2>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex justify-between gap-4">
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-slate-500">
                    {item.left_actor} vs {item.right_actor}
                  </div>
                </div>
                <span className="text-xs rounded-full bg-slate-100 px-3 py-1 h-fit">
                  {item.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => handleEdit(item)} className="rounded-xl bg-blue-50 text-blue-700 px-3 py-2 text-sm">
                  Szerkesztés
                </button>

                <button onClick={() => handlePublish(item.id)} className="rounded-xl bg-green-50 text-green-700 px-3 py-2 text-sm">
                  Publikálás
                </button>

                <button onClick={() => handleDelete(item.id)} className="rounded-xl bg-red-50 text-red-700 px-3 py-2 text-sm">
                  Törlés
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-slate-500">Még nincs mentett téma.</div>
          )}
        </div>
      </section>
    </div>
  );
}
