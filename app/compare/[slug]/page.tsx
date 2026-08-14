"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function OldCompareRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug);

  useEffect(() => {
    async function redirect() {
      const { data } = await supabase
        .from("contradictions")
        .select("slug")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .maybeSingle();

      if (data?.slug) {
        router.replace(`/contradictions/${data.slug}`);
        return;
      }

      router.replace("/contradictions");
    }

    redirect();
  }, [router, slug]);

  return (
    <PublicPageShell>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" aria-hidden="true" />
        <p className="font-semibold text-slate-700">Átirányítás az összehasonlításhoz…</p>
      </div>
    </PublicPageShell>
  );
}
