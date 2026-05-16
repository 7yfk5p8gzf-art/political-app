"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from("contradictions")
        .select("*")
        .limit(1);

      console.log("DATA:", data);
      console.log("ERROR:", error);
    }

    test();
  }, []);

  return (
    <main className="p-10 text-white">
      <h1 className="text-3xl font-bold">Supabase Test</h1>
      <p className="mt-4 text-neutral-400">
        Check browser console.
      </p>
    </main>
  );
}