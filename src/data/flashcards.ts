import type { Deck, Flashcard } from "@/lib/types";

// ---------------------------------------------------------------------------
// Flashcard decks for rote recall (diplomatic terms, treaties, Vienna articles,
// IR theories, organizations). Placeholder seeds so the review flow is usable;
// the real cards are hand-authored later by editing the RAW decks below. The UI
// reads everything through the accessors at the bottom (the future-DB boundary).
// ---------------------------------------------------------------------------

type RawCard = { front: string; back: string; tags?: string[] };
type RawDeck = { id: string; title: string; description: string; cards: RawCard[] };

const RAW: RawDeck[] = [
  {
    id: "diplomatic-terms",
    title: "Diplomatic Terminology",
    description: "Core terms of diplomatic practice and protocol.",
    cards: [
      { front: "Agrément", back: "The receiving state's prior consent to a proposed head of mission (ambassador) before the appointment is formalised.", tags: ["protocol"] },
      { front: "Persona non grata", back: "A diplomat the receiving state declares unacceptable; the sending state must recall them or end their functions (VCDR Art. 9).", tags: ["protocol", "VCDR"] },
      { front: "Aide-mémoire", back: "An informal written summary of points raised in a discussion, left with the other party as a record — no signature or attribution.", tags: ["correspondence"] },
      { front: "Démarche", back: "A formal diplomatic approach or representation made to a government to convey a position or request action.", tags: ["practice"] },
      { front: "Letters of Credence", back: "The document accrediting an ambassador, presented to the receiving head of state to formally take up the post.", tags: ["protocol"] },
    ],
  },
  {
    id: "treaties",
    title: "Key Treaties",
    description: "Nepal's principal bilateral treaties and their significance.",
    cards: [
      { front: "Nepal–India Treaty of Peace and Friendship, 1950", back: "Foundational bilateral treaty; established close ties, open border and national treatment; long debated for revision.", tags: ["Nepal-India"] },
      { front: "Nepal–India Trade and Transit Treaty, 1960", back: "Framework for trade and transit rights for landlocked Nepal; subsequently revised several times.", tags: ["Nepal-India", "transit"] },
      { front: "Nepal–China Treaty of Peace and Friendship, 1960", back: "Established friendly relations and the basis for boundary settlement with China.", tags: ["Nepal-China"] },
      { front: "Nepal–India Extradition Treaty, 1953", back: "Provides for the mutual surrender of fugitives between Nepal and India.", tags: ["Nepal-India"] },
    ],
  },
  {
    id: "vienna-conventions",
    title: "Vienna Conventions",
    description: "Key articles of VCDR 1961 and VCCR 1963.",
    cards: [
      { front: "VCDR 1961 — Article 22", back: "Premises of the mission are inviolable; the receiving state must protect them and they are immune from search, requisition or seizure.", tags: ["VCDR"] },
      { front: "VCDR 1961 — Article 29", back: "The person of a diplomatic agent is inviolable; they are not liable to arrest or detention.", tags: ["VCDR"] },
      { front: "VCDR 1961 — Article 9", back: "The receiving state may at any time declare a diplomat persona non grata, without explanation.", tags: ["VCDR"] },
      { front: "VCCR 1963 — Consular vs diplomatic immunity", back: "Consular officers enjoy functional immunity (acts performed in official functions), narrower than the broad immunity of diplomats.", tags: ["VCCR"] },
    ],
  },
  {
    id: "ir-theories",
    title: "IR Theories",
    description: "Major theories of international relations in one line.",
    cards: [
      { front: "Realism", back: "States are the main actors in an anarchic system, pursuing power and security through self-help; politics driven by national interest.", tags: ["theory"] },
      { front: "Liberalism", back: "Cooperation is possible through institutions, interdependence and democracy; non-state actors and international law matter.", tags: ["theory"] },
      { front: "Constructivism", back: "International politics is socially constructed; identities, norms and ideas shape state interests, not just material power.", tags: ["theory"] },
      { front: "Functionalism", back: "Cooperation in technical/economic areas spills over into broader political integration over time.", tags: ["theory"] },
    ],
  },
  {
    id: "organizations",
    title: "International Organizations",
    description: "Bodies central to Nepal's multilateral engagement.",
    cards: [
      { front: "SAARC", back: "South Asian Association for Regional Cooperation (est. 1985); secretariat in Kathmandu; eight member states.", tags: ["regional"] },
      { front: "BIMSTEC", back: "Bay of Bengal Initiative for Multi-Sectoral Technical and Economic Cooperation; links South and Southeast Asia.", tags: ["regional"] },
      { front: "NAM", back: "Non-Aligned Movement; states not formally aligned with any major power bloc — a pillar of Nepal's foreign policy.", tags: ["global"] },
      { front: "WTO", back: "World Trade Organization; governs international trade rules; Nepal joined in 2004 as the first LDC to accede via full working-party negotiation.", tags: ["global", "trade"] },
    ],
  },
];

// --- Id helpers (call in event handlers, never in render — crypto is impure) ---
export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Stable deck id from its title; random suffix only on empty/collision. */
export function makeDeckId(title: string, taken: string[] = []): string {
  const base = slug(title).slice(0, 48).replace(/-+$/, "");
  if (base !== "" && !taken.includes(base)) return base;
  return `${base === "" ? "deck" : base}-${crypto.randomUUID().slice(0, 4)}`;
}

/** Unique card id scoped to its deck. */
export function makeCardId(deckId: string, taken: string[] = []): string {
  let id = `${deckId}-${crypto.randomUUID().slice(0, 6)}`;
  while (taken.includes(id)) id = `${deckId}-${crypto.randomUUID().slice(0, 6)}`;
  return id;
}

// --- Build typed cards (ids generated) and decks (cardCount derived) ---
export const flashcards: Flashcard[] = RAW.flatMap((d) =>
  d.cards.map((c, i) => ({
    id: `${d.id}-c${i + 1}`,
    deckId: d.id,
    front: c.front,
    back: c.back,
    tags: c.tags ?? [],
  })),
);

export const decks: Deck[] = RAW.map((d) => ({
  id: d.id,
  title: d.title,
  description: d.description,
  cardCount: flashcards.filter((c) => c.deckId === d.id).length,
}));

// --- Accessors (the data boundary — read through these, not the arrays) ---
export function getDeck(id: string): Deck | undefined {
  return decks.find((d) => d.id === id);
}

export function cardsByDeck(deckId: string): Flashcard[] {
  return flashcards.filter((c) => c.deckId === deckId);
}

export function getFlashcard(id: string): Flashcard | undefined {
  return flashcards.find((c) => c.id === id);
}
