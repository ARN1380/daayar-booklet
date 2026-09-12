// Booklet content types. The *values* live in one file per child under
// booklets/<slug>.json, and are generated into src/data/content-map.ts by
// `npm run content`; this file is the only hand-written part of the data layer.

export type StatusKey = "onTrack" | "monitor" | "evaluate";

export interface StatusInfo {
  key: StatusKey;
  emoji: string;
  title: string;
  description: string;
}

export interface DomainResult {
  emoji: string;
  name: string;
  status: StatusKey;
}

export interface DomainSkill {
  emoji: string;
  name: string;
  accent: AccentKey;
  intro: string;
  bullets: string[];
}

export interface Game {
  emoji: string;
  title: string;
  steps: string[];
}

export interface DomainGames {
  emoji: string;
  name: string;
  accent: AccentKey;
  games: Game[];
}

export interface ChildInfo {
  name: string;
  birthDate: string;
  screeningDate: string;
  age: string;
  nextScreeningAt: string;
}

/** A closing page block: reminder / next-step, with an emoji + title + lines. */
export interface ParagraphBlock {
  emoji: string;
  title: string;
  lines: string[];
}

export type Reminder = ParagraphBlock;
export type NextStep = ParagraphBlock;

/**
 * The five editable section/page titles. Empty string means "use the default
 * Persian title" (what the pages hardcoded before), so existing booklets that
 * lack this block render exactly as they used to. `titles` on BookletData is
 * optional for that reason.
 */
export interface BookletTitles {
  /** مشخصات کودک (page 1 header) */
  childInfo: string;
  /** وضعیت مهارت‌های رشدی (page 2 header) */
  statuses: string;
  /** نتیجه غربالگری (page 3 header; default appends the child's name) */
  results: string;
  /** مهارت‌ها در ۱۰ ماهگی (page 4 header; default appends the child's age) */
  tenMonths: string;
  /** بازی‌ها و فعالیت‌های پیشنهادی (games pages header) */
  games: string;
}

export type AccentKey = "blue" | "mint" | "pink" | "lavender" | "peach";

/**
 * The entire content of ONE child's booklet — the shape every page component
 * reads from. `content-map.ts` holds a `Record<slug, BookletData>`.
 */
export interface BookletData {
  bookletTitle: string;
  childInfo: ChildInfo;
  statuses: StatusInfo[];
  results: DomainResult[];
  tenMonthsIntro: string;
  domainSkills: DomainSkill[];
  gamesIntro: string;
  domainGames: DomainGames[];
  reminder: Reminder;
  nextStep: NextStep;
  /** Editable section/page titles. Optional: empty means "use the default". */
  titles?: Partial<BookletTitles>;
}