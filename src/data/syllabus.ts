import type { Paper, PaperCode, Section, Stage, Unit, Level } from "@/lib/types";

// ---------------------------------------------------------------------------
// The real Nepal Lok Sewa — Section Officer (Foreign Service / परराष्ट्र सेवा)
// syllabus, encoded as the app's spine. Source: psc.gov.np objective +
// subjective course PDFs. Edit here to refine wording; the UI derives from it.
// ---------------------------------------------------------------------------

// --- Author-friendly raw shape (ids are generated below) ---
type RawUnit = { number: string; title: string; level?: Level; subtopics: string[] };
type RawSection = { label: string; marks: number; pattern?: string; units: RawUnit[] };
type RawPaper = {
  code: PaperCode;
  stage: Stage;
  title: string;
  totalMarks: number;
  durationMins?: number;
  type: "objective" | "subjective";
  note?: string;
  sections: RawSection[];
};

const RAW: RawPaper[] = [
  // ===================== STAGE I — PRELIMINARY (Objective) =====================
  {
    code: "I",
    stage: "prelim",
    title: "Administrative Aptitude Test",
    totalMarks: 100,
    durationMins: 120,
    type: "objective",
    note: "Qualifying · 100 MCQs · Stage I",
    sections: [
      {
        label: "Part A — General Awareness",
        marks: 50,
        pattern: "50×1=50",
        units: [
          { number: "1.1", title: "Geography", level: "I", subtopics: ["Physical, social and economic geography of Nepal and the World"] },
          { number: "1.2", title: "History, Culture & Social System", level: "I", subtopics: ["Major historical events of the World", "Political, economic and socio-cultural aspects of ancient, medieval and modern Nepalese history", "People's Movements for democracy in Nepal", "Religions, culture, ethnicity, languages, literature and art of Nepal"] },
          { number: "1.3", title: "Polity & Governance", level: "I", subtopics: ["Constitution, political system, rights-based issues", "Evolution of the Nepalese Administrative System"] },
          { number: "1.4", title: "Economic Development", level: "I", subtopics: ["Infrastructure development (agriculture, industry, trade, tourism, transport, communication, education, health, electricity)", "Planning, resource mobilization, growth, development and employment", "Nepal's economic interaction with the World"] },
          { number: "1.5", title: "Sustainable Development & Environment", level: "I", subtopics: ["Environmental ecology, ecological preservation, bio-diversity, climate change", "Demography, urbanization, settlement, pollution", "Conservation of natural resources and national heritage"] },
          { number: "1.6", title: "Science & Technology", level: "I", subtopics: ["Major scientific discoveries, inventions and famous scientists", "Impact of science & technology on human life and society", "Evolution, heredity, health and diseases"] },
          { number: "1.7", title: "International Affairs & Institutions", level: "I", subtopics: ["Nepal's relations with SAARC and major powers (China, USA, UK, Russia, France, Germany, Switzerland, Japan)", "UN System, multilateral arrangements and Nepal"] },
          { number: "1.8", title: "Major Events & Current Affairs", level: "I", subtopics: ["National & international events: political, social, cultural, economic, scientific, sports, books, prizes, arts, literature, music, noted personalities and thinkers"] },
        ],
      },
      {
        label: "Part B — Aptitude Test",
        marks: 30,
        pattern: "30×1=30",
        units: [
          { number: "2.1", title: "Verbal Reasoning", subtopics: ["Series, analogy, classification, coding-decoding, missing character, common property, matrices, direction/distance, ranking, assertion & reason, induction, deduction, courses of action"] },
          { number: "2.2", title: "Non-verbal Reasoning", subtopics: ["Series, analogy, classification, Venn diagrams, matrices, figure formation & analysis, dot situation, water/mirror images, embedded figures"] },
          { number: "2.3", title: "Quantitative Aptitude", subtopics: ["Arithmetic reasoning, percentage, fraction, decimal, ratio, average, loss/profit, date/calendar, time and work"] },
          { number: "2.4", title: "Mental Ability & Logical Reasoning", subtopics: ["General mental ability, logical reasoning and analytical ability"] },
          { number: "2.5", title: "Data Interpretation", subtopics: ["Charts, graphs, tables, data sufficiency"] },
        ],
      },
      {
        label: "Part C — English Language Competence",
        marks: 20,
        pattern: "20×1=20",
        units: [
          { number: "3.1", title: "Comprehension", subtopics: ["Fact finding, inferential, core theme, true/false, issues raised, language based"] },
          { number: "3.2", title: "Vocabulary", subtopics: ["Word meanings (literal/figurative/contextual), single-word expressions, synonyms/antonyms, derivatives, homonyms/homophones"] },
          { number: "3.3", title: "Syntactic Ability", subtopics: ["Agreement, tense aspect, parallel structures, clauses, modifiers, conditionals, phrasal expressions, shifts, transformations, prepositions/conjunctions, parts of speech"] },
        ],
      },
    ],
  },

  // ===================== STAGE II — MAIN (Subjective) =====================
  {
    code: "II",
    stage: "main",
    title: "Governance Systems",
    totalMarks: 100,
    durationMins: 180,
    type: "subjective",
    note: "Main · 10×10 · Sections A–D",
    sections: [
      { label: "Section A — State and Governance", marks: 30, pattern: "10×3=30", units: [
        { number: "1", title: "State and Governance", subtopics: ["Fundamentals of governance: concept, context, characteristics", "Political and administrative structures of governance", "Right to information and transparency", "Nation building and state building", "Governance systems in Nepal", "National security management in Nepal", "Multi-level governance (informal, civil society, local, cooperative, corporate, UN)"] },
      ] },
      { label: "Section B — Constitution and Law", marks: 20, pattern: "10×2=20", units: [
        { number: "2", title: "Constitution and Law", subtopics: ["Constitutionalism", "Constitutional development in Nepal", "Present Constitution of Nepal (salient features; executive/legislative/judiciary; fundamental rights & DPSP; constitutional & statutory bodies)", "Human rights", "Civic sense, duties and responsibilities", "Sources of law and law-making process in Nepal", "Rule of law, democratic values, inclusion, proportional representation, affirmative action"] },
      ] },
      { label: "Section C — Public Service and Public Management", marks: 30, pattern: "10×3=30", units: [
        { number: "3", title: "Public Service and Public Management", subtopics: ["Concept, functions, characteristics and role of public service", "Public service delivery", "Political neutrality, commitment, transparency, accountability", "Utilization of public funds, ethics and morality", "Public management, civil service and bureaucracy", "Public policy: formulation process and analysis", "Public Service Charter", "E-governance"] },
      ] },
      { label: "Section D — Resource Management and Planning", marks: 20, pattern: "10×2=20", units: [
        { number: "4", title: "Resource Management and Planning", subtopics: ["Human resource management: procurement, development, utilization, maintenance", "Public financial management: planning & budgeting in Nepal", "Government accounting and auditing system in Nepal", "Financial management and social accountability", "Development planning and current periodic plan", "Participatory planning and development"] },
      ] },
    ],
  },
  {
    code: "III",
    stage: "main",
    title: "Contemporary Issues",
    totalMarks: 100,
    durationMins: 180,
    type: "subjective",
    note: "Main · 10×10 · Sections A–D",
    sections: [
      { label: "Section A — Social Issues", marks: 30, pattern: "10×3=30", units: [
        { number: "1", title: "Social Issues", subtopics: ["Social disputes and conflict", "Social justice and equality", "Social and cultural transformation", "Distributive justice of resources (regional, caste/ethnicity, gender, rural/urban)", "Social protection, security and responsibility", "Cultural diversity and social mobilization", "Population (settlement, migration, urbanization, aging, refugee, displaced)", "Organized crime (cyber crime, trafficking, cartelling, terrorism, corruption, money laundering)", "Food sovereignty and security"] },
      ] },
      { label: "Section B — Economic Issues", marks: 20, pattern: "10×2=20", units: [
        { number: "2", title: "Economic Issues", subtopics: ["Economic growth and development", "Major aspects (agriculture, industry, trade, tourism, foreign employment, human resource)", "Role of public/private/cooperative sectors", "Foreign assistance and international cooperation", "Foreign investment: portfolio and direct", "Technology transfer & intellectual property rights", "Trade, market and labour liberalization", "Economic diplomacy", "Poverty and unemployment"] },
      ] },
      { label: "Section C — Developmental Issues", marks: 30, pattern: "10×3=30", units: [
        { number: "3", title: "Developmental Issues", subtopics: ["Human development", "Infrastructure development", "Sustainable development (land, water, natural resources; carrying capacity & policy)", "Role of state and non-state actors", "Peace and conflict-sensitive development", "Decentralization and local self-governance", "Citizen engagement in development", "Partnership & community-based development", "Role of ICT in development", "Globalization and development"] },
      ] },
      { label: "Section D — Environmental Issues", marks: 20, pattern: "10×2=20", units: [
        { number: "4", title: "Environmental Issues", subtopics: ["Ecosystem", "Bio-diversity and conservation", "Climate change and carbon trade", "Environmental degradation", "Deforestation", "Crisis/disaster management", "Environment and development", "Energy crisis and energy conservation"] },
      ] },
    ],
  },
  {
    code: "IV",
    stage: "main",
    title: "English Language",
    totalMarks: 100,
    durationMins: 180,
    type: "subjective",
    note: "Extra Paper I (Foreign Service) · Sections A–D",
    sections: [
      { label: "Section A — Composition", marks: 20, pattern: "20×1=20", units: [
        { number: "1", title: "Composition", subtopics: ["Essay writing (800–1000 words) revealing originality and creativity"] },
      ] },
      { label: "Section B — Translation", marks: 30, pattern: "15+15=30", units: [
        { number: "2", title: "Translate English into Nepali", subtopics: ["Passage of ~200–250 words on a general topic; translate faithfully"] },
        { number: "3", title: "Translate Nepali into English", subtopics: ["Passage of ~200–250 words on a general topic; translate faithfully"] },
      ] },
      { label: "Section C — Comprehension & Précis", marks: 30, pattern: "15+15=30", units: [
        { number: "4", title: "Comprehension", subtopics: ["~500-word passage with 5 questions (3 marks each)"] },
        { number: "5", title: "Précis Writing", subtopics: ["~450–500-word passage summarized to one-third length"] },
      ] },
      { label: "Section D — Diplomatic Correspondence", marks: 20, pattern: "10×2=20", units: [
        { number: "6", title: "Diplomatic Correspondence / Writing", subtopics: ["Drafting first-person note", "Drafting third-person note", "Drafting joint communiqué", "Drafting press statement"] },
      ] },
    ],
  },
  {
    code: "V",
    stage: "main",
    title: "Foreign Policy & International Relations",
    totalMarks: 100,
    durationMins: 180,
    type: "subjective",
    note: "Extra Paper II (Foreign Service) · MoFA core · Sections A–D",
    sections: [
      { label: "Section A — Foreign Policy & Strategic Relations", marks: 20, pattern: "10×2=20", units: [
        { number: "1", title: "Nepal's Foreign Policy", subtopics: ["Evolution of Nepal's foreign policy", "Definition and determinants", "Guiding principles", "Democratization of foreign policy", "Human rights obligations", "Environment: climate change & global warming", "Terrorism: global & regional instruments", "Globalization's impact", "Refugee issues"] },
        { number: "2", title: "Strategic & Political Relations between Nations", subtopics: ["Nepal–SAARC countries", "Nepal & major powers (China, USA, UK, France, Russia, Japan, Germany)", "Nepal & EU and major development partners"] },
      ] },
      { label: "Section B — International & Regional Organizations", marks: 30, pattern: "10×3=30", units: [
        { number: "3", title: "Nepal and International Organizations", subtopics: ["UN: structure, functions, reform", "Nepal's UN membership", "Disarmament and international peace", "UN Peacekeeping Operations", "World Bank Group", "IMF", "WTO", "Asian Development Bank"] },
        { number: "4", title: "NAM and Least Developed Countries", subtopics: ["NAM: origin, purpose, principles, relevance", "Nepal's role in NAM", "LDC, LLDC, G-77 and China", "South-South Cooperation", "Rights of land-locked states"] },
        { number: "5", title: "Regional Organizations and Nepal", subtopics: ["Concept and importance of regionalism", "EU, ASEAN, SAARC, BIMSTEC, SCO", "Nepal in SAARC", "Nepal in BIMSTEC"] },
      ] },
      { label: "Section C — Economic Diplomacy & MoFA", marks: 20, pattern: "10×2=20", units: [
        { number: "6", title: "Economic Diplomacy: Case of Nepal", subtopics: ["Foreign aid in Nepal's development", "Foreign trade & trade deficit", "Foreign employment & remittance", "Tourism promotion", "Hydropower development", "FDI", "Non-Resident Nepalese (NRNs)"] },
        { number: "7", title: "Ministry of Foreign Affairs & Missions", subtopics: ["Role and functions of MoFA", "Nepal Foreign Service, diplomacy and national interest", "Functions of diplomatic and consular missions", "Challenges of missions", "Vienna Convention on Diplomatic Relations, 1961", "Vienna Convention on Consular Relations, 1963"] },
      ] },
      { label: "Section D — Treaties, Diplomacy & IR Theory", marks: 30, pattern: "10×3=30", units: [
        { number: "8", title: "Nepal's Bilateral Treaties", subtopics: ["Nepal–India Treaty of Peace and Friendship, 1950", "Nepal–India Extradition Treaty, 1953", "Nepal–India Trade and Transit Treaty, 1960 (with revisions)", "Nepal–China Treaty of Peace and Friendship, 1960"] },
        { number: "9", title: "Diplomacy: Definition & Changing Role", subtopics: ["Definition and evolution", "Changing nature", "Types (public, citizen, cultural, virtual, conference, preventive)", "Diplomatic terminologies (Agrément, Aide-Mémoire, Persona Non Grata, etc.)", "Negotiation skills"] },
        { number: "10", title: "IR Theories & International Law", subtopics: ["Theories (Realism, Liberalism, Democratic Peace, Institutionalism, Marxist, Constructivism, Functionalism)", "International law: principles, recognition of states/governments, treaty making"] },
      ] },
    ],
  },

  // ===================== FINAL STAGE — INTERVIEW =====================
  {
    code: "V",
    stage: "interview",
    title: "Interview",
    totalMarks: 50,
    type: "subjective",
    note: "Oral · Final stage · Foreign Service",
    sections: [
      { label: "Oral Examination", marks: 50, units: [
        { number: "—", title: "Interview", subtopics: ["Personality, communication, awareness of foreign affairs, current issues, suitability for the Foreign Service"] },
      ] },
    ],
  },
];

// --- Build typed papers with generated ids ---
function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const papers: Paper[] = RAW.map((rp) => {
  const paperId = `${rp.stage}-p${rp.code.toLowerCase()}`;
  const sections: Section[] = rp.sections.map((rs, si) => {
    const sectionId = `${paperId}-s${si + 1}`;
    const units: Unit[] = rs.units.map((ru) => ({
      id: `${sectionId}-u${slug(ru.number)}`,
      sectionId,
      number: ru.number,
      title: ru.title,
      level: ru.level,
      subtopics: ru.subtopics,
    }));
    return { id: sectionId, paperId, label: rs.label, marks: rs.marks, pattern: rs.pattern, units };
  });
  return {
    id: paperId,
    stage: rp.stage,
    code: rp.code,
    title: rp.title,
    totalMarks: rp.totalMarks,
    durationMins: rp.durationMins,
    type: rp.type,
    note: rp.note,
    sections,
  };
});

// --- Derived helpers ---
export const STAGES: { id: Stage; title: string; subtitle: string }[] = [
  { id: "prelim", title: "Stage I — Preliminary", subtitle: "Objective · 100 marks · Qualifying" },
  { id: "main", title: "Stage II — Main Examination", subtitle: "Subjective · 400 marks (Foreign Service)" },
  { id: "interview", title: "Final Stage — Interview", subtitle: "Oral · 50 marks" },
];

export function papersByStage(stage: Stage): Paper[] {
  return papers.filter((p) => p.stage === stage);
}

export function getPaper(id: string): Paper | undefined {
  return papers.find((p) => p.id === id);
}

export function getUnit(id: string): { paper: Paper; section: Section; unit: Unit } | undefined {
  for (const paper of papers) {
    for (const section of paper.sections) {
      const unit = section.units.find((u) => u.id === id);
      if (unit) return { paper, section, unit };
    }
  }
  return undefined;
}

export const allUnits: Unit[] = papers.flatMap((p) => p.sections.flatMap((s) => s.units));
