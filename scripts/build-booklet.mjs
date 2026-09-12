// booklets/*.json → src/data/content-map.ts
//
// Reads EVERY booklet JSON file under booklets/ (one per child, filename =
// slug), validates each one and regenerates the TypeScript data module the app
// renders: `SLUG_LIST` (for static params / the workbooks list) and `BOOKLETS`
// (a `Record<slug, BookletData>`). Run via `npm run content` (also runs
// automatically before `dev` and `build`).
//
// Each file is a BookletData object; the shape and the fixed layout constraints
// live in src/data/types.ts and here: 5 domains, 3 statuses (🟢🟡🟠 order),
// game counts 3/3/3/4/3, ≤6 skill bullets, ≤5 game steps, and matching emoji
// across the three domain tables. Only STRUCTURE is enforced — text fields may
// be left empty on purpose (the pages render "−" for empty sections).
// `src/app/admin/api/save/route.ts` writes these files, so the /admin editor
// saves straight into the project (no manual download + drop step).

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const IN_DIR = join(root, "booklets");
const OUT = join(root, "src/data/content-map.ts");

// --- tiny helpers -------------------------------------------------------------

const fail = (msg) => {
  throw new Error(msg);
};

const ACCENTS = ["blue", "mint", "pink", "lavender", "peach"];
const GAME_COUNTS = [3, 3, 3, 4, 3];
const STATUS_BY_EMOJI = { "🟢": "onTrack", "🟡": "monitor", "🟠": "evaluate" };
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function check(cond, msg) {
  if (!cond) fail(msg);
}

/** Text fields may be empty on purpose (the pages render "−" for them). */
const isText = (v) => typeof v === "string";

/** Validates a parsed BookletData (from a booklets/*.json file). */
function validateBooklet(b, slug) {
  const file = `booklets/${slug}.json`;
  check(slug && SLUG_RE.test(slug), `نام فایل «${file}» slug معتبر نیست (فقط حروف کوچک، عدد و «-»)`);
  check(b && typeof b === "object", `فایل «${file}» باید یک آبجکت BookletData باشد`);
  check(isText(b.bookletTitle), `«${file}» عنوان کتابچه ندارد`);

  const ci = b.childInfo;
  check(ci && typeof ci === "object", `«${file}» childInfo ندارد`);
  for (const key of ["name", "birthDate", "screeningDate", "age", "nextScreeningAt"]) {
    check(isText(ci?.[key]), `«${file}» childInfo.${key} خالی است`);
  }

  check(Array.isArray(b.statuses) && b.statuses.length === 3, `«${file}» باید دقیقاً ۳ وضعیت داشته باشد`);
  const statusKeys = [];
  b.statuses.forEach((s, i) => {
    check(s && typeof s === "object", `وضعیت ${i + 1} در «${file}» ناقص است`);
    check(STATUS_BY_EMOJI[s.emoji] === s.key, `وضعیت ${i + 1} در «${file}» اموجی/کلید نمی‌خورد (باید 🟢🟡🟠 باشد)`);
    statusKeys.push(s.key);
    check(isText(s.title) && isText(s.description), `وضعیت ${i + 1} در «${file}» ناقص است`);
  });
  check(
    statusKeys.join(",") === ["onTrack", "monitor", "evaluate"].join(","),
    `وضعیت‌های «${file}» باید به ترتیب 🟢 🟡 🟠 باشند`
  );

  check(Array.isArray(b.results) && b.results.length === 5, `«${file}» باید دقیقاً ۵ نتیجه حیطه داشته باشد`);
  const keySet = new Set(statusKeys);
  b.results.forEach((r, i) => {
    check(r && typeof r === "object" && isText(r.emoji) && isText(r.name), `حیطه ${i + 1} «${file}» (results) ناقص است`);
    check(keySet.has(r.status), `وضعیت حیطه «${r.name}» در «${file}» شناخته نشد (باید یکی از وضعیت‌های تعریف‌شده باشد)`);
  });

  check(isText(b.tenMonthsIntro), `مقدمه «مهارت‌ها» در «${file}» ناقص است`);

  check(Array.isArray(b.domainSkills) && b.domainSkills.length === 5, `«${file}» باید ۵ حیطه در domainSkills داشته باشد`);
  b.domainSkills.forEach((d, i) => {
    check(d && typeof d === "object", `حیطه ${i + 1} «${file}» (domainSkills) ناقص است`);
    check(d.accent === ACCENTS[i], `accent حیطه ${i + 1} «${file}» باید ${ACCENTS[i]} باشد`);
    check(isText(d.intro), `حیطه ${i + 1} «${file}» (domainSkills) intro ندارد`);
    check(Array.isArray(d.bullets) && d.bullets.length <= 6 && d.bullets.every(isText), `حیطه «${d.name}» در «${file}» حداکثر ۶ مهارت مجاز است`);
  });

  check(isText(b.gamesIntro), `مقدمه «بازی‌ها» در «${file}» ناقص است`);

  check(Array.isArray(b.domainGames) && b.domainGames.length === 5, `«${file}» باید ۵ حیطه در domainGames داشته باشد`);
  b.domainGames.forEach((dg, i) => {
    check(dg && typeof dg === "object", `حیطه ${i + 1} «${file}» (domainGames) ناقص است`);
    check(dg.accent === ACCENTS[i], `accent حیطه ${i + 1} «${file}» باید ${ACCENTS[i]} باشد`);
    check(Array.isArray(dg.games) && dg.games.length === GAME_COUNTS[i], `حیطه «${dg.name}» در «${file}» باید دقیقاً ${GAME_COUNTS[i]} بازی داشته باشد`);
    dg.games.forEach((g, gi) => {
      check(g && typeof g === "object" && isText(g.title) && isText(g.emoji), `بازی ${gi + 1} حیطه «${dg.name}» در «${file}» ناقص است`);
      check(Array.isArray(g.steps) && g.steps.length <= 5 && g.steps.every(isText), `بازی «${g.title}» در «${file}» حداکثر ۵ قدم مجاز است`);
    });
  });

  check(b.reminder && typeof b.reminder === "object" && isText(b.reminder.title) && Array.isArray(b.reminder.lines) && b.reminder.lines.every(isText), `یادآوری «${file}» ناقص است`);

  check(b.nextStep && typeof b.nextStep === "object" && isText(b.nextStep.title) && Array.isArray(b.nextStep.lines) && b.nextStep.lines.every(isText), `قدم بعدی «${file}» ناقص است`);

  // Cross-section sanity (domain emoji must line up across results/skills/games;
  // names may differ slightly — "حل مسئله" vs "حل مسئله و شناخت").
  for (let k = 0; k < 5; k++) {
    const a = b.results[k];
    const s = b.domainSkills[k];
    const g = b.domainGames[k];
    if (a.emoji !== s.emoji || g.emoji !== s.emoji) {
      fail(`اموجی حیطه‌ی ${k + 1} در «${file}» باید در نتیجه، مهارت‌ها و بازی‌ها یکسان باشد`);
    }
  }
}

// --- main ---------------------------------------------------------------------

const files = readdirSync(IN_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

if (files.length === 0) fail(`هیچ فایلی در «${IN_DIR}» پیدا نشد`);

const booklets = {};
for (const f of files) {
  const slug = basename(f, ".json");
  const raw = JSON.parse(readFileSync(join(IN_DIR, f), "utf8"));
  validateBooklet(raw, slug);
  booklets[slug] = raw;
  console.log(`✓ booklets/${f}  (${slug})`);
}

// --- render TS -----------------------------------------------------------------

const j = (v) => JSON.stringify(v, null, 2);

const mapBody = Object.entries(booklets)
  .map(([slug, book]) => `  ${j(slug)}: ${j(book)},`)
  .join("\n");

const ts = [
  "// ══════════════════════════════════════════════════════════════════",
  "// AUTOGENERATED FILE — do not edit by hand.",
  "//",
  "// Each child's Persian text lives in its own JSON file under booklets/",
  "// (one file per child, filename = url slug). The /admin editor saves",
  "// straight into those files; run:",
  "//",
  "//     npm run content",
  "//",
  "// (npm runs it automatically before `dev` and `build`.)",
  "// Types stay in src/data/types.ts.",
  "// ══════════════════════════════════════════════════════════════════",
  "",
  'import type { BookletData } from "./types";',
  "",
  "export const SLUG_LIST: string[] = " +
    j(Object.keys(booklets)) +
    ";",
  "",
  "export const BOOKLETS: Record<string, BookletData> = {",
  mapBody,
  "};",
  "",
].join("\n");

writeFileSync(OUT, ts, "utf8");
console.log(`✓ ${Object.keys(booklets).length} booklet(s)  →  src/data/content-map.ts`);