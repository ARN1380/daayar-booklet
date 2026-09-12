// Browser-side validation that mirrors scripts/build-booklet.mjs.
//
// Only STRUCTURAL facts are enforced here (the fixed counts and per-item
// limits the page layout depends on). Text may be left empty on purpose — the
// pages render "−" for empty sections, so a half-finished booklet is perfectly
// buildable. This mirror exists so the /admin editor can block saving with a
// clear Persian message before the user writes a JSON file the builder would
// reject. Keep the rules in sync with build-booklet.mjs.

import type { EditorData } from "./bookletData";
import { GAME_COUNTS } from "./bookletData";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateBooklet(d: EditorData): ValidationResult {
  const errors: string[] = [];
  const req = (cond: boolean, msg: string) => {
    if (!cond) errors.push(msg);
  };

  req(d.statuses.length === 3, "باید دقیقاً ۳ وضعیت (سبز / زرد / نارنجی) وجود داشته باشد.");

  req(d.domains.length === 5, "باید دقیقاً ۵ حیطه‌ی رشدی وجود داشته باشد.");
  req(d.resultStatus.length === 5, "باید برای هر ۵ حیطه یک وضعیت انتخاب شود.");

  d.domains.forEach((dom, i) => {
    const bullets = d.skillBullets[i] ?? [];
    req(bullets.length <= 6, `برای حیطه‌ی «${dom.name}» حداکثر ۶ مهارت مجاز است.`);
  });

  d.domains.forEach((dom, i) => {
    const games = d.games[i] ?? [];
    req(games.length === GAME_COUNTS[i], `حیطه‌ی «${dom.name}» باید دقیقاً ${GAME_COUNTS[i]} بازی داشته باشد.`);
    games.forEach((g, gi) => {
      req(g.steps.length <= 5, `بازی «${g.title || gi + 1}» حداکثر ۵ قدم مجاز است.`);
    });
  });

  return { ok: errors.length === 0, errors };
}