import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/lib/types";

// Server-only DB accessors for the resources collection (B1). Rows ordered by
// `position` to preserve the curated display order.

type ResourceRow = {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string | null;
};

export async function getResources(): Promise<Resource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("position");
  if (error) throw error;
  return ((data ?? []) as ResourceRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    url: r.url,
    description: r.description ?? undefined,
  }));
}

export async function getResource(id: string): Promise<Resource | undefined> {
  return (await getResources()).find((r) => r.id === id);
}
