// Reads src/data/content.ts (the current data) and writes booklet.txt in the
// canonical plain-text format. This is the one-time seeding step that produced
// the initial booklet.txt; the real pipeline is build-booklet.mjs (txt → TS).
//
// Usage:  node scripts/export-booklet.mjs
//
// After this has run once, booklet.txt is the source of truth and this script
// is only needed again if the format changes. Node 24 strips TS types natively,
// so importing content.ts directly is fine.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "booklet.txt");

const book = await import(pathToFileURL(join(root, "src/data/content.ts")).href);

const titles = Object.fromEntries(book.statuses.map((s) => [s.key, s.title]));

const lines = [];
const push = (s = "") => lines.push(s);

// ---- header + comments -----------------------------------------------------
push(";; کارنامه‌ی رشد — متن کتابچه");
push(";; برای تغییر متن، فقط این فایل را با «نوت‌پد» باز کنید و متن‌ها را عوض کنید.");
push(";; ۱) خط‌هایی را که با # شروع می‌شوند (عنوان بخش‌ها) عوض نکنید.");
push(";; ۲) خط‌های «-» برای لیست‌ها‌ست (مهارت‌ها یا قدم‌های بازی).");
push(";; ۳) بعد از ویرایش، «npm run dev» را دوباره اجرا کنید تا کتابچه ساخته شود.");
push();

// ---- cover title -----------------------------------------------------------
push(`# ${book.bookletTitle}`);
push();

// ---- child info ------------------------------------------------------------
push("## مشخصات کودک");
push("#### نام و نام خانوادگی");
push(book.childInfo.name);
push("#### تاریخ تولد");
push(book.childInfo.birthDate);
push("#### تاریخ انجام غربالگری");
push(book.childInfo.screeningDate);
push("#### سن هنگام غربالگری");
push(book.childInfo.age);
push("#### غربالگری بعدی");
push(book.childInfo.nextScreeningAt ?? "۱۲ ماهگی");
push();

// ---- status legend ----------------------------------------------------------
push("## وضعیت مهارت‌های رشدی");
for (const s of book.statuses) {
  push(`### ${s.emoji} ${s.title}`);
  push(s.description);
  push();
}

// ---- results ----------------------------------------------------------------
push("## نتیجه غربالگری");
for (const r of book.results) {
  push(`### ${r.emoji} ${r.name}`);
  push(titles[r.status]);
  push();
}

// ---- skills at the current age ---------------------------------------------
push("## مهارت‌ها در ۱۰ ماهگی");
push(book.tenMonthsIntro);
push();
for (const d of book.domainSkills) {
  push(`### ${d.emoji} ${d.name}`);
  push(d.intro);
  push();
  for (const b of d.bullets) push(`- ${b}`);
  push();
}

// ---- suggested games --------------------------------------------------------
push("## بازی‌ها و فعالیت‌های پیشنهادی");
push(book.gamesIntro);
push();
for (const g of book.domainGames) {
  push(`### ${g.emoji} ${g.name}`);
  push();
  for (const game of g.games) {
    push(`#### ${game.emoji} ${game.title}`);
    for (const step of game.steps) push(`- ${step}`);
    push();
  }
}

// ---- reminder ----------------------------------------------------------------
push("## یادآوری");
push("#### عنوان");
push(book.reminder.title);
push("#### متن");
for (const line of book.reminder.lines) {
  push(line);
  push();
}

// ---- next step ---------------------------------------------------------------
push("## قدم بعدی");
push("#### عنوان");
push(book.nextStep.title);
push("#### متن");
for (const line of book.nextStep.lines) {
  push(line);
  push();
}

writeFileSync(OUT, lines.join("\n"), "utf8");
console.log("✓ booklet.txt written (", bookletsize(lines), "lines )");
console.log("  next step: create scripts/build-booklet.mjs, then run `node scripts/build-booklet.mjs`");

function bookletsize(l) {
  return l.length;
}