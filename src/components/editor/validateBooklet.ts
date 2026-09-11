// Browser-side validation that mirrors scripts/build-booklet.mjs.
//
// The Node builder is the only real compiler; this mirror exists so the /admin
// editor can block saving with a clear Persian message before the user writes a
// JSON file that the builder would reject. Keep the rules in sync with
// build-booklet.mjs (they are small: the counts and the per-item limits).

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

  req(d.bookletTitle.trim() !== "", "عنوان کتابچه خالی است.");

  const childFields: Array<[label: string, value: string]> = [
    ["نام و نام خانوادگی", d.childInfo.name],
    ["تاریخ تولد", d.childInfo.birthDate],
    ["تاریخ انجام غربالگری", d.childInfo.screeningDate],
    ["سن هنگام غربالگری", d.childInfo.age],
    ["غربالگری بعدی", d.childInfo.nextScreeningAt],
  ];
  for (const [label, value] of childFields) {
    req(value.trim() !== "", `«${label}» خالی است.`);
  }

  d.statuses.forEach((s, i) => {
    req(s.title.trim() !== "", `عنوان وضعیت ${i + 1} خالی است.`);
    req(s.description.trim() !== "", `توضیح وضعیت «${s.title || i + 1}» خالی است.`);
  });

  req(d.domains.length === 5, "باید دقیقاً ۵ حیطه‌ی رشدی وجود داشته باشد.");
  d.domains.forEach((dom, i) => {
    req(dom.name.trim() !== "", `نام حیطه‌ی ${i + 1} خالی است.`);
    req(dom.emoji.trim() !== "", `اموجی حیطه‌ی ${i + 1} خالی است.`);
  });

  req(d.resultStatus.length === 5, "باید برای هر ۵ حیطه یک وضعیت انتخاب شود.");

  req(d.tenMonthsIntro.trim() !== "", "مقدمه‌ی «مهارت‌ها در ۱۰ ماهگی» خالی است.");
  d.domains.forEach((dom, i) => {
    req((d.skillIntros[i] ?? "").trim() !== "", `مقدمه‌ی حیطه‌ی «${dom.name}» خالی است.`);
    const bullets = d.skillBullets[i] ?? [];
    req(bullets.length >= 1, `برای حیطه‌ی «${dom.name}» حداقل یک مهارت بنویسید.`);
    req(bullets.length <= 6, `برای حیطه‌ی «${dom.name}» حداکثر ۶ مهارت مجاز است.`);
    bullets.forEach((b, j) => {
      req(b.trim() !== "", `مهارت ${j + 1} حیطه‌ی «${dom.name}» خالی است.`);
    });
  });

  req(d.gamesIntro.trim() !== "", "مقدمه‌ی «بازی‌ها و فعالیت‌های پیشنهادی» خالی است.");
  d.domains.forEach((dom, i) => {
    const games = d.games[i] ?? [];
    req(games.length === GAME_COUNTS[i], `حیطه‌ی «${dom.name}» باید دقیقاً ${GAME_COUNTS[i]} بازی داشته باشد.`);
    games.forEach((g, gi) => {
      req(g.title.trim() !== "", `بازی ${gi + 1} حیطه‌ی «${dom.name}» عنوان ندارد.`);
      req(g.emoji.trim() !== "", `بازی ${gi + 1} حیطه‌ی «${dom.name}» اموجی ندارد.`);
      req(g.steps.length >= 1, `بازی «${g.title || gi + 1}» هیچ قدمی ندارد.`);
      req(g.steps.length <= 5, `بازی «${g.title || gi + 1}» حداکثر ۵ قدم مجاز است.`);
      g.steps.forEach((step, si) => {
        req(step.trim() !== "", `قدم ${si + 1} بازی «${g.title || gi + 1}» خالی است.`);
      });
    });
  });

  req(d.reminderTitle.trim() !== "", "عنوان یادآوری خالی است.");
  req(d.reminderLines.some((l) => l.trim() !== ""), "متن یادآوری خالی است.");

  req(d.nextStepTitle.trim() !== "", "عنوان «قدم بعدی» خالی است.");
  req(d.nextStepLines.some((l) => l.trim() !== ""), "متن «قدم بعدی» خالی است.");

  return { ok: errors.length === 0, errors };
}