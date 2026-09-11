// Editor state model + the bridge between the /admin form and the booklet data.
//
// The editor edits a working copy (EditorData). Saving POSTs to
// /admin/api/save, which persists the booklet as booklets/<slug>.json in the
// project (see the route handler). toContentShape() produces the exact shape
// the page components expect, so the editor's live preview reuses the real
// pages and the same object is what gets written to disk.

import type { BookletData, ChildInfo, Game, StatusKey } from "@/data/types";

// Fixed structure rules the parser also enforces (scripts/build-booklet.mjs).
export const STATUS_KEYS: StatusKey[] = ["onTrack", "monitor", "evaluate"];
export const STATUS_EMOJIS = ["🟢", "🟡", "🟠"] as const;
export const ACCENTS = ["blue", "mint", "pink", "lavender", "peach"] as const;
export const GAME_COUNTS = [3, 3, 3, 4, 3] as const;

/** A skill domain identity, shared by the results/skills/games sections. */
export interface DomainIdentity {
  emoji: string;
  name: string;
}

/** One status row: emoji + title are exported as the `### ` heading. */
export interface EditableStatus {
  emoji: string;
  title: string;
  description: string;
}

/** Everything the editor form can change. */
export interface EditorData {
  bookletTitle: string;
  childInfo: ChildInfo;
  statuses: EditableStatus[]; // fixed 3, 🟢🟡🟠 order
  domains: DomainIdentity[]; // fixed 5
  resultStatus: StatusKey[]; // one per domain
  tenMonthsIntro: string;
  skillIntros: string[];
  skillBullets: string[][];
  gamesIntro: string;
  games: Game[][]; // counts enforced as GAME_COUNTS
  reminderTitle: string;
  reminderLines: string[];
  nextStepTitle: string;
  nextStepLines: string[];
}

/** The editor's starting point: whatever content it was handed (a booklet). */
export function editorFromContent(content: BookletData): EditorData {
  return {
    bookletTitle: content.bookletTitle,
    childInfo: { ...content.childInfo },
    statuses: content.statuses.map((s) => ({ emoji: s.emoji, title: s.title, description: s.description })),
    domains: content.domainSkills.map((d) => ({ emoji: d.emoji, name: d.name })),
    resultStatus: content.results.map((r) => r.status),
    tenMonthsIntro: content.tenMonthsIntro,
    skillIntros: content.domainSkills.map((d) => d.intro),
    skillBullets: content.domainSkills.map((d) => [...d.bullets]),
    gamesIntro: content.gamesIntro,
    games: content.domainGames.map((dg) => dg.games.map((g) => ({ emoji: g.emoji, title: g.title, steps: [...g.steps] }))),
    reminderTitle: content.reminder.title,
    reminderLines: [...content.reminder.lines],
    nextStepTitle: content.nextStep.title,
    nextStepLines: [...content.nextStep.lines],
  };
}

/**
 * A blank starting point for a brand-new child. The structure (5 domains, 3
 * statuses, fixed game counts) is already in place; every text field is empty
 * so the user has to fill them in.
 */
export function emptyEditorData(): EditorData {
  return {
    bookletTitle: "",
    childInfo: {
      name: "",
      birthDate: "",
      screeningDate: "",
      age: "",
      nextScreeningAt: "",
    },
    statuses: STATUS_EMOJIS.map((emoji) => ({ emoji, title: "", description: "" })),
    domains: ACCENTS.map((_accent, i) => ({
      emoji: ["💬", "🏃", "🖐️", "🧩", "🤝"][i],
      name: "",
    })),
    resultStatus: [...STATUS_KEYS],
    tenMonthsIntro: "",
    skillIntros: ACCENTS.map(() => ""),
    skillBullets: ACCENTS.map(() => []),
    gamesIntro: "",
    games: GAME_COUNTS.map((count) =>
      Array.from({ length: count }, () => ({ emoji: "", title: "", steps: [] }))
    ),
    reminderTitle: "",
    reminderLines: [],
    nextStepTitle: "",
    nextStepLines: [],
  };
}

/** The shape the real page components consume (same fields as BookletData). */
export type BookletContent = BookletData;

/** EditorData → the exact shape the pages render. Used by the preview. */
export function toContentShape(d: EditorData): BookletContent {
  return {
    bookletTitle: d.bookletTitle,
    childInfo: d.childInfo,
    statuses: d.statuses.map((s, i) => ({
      key: STATUS_KEYS[i],
      emoji: s.emoji,
      title: s.title,
      description: s.description,
    })),
    results: d.domains.map((dom, i) => ({ emoji: dom.emoji, name: dom.name, status: d.resultStatus[i] })),
    tenMonthsIntro: d.tenMonthsIntro,
    domainSkills: d.domains.map((dom, i) => ({
      emoji: dom.emoji,
      name: dom.name,
      accent: ACCENTS[i],
      intro: d.skillIntros[i],
      bullets: [...d.skillBullets[i]],
    })),
    gamesIntro: d.gamesIntro,
    domainGames: d.domains.map((dom, i) => ({
      emoji: dom.emoji,
      name: dom.name,
      accent: ACCENTS[i],
      games: d.games[i],
    })),
    reminder: { emoji: "💛", title: d.reminderTitle, lines: d.reminderLines },
    nextStep: { emoji: "📌", title: d.nextStepTitle, lines: d.nextStepLines },
  };
}