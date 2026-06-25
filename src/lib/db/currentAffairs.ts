import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CurrentAffairItem } from "@/lib/types";

// Server-only DB accessors for the current-affairs feed (B1). Newest-first
// (date desc), with id as a stable tiebreaker for same-date items.

type CurrentAffairRow = {
  id: string;
  date: string;
  scope: "national" | "international";
  title: string;
  summary: string;
  body: string[] | null;
  source_title: string | null;
  source_href: string | null;
  tags: string[] | null;
};

function toItem(r: CurrentAffairRow): CurrentAffairItem {
  return {
    id: r.id,
    date: r.date,
    scope: r.scope,
    title: r.title,
    summary: r.summary,
    body: r.body && r.body.length ? r.body : undefined,
    source: r.source_href
      ? { title: r.source_title ?? r.source_href, href: r.source_href }
      : undefined,
    tags: r.tags && r.tags.length ? r.tags : undefined,
  };
}

export async function getCurrentAffairs(): Promise<CurrentAffairItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("current_affairs")
    .select("*")
    .order("date", { ascending: false })
    .order("id");
  if (error) throw error;
  return ((data ?? []) as CurrentAffairRow[]).map(toItem);
}

export async function getCurrentAffair(
  id: string,
): Promise<CurrentAffairItem | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("current_affairs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toItem(data as CurrentAffairRow) : undefined;
}
