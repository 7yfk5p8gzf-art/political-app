"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Contradiction = {
  id: string;
  slug: string | null;
  politician: string | null;
  topic: string | null;
  old_statement: string | null;
  new_statement: string | null;
  status: string | null;
  created_at: string | null;
};

export default function AdminContradictionsPage() {
  const [items, setItems] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userRole, setUserRole] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    loadContradictions();
loadUserRole();
const urlStatus = searchParams.get("status");

if (urlStatus) {
  setStatusFilter(urlStatus);
}
  }, []);

  async function loadContradictions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contradictions")
.select("*")
.is("deleted_at", null)
.order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setItems([]);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }
  async function updateStatus(id: string, status: string) {
  const { error } = await supabase
    .from("contradictions")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Status update failed");
    return;
  }

  await loadContradictions();
}
async function loadUserRole() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  setUserRole(data?.role || null);
}
const canPublish =
  userRole === "admin" || userRole === "main_admin" || userRole === "superadmin";
  const filteredItems = items.filter((item) => {
  const text = [
    item.slug,
    item.politician,
    item.topic,
    item.old_statement,
    item.new_statement,
    item.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());
const matchesStatus =
  statusFilter === "all" || item.status === statusFilter;

return matchesSearch && matchesStatus;
});
async function deleteContradiction(id: string) {
  const confirmed = confirm(
    "Biztos törölni akarod ezt a contradictiont?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("contradictions")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Delete failed");
    return;
  }

  await loadContradictions();
}

  return (
    <main className="min-h-screen bg-black px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-neutral-500">
          Admin Contradictions
        </p>

        <h1 className="text-4xl font-bold">Contradiction Workflow</h1>

        <p className="mt-3 text-neutral-400">
          Draft, review és publish folyamat a politikai ellentmondásokhoz.
        </p>
        <div className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-neutral-300">
  Current role: {userRole || "unknown"}
</div>
        <input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search contradictions..."
  className="mt-8 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none"
/><div className="mt-4 flex flex-wrap gap-2">
  {["all", "draft", "review", "published"].map((status) => (
    <button
      key={status}
      onClick={() => setStatusFilter(status)}
      className={`rounded-full px-4 py-2 text-sm uppercase ${
        statusFilter === status
          ? "bg-white text-black"
          : "bg-white/10 text-white"
      }`}
    >
      {status}
    </button>
  ))}
</div>

        {loading && <p className="mt-10 text-neutral-400">Loading...</p>}

        {!loading && items.length === 0 && (
          <p className="mt-10 text-neutral-400">Nincs még contradiction.</p>
        )}

        <div className="mt-10 space-y-6">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-white/10 bg-white/[0.07] p-6"
            >
              <div className="mb-4 flex flex-wrap gap-2">
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

              <h2 className="text-2xl font-bold">
                {item.slug || "Untitled contradiction"}
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-neutral-500">
                    Old statement
                  </p>
                  <p className="text-neutral-200">
                    {item.old_statement || "Nincs régi állítás."}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-neutral-500">
                    New statement
                  </p>
                  <p className="text-neutral-200">
                    {item.new_statement || "Nincs új állítás."}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
  <button
    onClick={() => updateStatus(item.id, "draft")}
    className="rounded-full bg-white/10 px-4 py-2 text-sm"
  >
    Draft
  </button>

  <button
    onClick={() => updateStatus(item.id, "review")}
    className="rounded-full bg-yellow-500/20 px-4 py-2 text-sm text-yellow-200"
  >
    Review
  </button>

  {canPublish && (
  <button
    onClick={() => updateStatus(item.id, "published")}
    className="rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-200"
  >
    Publish
  </button>
)}
    <a
  href={`/admin/contradictions/${item.id}`}
  className="rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-200"
>
  Edit
</a>

{canPublish && (
  <button
    onClick={() => deleteContradiction(item.id)}
    className="rounded-full bg-red-500/20 px-4 py-2 text-sm text-red-200"
  >
    Delete
  </button>
)}

  
</div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}