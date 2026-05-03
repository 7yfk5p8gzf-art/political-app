"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
    <main style={{ padding: 32 }}>
      Átirányítás az új cikk oldalra...
    </main>
  );
}