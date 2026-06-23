import type { Resource } from "@/lib/types";

// ---------------------------------------------------------------------------
// Curated external resources for study: Acts, treaties, conventions, govt and
// MoFA portals, organizations, references and books. Placeholder seeds; the real
// list is hand-authored later by editing RAW. UI reads via the accessors below.
// ---------------------------------------------------------------------------

type RawResource = { title: string; category: string; url: string; description?: string };

// Category order is the display order on the page.
const RAW: RawResource[] = [
  // Constitution & Acts
  { title: "Constitution of Nepal, 2015", category: "Constitution & Acts", url: "https://lawcommission.gov.np/", description: "Full text via the Nepal Law Commission." },
  { title: "Civil Service Act & Rules", category: "Constitution & Acts", url: "https://lawcommission.gov.np/", description: "Governing law for the civil service." },
  // Treaties
  { title: "Nepal–India Treaty of Peace and Friendship, 1950", category: "Treaties", url: "https://mofa.gov.np/", description: "Foundational bilateral treaty." },
  { title: "Nepal–China Treaty of Peace and Friendship, 1960", category: "Treaties", url: "https://mofa.gov.np/", description: "Basis for boundary settlement." },
  // Vienna Conventions
  { title: "Vienna Convention on Diplomatic Relations, 1961", category: "Vienna Conventions", url: "https://legal.un.org/ilc/texts/instruments/english/conventions/9_1_1961.pdf", description: "VCDR — diplomatic privileges & immunities." },
  { title: "Vienna Convention on Consular Relations, 1963", category: "Vienna Conventions", url: "https://legal.un.org/ilc/texts/instruments/english/conventions/9_2_1963.pdf", description: "VCCR — consular functions & immunities." },
  // Government & MoFA
  { title: "Ministry of Foreign Affairs (MoFA)", category: "Government & MoFA", url: "https://mofa.gov.np/", description: "Statements, treaties, mission directory." },
  { title: "Public Service Commission (Lok Sewa Aayog)", category: "Government & MoFA", url: "https://psc.gov.np/", description: "Syllabus, notices, results." },
  { title: "Nepal Law Commission", category: "Government & MoFA", url: "https://lawcommission.gov.np/", description: "Acts, rules and the Constitution." },
  // International Organizations
  { title: "United Nations", category: "International Organizations", url: "https://www.un.org/", description: "Charter, organs, peacekeeping." },
  { title: "SAARC Secretariat", category: "International Organizations", url: "https://www.saarc-sec.org/", description: "South Asian regional cooperation." },
  { title: "BIMSTEC", category: "International Organizations", url: "https://bimstec.org/", description: "Bay of Bengal cooperation." },
  // Portals & References
  { title: "United Nations Treaty Collection", category: "Portals & References", url: "https://treaties.un.org/", description: "Authoritative treaty texts & status." },
  // Books
  { title: "Nepal's Foreign Policy (reference reading)", category: "Books", url: "https://mofa.gov.np/", description: "Placeholder — add standard texts here." },
];

// --- Build typed resources with generated ids ---
export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Stable id for a resource from its title: `res-<slug>` (the same shape as the
 * seed). Falls back to / disambiguates with a short random suffix when the slug
 * is empty or already taken. Call this in event handlers, never during render
 * (`crypto.randomUUID()` is impure).
 */
export function makeResourceId(title: string, taken: string[] = []): string {
  const base = `res-${slug(title).slice(0, 48).replace(/-+$/, "")}`;
  if (base !== "res-" && !taken.includes(base)) return base;
  return `${base === "res-" ? "res" : base}-${crypto.randomUUID().slice(0, 4)}`;
}

export const resources: Resource[] = RAW.map((r) => ({
  id: `res-${slug(r.title).slice(0, 48).replace(/-+$/, "")}`,
  title: r.title,
  category: r.category,
  url: r.url,
  description: r.description,
}));

// --- Accessors (the data boundary — read through these, not the array) ---
/** Distinct categories in seed (display) order. */
export function categories(): string[] {
  const out: string[] = [];
  for (const r of resources) if (!out.includes(r.category)) out.push(r.category);
  return out;
}

export function resourcesByCategory(category: string): Resource[] {
  return resources.filter((r) => r.category === category);
}

export function getResource(id: string): Resource | undefined {
  return resources.find((r) => r.id === id);
}
