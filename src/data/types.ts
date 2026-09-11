// Booklet content types. The *values* live in booklet.txt (repo root) and are
// generated into src/data/content.ts by `npm run content`; this file is the
// only hand-written part of the data layer.

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

export type AccentKey = "blue" | "mint" | "pink" | "lavender" | "peach";