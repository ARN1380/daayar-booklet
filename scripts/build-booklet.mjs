// booklet.txt → src/data/content.ts
//
// Parses the plain-text booklet (Persian, Notepad-editable) and regenerates the
// TypeScript data file the app renders. Run via `npm run content`
// (also runs automatically before `dev` and `build`).
//
// The format is documented at the top of booklet.txt itself:
//   - `# title`         → booklet title (first line, single #)
//   - `## section`      → section header (do not rename)
//   - `### …`         → status / domain header
//   - `#### …`         → child-info field / game header / reminder field
//   - `- item`          → list item (skill bullets, game steps)
//   - `;; …`            → comment (ignored)
//   - empty lines       → ignored; every other line below a header is that
//                         field's text (several lines are joined with a space)
//
// Layout constraints: the booklet has 17 fixed pages (5 domains, game pages
// 3+3+3+2+2+3 = 16 games). The parser enforces those counts so a text edit can
// never silently break the page layout.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const IN = join(root, "booklet.txt");
const OUT = join(root, "src/data/content.ts");

// --- tiny error helper --------------------------------------------------------

const fail = (msg, no) => {
  throw new Error(no === undefined ? msg : `${msg} (خط ${no + 1})`);
};

// --- lexing helpers -----------------------------------------------------------

const TITLE_RE = /^#\s+(.+)$/;
const SECTION_RE = /^##\s+(.+)$/;
const SUB_RE = /^###\s+(.+)$/;
const FIELD_RE = /^####\s+(.+)$/;
const BULLET_PREFIX = "-";
const COMMENT_PREFIX = ";;";

const raw = readFileSync(IN, "utf8").split(/\r?\n/);

const isBlank = (no) => {
  const t = raw[no].trim();
  return !t || t.startsWith(COMMENT_PREFIX);
};

const skipBlank = (i) => {
  while (i < raw.length && isBlank(i)) i++;
  return i;
};

/** Index of the first line of the *next* `## section` (or EOF). */
const sectionEnd = (i) => {
  let j = i;
  while (j < raw.length) {
    const t = raw[j].trim();
    if (t && !t.startsWith(COMMENT_PREFIX) && SECTION_RE.test(t)) break;
    j++;
  }
  return j;
};

/**
 * Splits lines[i..end) into blocks separated by marker lines matching `re`.
 * The first block (before any marker) has header === null. `no` is 0-based.
 */
const splitByMarker = (i, end, re) => {
  const blocks = [{ header: null, no: i, lines: [] }];
  let cur = blocks[0];
  for (let j = i; j < end; j++) {
    const t = raw[j].trim();
    if (!t || t.startsWith(COMMENT_PREFIX)) continue;
    const m = t.match(re);
    if (m) {
      cur = { header: m[1].trim(), no: j, lines: [] };
      blocks.push(cur);
    } else {
      cur.lines.push({ text: t, no: j });
    }
  }
  return blocks.filter((b) => b.header !== null || b.lines.length > 0);
};

const textLines = (block) => block.lines.filter((l) => !l.text.startsWith(BULLET_PREFIX));
const bulletLines = (block) => block.lines.filter((l) => l.text.startsWith(BULLET_PREFIX));
const singleValue = (block) => textLines(block).map((l) => l.text).join(" ");
const itemLines = (block) => block.lines.map((l) => l.text.trim()).filter(Boolean);

const splitEmojiTitle = (header) => {
  const parts = header.split(/\s+/);
  return { emoji: parts[0], name: parts.slice(1).join(" ") };
};

// --- section parsers ----------------------------------------------------------

function parseChildInfo(i) {
  const end = sectionEnd(i);
  const blocks = splitByMarker(i, end, FIELD_RE);
  if (blocks[0].header === null) fail("بخش «مشخصات کودک» نباید متن خارج از «####» داشته باشد", blocks[0].no);
  const wanted = [
    ["نام و نام خانوادگی", "name"],
    ["تاریخ تولد", "birthDate"],
    ["تاریخ انجام غربالگری", "screeningDate"],
    ["سن هنگام غربالگری", "age"],
    ["غربالگری بعدی", "nextScreeningAt"],
  ];
  if (blocks.length !== wanted.length)
    fail(`در «مشخصات کودک» باید ${wanted.length} فیلد باشد؛ ${blocks.length} پیدا شد`);
  const childInfo = {};
  wanted.forEach(([label, key], k) => {
    const b = blocks[k];
    if (b.header !== label) fail(`انتظار «${label}» بود ولی «${b.header}» آمد`, b.no);
    const v = singleValue(b);
    if (!v) fail(`مقدار «${label}» خالی است`, b.no);
    childInfo[key] = v;
  });
  return { end, childInfo };
}

function parseStatuses(i) {
  const end = sectionEnd(i);
  const blocks = splitByMarker(i, end, SUB_RE);
  if (blocks[0].header === null) fail("بخش «وضعیت مهارت‌های رشدی» نباید متن خارج از «###» داشته باشد", blocks[0].no);
  if (blocks.length !== 3)
    fail(`«وضعیت مهارت‌های رشدی» باید دقیقاً ۳ وضعیت داشته باشد؛ ${blocks.length} پیدا شد`);
  const emojiKey = { "🟢": "onTrack", "🟡": "monitor", "🟠": "evaluate" };
  const seen = new Set();
  const statuses = blocks.map((b) => {
    const { emoji, name: title } = splitEmojiTitle(b.header);
    const key = emojiKey[emoji];
    if (!key) fail(`اموجی «${emoji}» شناخته نشد (باید 🟢، 🟡 یا 🟠 باشد)`, b.no);
    if (seen.has(emoji)) fail(`وضعیت «${emoji}» تکراری است`, b.no);
    seen.add(emoji);
    const description = singleValue(b);
    if (!description) fail(`توضیح وضعیت «${title}» خالی است`, b.no);
    return { key, emoji, title, description };
  });
  return { end, statuses };
}

function parseResults(i, { statuses }) {
  const end = sectionEnd(i);
  const blocks = splitByMarker(i, end, SUB_RE);
  if (blocks[0].header === null) fail("بخش «نتیجه غربالگری» نباید متن خارج از «###» داشته باشد", blocks[0].no);
  if (blocks.length !== 5)
    fail(`«نتیجه غربالگری» باید دقیقاً ۵ حیطه داشته باشد؛ ${blocks.length} پیدا شد`);
  const labelToKey = new Map(statuses.map((s) => [s.title, s.key]));
  const results = blocks.map((b) => {
    const { emoji, name } = splitEmojiTitle(b.header);
    const lines = itemLines(b);
    if (lines.length !== 1)
      fail(`وضعیت حیطه «${name}» باید در یک خط نوشته شود (یکی از: ${[...labelToKey.keys()].join("، ")})`, b.no);
    const status = labelToKey.get(lines[0]);
    if (!status)
      fail(`وضعیت «${lines[0]}» برای حیطه «${name}» شناخته نشد`, b.no);
    return { emoji, name, status };
  });
  return { end, results };
}

const ACCENTS = ["blue", "mint", "pink", "lavender", "peach"];

function parseSkills(i) {
  const end = sectionEnd(i);
  const blocks = splitByMarker(i, end, SUB_RE);
  if (blocks[0].header !== null) fail("مقدمه «مهارت‌ها در ۱۰ ماهگی» خالی است", blocks[0].no);
  const tenMonthsIntro = singleValue(blocks[0]);
  if (!tenMonthsIntro) fail("مقدمه «مهارت‌ها در ۱۰ ماهگی» خالی است", blocks[0].no);
  if (blocks.length - 1 !== 5)
    fail(`در «مهارت‌ها در ۱۰ ماهگی» باید ۵ حیطه باشد؛ ${blocks.length - 1} پیدا شد`);
  const domainSkills = blocks.slice(1).map((b, idx) => {
    const { emoji, name } = splitEmojiTitle(b.header);
    const intro = singleValue(b);
    const bullets = bulletLines(b).map((l) => l.text.slice(BULLET_PREFIX.length).trim());
    if (!intro) fail(`مقدمه حیطه «${name}» خالی است`, b.no);
    if (bullets.length === 0) fail(`برای حیطه «${name}» حداقل یک مهارت با «- » بنویسید`, b.no);
    if (bullets.length > 6) fail(`برای حیطه «${name}» حداکثر ۶ مهارت مجاز است`, b.no);
    return { emoji, name, accent: ACCENTS[idx], intro, bullets };
  });
  return { end, tenMonthsIntro, domainSkills };
}

function parseGames(i) {
  const end = sectionEnd(i);
  const blocks = splitByMarker(i, end, SUB_RE);
  if (blocks[0].header !== null) fail("مقدمه «بازی‌ها و فعالیت‌های پیشنهادی» خالی است", blocks[0].no);
  const gamesIntro = singleValue(blocks[0]);
  if (!gamesIntro) fail("مقدمه «بازی‌ها و فعالیت‌های پیشنهادی» خالی است", blocks[0].no);
  if (blocks.length - 1 !== 5)
    fail(`در «بازی‌ها» باید ۵ حیطه باشد؛ ${blocks.length - 1} پیدا شد`);
  // Fixed page layout in src/components/bookPages.tsx: games split as 3,3,3,(2+2),3.
  const expected = [3, 3, 3, 4, 3];
  const domainGames = blocks.slice(1).map((b, idx) => {
    const { emoji, name } = splitEmojiTitle(b.header);
    const games = [];
    let cur = null;
    for (const l of b.lines) {
      if (l.text.startsWith("#### ")) {
        const parts = splitEmojiTitle(l.text.slice(5));
        cur = { emoji: parts.emoji, title: parts.name, steps: [], no: l.no };
        games.push(cur);
      } else if (l.text.startsWith(BULLET_PREFIX)) {
        if (!cur) fail(`قدم «- » باید داخل یک بازی باشد (بخش «${name}»)`, l.no);
        cur.steps.push(l.text.slice(BULLET_PREFIX.length).trim());
      } else {
        fail(`در بخش «${name}» این خط باید «#### », «- » یا خالی باشد: «${l.text}»`, l.no);
      }
    }
    if (games.length !== expected[idx]) {
      const where = expected[idx] === 4 ? " (این حیطه روی دو صفحه تقسیم می‌شود)" : "";
      fail(
        `حیطه «${name}» باید دقیقاً ${expected[idx]} بازی داشته باشد${where}؛ ${games.length} پیدا شد`,
        b.no
      );
    }
    games.forEach((g) => {
      if (g.steps.length === 0) fail(`بازی «${g.title}» هیچ قدمی ندارد`, g.no);
      if (g.steps.length > 5) fail(`برای بازی «${g.title}» حداکثر ۵ قدم مجاز است`, g.no);
    });
    return {
      emoji,
      name,
      accent: ACCENTS[idx],
      games: games.map((g) => ({ emoji: g.emoji, title: g.title, steps: g.steps })),
    };
  });
  return { end, gamesIntro, domainGames };
}

function parseReminder(i) {
  const end = sectionEnd(i);
  const blocks = splitByMarker(i, end, FIELD_RE);
  const titleB = blocks.find((b) => b.header === "عنوان");
  const textB = blocks.find((b) => b.header === "متن");
  if (!titleB || !textB) fail("بخش «یادآوری» باید «#### عنوان» و «#### متن» داشته باشد");
  const title = singleValue(titleB);
  const lines = itemLines(textB);
  if (!title) fail("عنوان «یادآوری» خالی است", titleB.no);
  if (lines.length === 0) fail("«#### متن» یادآوری خالی است", textB.no);
  return { end, reminder: { emoji: "💛", title, lines } };
}

function parseNextStep(i) {
  const end = sectionEnd(i);
  const blocks = splitByMarker(i, end, FIELD_RE);
  const titleB = blocks.find((b) => b.header === "عنوان");
  const textB = blocks.find((b) => b.header === "متن");
  if (!titleB || !textB) fail("بخش «قدم بعدی» باید «#### عنوان» و «#### متن» داشته باشد");
  const title = singleValue(titleB);
  const lines = itemLines(textB);
  if (!title) fail("عنوان «قدم بعدی» خالی است", titleB.no);
  if (lines.length === 0) fail("«#### متن» قدم بعدی خالی است", textB.no);
  return { end, nextStep: { emoji: "📌", title, lines } };
}

// --- main ----------------------------------------------------------------------

const SECTION_ORDER = [
  ["مشخصات کودک", parseChildInfo],
  ["وضعیت مهارت‌های رشدی", parseStatuses],
  ["نتیجه غربالگری", parseResults],
  ["مهارت‌ها در ۱۰ ماهگی", parseSkills],
  ["بازی‌ها و فعالیت‌های پیشنهادی", parseGames],
  ["یادآوری", parseReminder],
  ["قدم بعدی", parseNextStep],
];

const data = {};
let i = skipBlank(0);

if (i >= raw.length) fail("فایل booklet.txt خالی است");
const titleMatch = raw[i].trim().match(TITLE_RE);
if (!titleMatch) fail("کتابچه باید با «# عنوان» شروع شود", i);
data.bookletTitle = titleMatch[1].trim();
i++;

for (const [name, fn] of SECTION_ORDER) {
  i = skipBlank(i);
  if (i >= raw.length) fail(`بخش «${name}» پیدا نشد`);
  const m = raw[i].trim().match(SECTION_RE);
  if (!m || m[1].trim() !== name)
    fail(`انتظار بخش «${name}» بود ولی «${raw[i].trim()}» پیدا شد`, i);
  const out = fn(i + 1, data);
  Object.assign(data, out);
  i = out.end;
}

i = skipBlank(i);
if (i < raw.length) fail(`محتوی ناشناخته بعد از آخرین بخش: «${raw[i].trim()}»`, i);

// --- cross-section sanity (domains must line up across the three tables) ----
const n = data.domainSkills.length;
for (let k = 0; k < n; k++) {
  const a = data.results[k];
  const b = data.domainSkills[k];
  const c = data.domainGames[k];
  if (!a || a.emoji !== b.emoji || c.emoji !== b.emoji)
    fail(`اموجی حیطه‌ی ${k + 1} در «نتیجه غربالگری»، «مهارت‌ها» و «بازی‌ها» باید یکسان باشد`);
}

// --- render TS -----------------------------------------------------------------

const j = (v) => JSON.stringify(v, null, 2);

const ts = [
  "// ══════════════════════════════════════════════════════════════════",
  "// AUTOGENERATED FILE — do not edit by hand.",
  "//",
  "// The Persian text of this booklet lives in booklet.txt (repo root).",
  "// Edit that file, then run:",
  "//",
  "//     npm run content",
  "//",
  "// (npm runs it automatically before `dev` and `build`.)",
  "// Types stay in src/data/types.ts.",
  "// ══════════════════════════════════════════════════════════════════",
  "",
  'import type { DomainGames, DomainResult, DomainSkill, StatusInfo } from "./types";',
  "",
  `export const bookletTitle = ${j(data.bookletTitle)};`,
  "",
  `export const childInfo = ${j(data.childInfo)};`,
  "",
  `export const statuses: StatusInfo[] = ${j(data.statuses)};`,
  "",
  `export const results: DomainResult[] = ${j(data.results)};`,
  "",
  `export const tenMonthsIntro = ${j(data.tenMonthsIntro)};`,
  "",
  `export const domainSkills: DomainSkill[] = ${j(data.domainSkills)};`,
  "",
  `export const gamesIntro = ${j(data.gamesIntro)};`,
  "",
  `export const domainGames: DomainGames[] = ${j(data.domainGames)};`,
  "",
  `export const reminder = ${j(data.reminder)};`,
  "",
  `export const nextStep = ${j(data.nextStep)};`,
  "",
].join("\n");

writeFileSync(OUT, ts, "utf8");
console.log("✓ booklet.txt  →  src/data/content.ts");