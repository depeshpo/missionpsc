import type { CurrentAffairItem } from "@/lib/types";

// ---------------------------------------------------------------------------
// Dated current-affairs feed with a foreign-affairs focus. Placeholder seeds so
// the feed/detail flow is usable; real items are hand-authored later by editing
// RAW below. The UI reads everything through the accessors at the bottom.
// ---------------------------------------------------------------------------

type RawItem = Omit<CurrentAffairItem, "id"> & { id?: string };

const RAW: RawItem[] = [
  {
    date: "2026-06-09",
    scope: "international",
    title: "Nepal addresses LDC graduation timeline at UN session",
    summary: "Placeholder — Nepal reaffirmed its smooth-transition strategy ahead of its scheduled graduation from Least Developed Country status.",
    body: [
      "Placeholder paragraph. Nepal is set to graduate from the LDC category, and the delegation outlined measures to sustain trade preferences and concessional financing during the transition.",
      "Placeholder paragraph. The statement linked graduation to the wider agenda of economic diplomacy and export diversification.",
    ],
    source: { title: "Ministry of Foreign Affairs", href: "https://mofa.gov.np/" },
    tags: ["UN", "LDC", "economic diplomacy"],
  },
  {
    date: "2026-06-08",
    scope: "national",
    title: "Cabinet endorses revised foreign employment directives",
    summary: "Placeholder — new directives aim to strengthen protections for migrant workers and streamline labour-permit processing.",
    body: [
      "Placeholder paragraph covering the key provisions and their relevance to remittance-driven growth.",
    ],
    tags: ["foreign employment", "remittance"],
  },
  {
    date: "2026-06-06",
    scope: "international",
    title: "BIMSTEC senior officials meet on connectivity",
    summary: "Placeholder — member states reviewed progress on transport and energy connectivity projects.",
    source: { title: "BIMSTEC Secretariat", href: "https://bimstec.org/" },
    tags: ["BIMSTEC", "regionalism"],
  },
  {
    date: "2026-06-05",
    scope: "national",
    title: "Parliament discusses ratification of a new bilateral agreement",
    summary: "Placeholder — lawmakers debated the treaty-making process and parliamentary oversight of international agreements.",
    tags: ["treaty", "parliament"],
  },
  {
    date: "2026-06-03",
    scope: "international",
    title: "Climate finance pledges reviewed at regional forum",
    summary: "Placeholder — discussions focused on adaptation funding for mountain economies and the carbon-trade framework.",
    tags: ["climate change", "carbon trade"],
  },
  {
    date: "2026-06-01",
    scope: "national",
    title: "MoFA hosts briefing for newly appointed envoys",
    summary: "Placeholder — outgoing heads of mission were briefed on national interest priorities and economic diplomacy targets.",
    tags: ["MoFA", "diplomacy"],
  },
  {
    date: "2026-05-28",
    scope: "international",
    title: "Nepal contributes to UN peacekeeping rotation",
    summary: "Placeholder — a new contingent was deployed, reaffirming Nepal's standing as a leading troop-contributing country.",
    source: { title: "UN Peacekeeping", href: "https://peacekeeping.un.org/" },
    tags: ["UN", "peacekeeping"],
  },
  {
    date: "2026-05-25",
    scope: "national",
    title: "Trade deficit figures prompt export-strategy review",
    summary: "Placeholder — fresh data renewed calls to operationalize economic diplomacy and diversify export markets.",
    tags: ["trade", "economic diplomacy"],
  },
];

// --- Build typed items with generated ids, sorted newest first ---
function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const currentAffairs: CurrentAffairItem[] = RAW.map((r) => ({
  ...r,
  id: r.id ?? `${r.date}-${slug(r.title).slice(0, 40).replace(/-+$/, "")}`,
})).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

// --- Accessors (the data boundary — read through these, not the array) ---
export function getCurrentAffair(id: string): CurrentAffairItem | undefined {
  return currentAffairs.find((i) => i.id === id);
}

/** Distinct tags across all items, alphabetical — for the feed filter. */
export function allTags(): string[] {
  const set = new Set<string>();
  for (const item of currentAffairs) for (const t of item.tags ?? []) set.add(t);
  return [...set].sort();
}

/** Format an ISO date as e.g. "9 Jun 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
}
