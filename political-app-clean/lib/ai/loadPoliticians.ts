import { supabase } from "@/lib/supabase";

export async function loadPoliticians() {
  const { data, error } = await supabase
    .from("politicians")
    .select("full_name, slug, country");

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}