# AGENTS.md — Arman's Growth Booklet (کارنامه غربالگری رشد آرمان)

This file tells AI agents (and humans) what this project is, how it is set up,
and what still needs to be done. Read it before modifying the codebase.

---

## 1. What this project is

A **Next.js website built around a cute, interactive booklet** (flip book) for
parents. Each child has one booklet carrying a **developmental screening report**
(the first one is for a 10-month-old baby named Arman, آرمان دلیری). The booklet
is written in **Persian (Farsi)**, so the whole UI is **right-to-left (RTL)**.

The public site is a **daayar-branded landing page** (`/`, just the logo + a
link to daayar.com) plus one flip book per child at `/<slug>`. The **admin area**
at `/admin` is where booklets are created and edited in the browser (see §5).
The public booklet draws from `/admin/workbooks`-managed JSON content and
otherwise the booklet has no navbar, no footer, no marketing content — just the
book, its page-turn interaction, and controls to flip pages.

### Core requirements (from the user)
- Cute, friendly, child/parent-friendly design with cute illustrations.
- Users must be able to **turn pages** (page-flip animation, works on desktop and mobile).
- Each child gets their own booklet URL; the admin area creates/edits them.
- The store of content is **JSON files inside the repo** (`booklets/<slug>.json`),
  saved to by the editor — no download-to-file workflow.
- Built with **Next.js**.
- The booklet text is parsed into pages for a nice UI.

---

## 2. Tech stack & project state

| Item | Value |
|---|---|
| Framework | **Next.js 16.3.4** (App Router, React 19) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** (CSS-first config — no `tailwind.config.js`; theme lives in `src/app/globals.css` via `@theme`) |
| Layout | `src/app/` (App Router), pages are client components |
| Page-flip | **`react-pageflip`** (wrapper for StPageFlip) — installed |
| Font | **Vazirmatn** (Persian-friendly) from Google Fonts — add via `<link>` in `layout.tsx` or `next/font/google` if available |
| Package manager | **npm** (npm 12) |

### Current state (checkpoint — project is BUILT and working)

✅ Next.js app scaffolded and building cleanly (`npm run build` passes).
✅ `react-pageflip` installed; flip book works (verified via headless Chrome: all page spreads render, flip book initializes, no console errors).
✅ Content lives in `booklets/*.json` (one file per child), compiled into `src/data/content-map.ts` by `scripts/build-booklet.mjs` — see §3.
✅ `/admin` editor edits in the browser and saves back into the same JSON via `POST /admin/api/save` (no download; see §5).

Everything below describes how the code is organized. Content changes happen in
the **browser** (`/admin`, see §5) and land in `booklets/*.json`; never hand-edit
`content-map.ts` (npm regenerates it before every `dev` and `build`). Shared
types are in `src/data/types.ts` (the only hand-written part of the data layer).
Page numbering lives in `src/components/Booklet.tsx` only if pages are
added/removed.

### Useful commands
```bash
npm run dev        # dev server (usually http://localhost:3001 if 3000 is busy); regenerates booklet content first
npm run build      # production build (verifies types); regenerates booklet content first
npm run content    # booklets/*.json → src/data/content-map.ts (runs automatically before dev/build)
npm run lint       # eslint
```

---

## 3. Source content

**The booklet content lives in the repo** as `booklets/<slug>.json` — one full
`BookletData` object per child (filename == slug == booklet URL). `npm run
content` (same as `predev`/`prebuild`) runs `scripts/build-booklet.mjs`, which
reads every file, validates the fixed layout constraints (5 domains, 3 statuses
🟢🟡🟠, game counts 3/3/3/4/3, ≤6 skills, ≤5 steps), and regenerates
`src/data/content-map.ts`. Do **not** hand-edit `content-map.ts`. Shared types
are in `src/data/types.ts` (the only hand-written part of the data layer).

The historical original text lives at (Windows path, outside the repo, kept for
reference only):

```
C:\Users\ARN\Desktop\Any\sare\karname arman.txt
```

It is a Persian developmental-screening report card, **not copied into the repo**
and never read at runtime. The current booklet data (`booklets/*.json`) was
seeded from it via the old plain-text pipeline; the in-browser `/admin` editor
is now the way content is changed.

### Structure of the source text
1. **Cover info** — کارنامه غربالگری رشد آرمان
2. **مشخصات کودک (child info)** — name: آرمان دلیری; birth date: ۰۹/۰۸/۱۴۰۴; screening date: ۰۶/۰۶/۱۴۰۵; age: ۱۰ ماهگی
3. **وضعیت مهارتهای رشدی** — explanation of the three status levels:
   - 🟢 **متناسب با سن** (age-appropriate — no action needed)
   - 🟡 **محدوده پایش** (monitoring range — keep playing/practicing)
   - 🟠 **نیاز به ارزیابی بیشتر** (needs further evaluation by a specialist — not a diagnosis)
4. **نتیجه غربالگری (results table)** — five domains and their status:
   - 💬 ارتباطات → محدوده پایش
   - 🏃 حرکات درشت → نیاز به ارزیابی
   - 🖐️ حرکات ظریف → متناسب با سن
   - 🧩 حل مسئله → متناسب با سن
   - 🤝 شخصی ـ اجتماعی → نیاز به ارزیابی
5. **در ۱۰ ماهگی چه مهارتهایی شکل میگیرند؟** — a description of expected skills per domain.
6. **بازیها و فعالیتهای پیشنهادی (suggested games)** — 3–4 games per domain (16 games total), each with a title, an emoji, and step-by-step instructions.
7. **💛 یادآوری مهم** — a warm reminder: no special toys or strict plans needed, just play and be present.
8. **📌 قدم بعدی** — next screening at 12 months; screening is not a diagnosis; specialist evaluation helps early support.

---

## 4. Design direction (make it cute!)

- **Colors:** soft pastels — cream/peach page backgrounds, mint green, baby blue, soft pink, lavender, sunshine yellow. Each of the 5 domains gets its own pastel accent color:
  - 💬 ارتباطات → baby blue
  - 🏃 حرکات درشت → mint green
  - 🖐️ حرکات ظریف → soft pink
  - 🧩 حل مسئله → lavender
  - 🤝 شخصی ـ اجتماعی → peach/orange
- **Status colors** (keep them meaningful): 🟢 green, 🟡 yellow, 🟠 orange.
- **Illustrations:** create **inline SVG components** (no external image downloads) — e.g. a cute baby face for the cover, plus stars ✦, clouds ☁️, hearts 💛, flowers, and little toys. Reuse the **emojis already in the source text** (🐶 ⚽ 🧸 🙈 👋 etc.) — they are part of the content.
- **Typography:** Vazirmatn font, rounded cards, generous whitespace, playful headings with emoji accents.
- **Page background:** a soft, subtly patterned backdrop *behind* the book is fine; nothing that looks like a separate website section.

---

## 5. Planned page layout (parse the text into this)

Content pages, in reading order (index 0 = cover):

| # | Page | Content |
|---|---|---|
| 0 | **Cover** (hard) | Big title 🌱 کارنامه غربالگری رشد آرمان, cute baby illustration, "کتابچه راهنمای والدین" vibe |
| 1 | **مشخصات کودک** | Child info cards: name, birth date, screening date, age |
| 2 | **وضعیت مهارتها** | The three status explanations (green/yellow/orange cards) |
| 3 | **نتیجه غربالگری** | Results table: 5 domains × status (color-coded chips) |
| 4 | **در ۱۰ ماهگی** | Intro paragraph: every child grows at their own pace |
| 5–9 | **مهارتها در ۱۰ ماهگی** | One page per domain: 💬 ارتباطات، 🏃 حرکات درشت، 🖐️ حرکات ظریف، 🧩 حل مسئله، 🤝 شخصی ـ اجتماعی |
| 10–14 | **بازیهای پیشنهادی** | One page per domain with its games (ارتباطات 3, حرکات درشت 3, حرکات ظریف 3, حل مسئله 4, شخصی ـ اجتماعی 3) — each game = numbered card with emoji title + steps |
| 15 | **💛 یادآوری مهم** | Warm reminder card |
| 16 | **📌 قدم بعدی** | Next screening at 12 months + "screening ≠ diagnosis" note |
| 17 | **Back cover** (hard, optional) | "پایان" + heart/star decorations |

---

## 6. Implementation plan

1. **Install the flip library:**
   ```bash
   npm install react-pageflip
   ```
   (If it fails/hangs on this machine, add `--fetch-timeout=60000 --fetch-retries=1`.)

2. **`booklets/*.json`** — one full `BookletData` object per child, the source
   of truth (edited in the browser at `/admin`). `bookPages.tsx` + the page
   components render it (child info, statuses, results table, domain skill
   descriptions, games per domain, reminder, next-step text). Keep the exact
   Persian wording, including emojis.

3. **`src/components/decor.tsx`** — cute reusable SVG components: `BabyFace`, `Star`, `Cloud`, `Heart`, `Flower`, maybe `Sun`/`Balloon`. Small, pure, no dependencies.

4. **`src/components/PageShell.tsx`** — shared page layout: pastel paper background, padding, page-number footer, decorative corners. All page components must be **`React.forwardRef`** components (react-pageflip requires the ref on the page root).

5. **`src/components/pages/`** — one component per page from §5:
   - `CoverPage.tsx`, `ChildInfoPage.tsx`, `StatusLegendPage.tsx`, `ResultsPage.tsx`, `TenMonthsIntroPage.tsx`, `DomainSkillsPage.tsx` (reusable, driven by data), `GamesPage.tsx` (reusable, driven by data), `ReminderPage.tsx`, `NextStepPage.tsx`, `BackCoverPage.tsx`.

6. **`src/components/Booklet.tsx`** — client component wrapping `HTMLFlipBook`:
   ```tsx
   "use client";
   import HTMLFlipBook from "react-pageflip";
   ```
   - Props: `width={550} height={733} size="stretch" minWidth={315} maxWidth={1000} minHeight={400} maxHeight={1400} maxShadowOpacity={0.5} showCover mobileScrollSupport className="book"`
   - `showCover={true}` makes the first/last pages hard covers. StPageFlip is
     LTR-internally, so it puts index 0 alone on the **right**; the Persian
     (right-to-left) *book* is produced by handing it the pages in reverse — see
     §7 and `bookPages.tsx` (the front cover is the **last** index, alone on the
     left, and `next` is the engine's `flipPrev`).
   - Use a `ref` (`flipBook.getPageFlip()`) for prev/next buttons: `flipNext()` / `flipPrev()`.
   - Track current page via `onFlip` for page indicators/controls.
   - Every page wrapper must have `dir="rtl"` and `lang="fa"`.

7. **`src/app/page.tsx`** — the daayar landing: logo + title + link to
   daayar.com, nothing else.

8. **`src/app/layout.tsx`** — `lang="fa" dir="rtl"`, Vazirmatn font, background styling.

9. **`src/app/globals.css`** — Tailwind v4 `@theme` tokens for the pastel palette + Vazirmatn font family + any custom page-flip CSS. Delete all Next.js boilerplate CSS.

10. **`src/app/[slug]/page.tsx`** — SSG booklet page (from `generateStaticParams`),
    and `src/app/admin/*` — hub, workbook list, editor, and the
    `POST /admin/api/save` route that writes `booklets/<slug>.json`.

11. **Verify:** `npm run build`, then `npm run dev` and click through every page (desktop + narrow/mobile view). Check the page-turn animation, that the closed cover opens on the **left** and a spread shows the lower number on the right, RTL text, and that no content overflows a page.

---

## 7. Gotchas & conventions

- **npm 12 blocks install scripts.** It may warn: `install-scripts ... blocked because they are not covered by allowScripts`. This is expected and non-fatal; do not fight it. If a package genuinely needs its postinstall, run `npm install-scripts approve <pkg>` or add `"allowScripts"` to `package.json`/`.npmrc`.
- **Slow network on this machine:** npm fetches can stall for minutes (default fetch-timeout 300 s). Pass `--fetch-timeout=60000 --fetch-retries=1` when installing.
- **react-pageflip RTL notes (the booklet is mirrored — read this before touching page order):** the library is LTR-internally, which is fine — `dir="rtl"` goes on the page content. In landscape it paints `spread[0]` on the left and `spread[1]` on the right; in portrait/narrow mode it shows one page at a time in index order. To get a Persian (right-to-left) book, `bookPages.tsx` hands it the pages **reversed**, so index 0 is a spacer, index 1 the back cover, … and the last index is the front cover (alone on the left, the mirror of the engine's closed cover on the right). Consequences you must not forget:
  - `flipNext` in `Booklet.tsx` calls the engine's **`flipPrev`** and vice versa;
  - `startPage` must be the **last** index;
  - the spacer page (`SPACER_INDEX`, index 0) is unreachable from the buttons and the arrow keys, and `onFlip` bounces back if a click/drag lands on it (measured: the reader sees a quick close-and-return, then the back cover again);
  - do **not** mirror the book with a CSS `transform` instead: StPageFlip measures raw client coordinates, so a mirrored element makes corner dragging grab the wrong page. The page order IS the mirror.
  - portrait was re-verified after the reversal (cover → ۱..۱۷ → back cover, one page at a time), so the old "reversing breaks portrait" warning no longer applies — but the flip mapping above is what keeps it correct.
- **Page components MUST forward refs** and each page root must accept the `ref` (react-pageflip measures them). Hard covers use `data-density="hard"`.
- **Text fitting:** pages are fixed-aspect (550×733 base). Use `text-sm`/`text-base`-ish sizes and test the densest pages (games pages with 3–4 cards) so nothing overflows. Overflowing content should be shortened or split across pages rather than made scrollable.
- **Keep it a booklet only.** No navbars, headers, footers, or extra site content — the page-turn controls (prev/next buttons + page indicator) are the only chrome, plus the small «❓ راهنما» button that re-opens the guided tour (see §9, the 2026-09-11 tour entry).
- **Persian digits** (۰۹/۰۸/۱۴۰۴) should be preserved as-is from the source.
- Write code comments in English; UI text stays in Persian.

---

## 8. Multi-agent workflow — every agent must leave a written plan here

**This file is the hand-off between agents. Any agent that works on this
project MUST write the summary of its plan in this file before it stops, so the
next AI agent can pick up the job without re-deriving anything.**

Write (or update) one entry at the top of §9, structured as:

1. **Asked for** — what the user actually requested.
2. **Plan / approach** — the decisions taken and *why*, not just the diff.
3. **Done** — files added, changed or deleted.
4. **Verified** — commands run, measurements, screenshots: evidence, not claims.
5. **Left to do** — remaining work, or "nothing".
6. **Traps** — anything that would waste the next agent's time.

The top entry is the *current task*: keep it marked `(IN PROGRESS)` while you are
working and change it to `(DONE)` when you stop. Newest entry first. Never delete
or rewrite someone else's entry — append a new one (or update your own).

Finally, delete stale claims: if you change or remove something an older entry
describes (a route, a file, a setting), say so in your own entry rather than
leaving the next agent to trust a note that is no longer true.

**Verification tooling:** `src/.probe/` (a CDP screenshot / DOM-probe helper set)
was deleted together with the 3D route — see the log entry below. Recreate it if
you need to measure the flip book again; the useful recipe is:

- run headless Chrome from the repo root with `--remote-debugging-port=<port>`
  and a **separate** `--user-data-dir`,
- over CDP call `Emulation.setDeviceMetricsOverride` to test several viewport
  sizes without restarting the browser,
- then read `getBoundingClientRect()` of `.stf__parent` (the book), `.stf__item`
  (a single page) and `main` to confirm the book still fits the viewport.

Do **not** `taskkill chrome.exe`: the user keeps their own Chrome (and its
remote-debugging session) open while working. Always start your own instance on
an unused port instead of killing theirs.

---

## 9. Task log (newest first)

### 2026-09-12 — Editable section titles (DONE)

1. **Asked for:** make the collapsible section titles in the editor editable
   (e.g. «📖 مهارت‌ها در ۱۰ ماهگی»), keep the current values as placeholders
   (used when the user leaves the field empty), and per clarification the
   typed title must also appear on the booklet page headers.

2. **Plan / approach:** a new optional `titles` block on `BookletData` maps the
   five *page-header* sections: `childInfo`, `statuses`, `results`,
   `tenMonths`, `games`. Empty string = "use the default Persian title" (the
   exact headers the pages hardcoded before), so existing booklets render
   byte-identically; a filled string overrides the page header. `titles` is
   optional on `BookletData` (`Partial<BookletTitles>`) so `booklets/*.json`
   need no migration and all three validators need no change (the generator and
   save route pass the parsed object through untouched). In the editor the five
   Section `<summary>` labels became inline `<input>`s (emoji stays as a static
   prefix, `stopPropagation` keeps the summary click from toggling the details);
   their placeholder shows the current default so "empty = default" is visible.
   Old localStorage drafts (pre-titles) are normalized on load via
   `emptyTitles()` so `data.titles.foo` never reads undefined. Dynamic defaults
   stay dynamic: results placeholder = «نتیجه غربالگری {name}», tenMonths
   placeholder = «در {age} چه مهارت‌هایی…». Shared default-resolution logic
   lives in `src/lib/titles.ts` (`pageTitle()`) so pages and the editor can't
   drift.

3. **Done:**
   - `src/data/types.ts` — `BookletTitles` interface + `titles?: Partial<BookletTitles>` on `BookletData`.
   - `src/lib/titles.ts` — new: `pageTitle(titles, key, fallback)`.
   - `src/components/pages/info.tsx` — `ChildInfoPage`, `StatusLegendPage`, `ResultsPage`, `TenMonthsIntroPage` accept `titles` and use `pageTitle` for their headers.
   - `src/components/pages/games.tsx` — `GamePage` same, subtitle unchanged.
   - `src/components/bookPages.tsx` — passes `content.titles` to those pages.
   - `src/components/editor/Preview.tsx` — passes `c.titles` in its preview stack.
   - `src/components/editor/bookletData.ts` — `EditorData.titles`, `editorFromContent` reads `content.titles`, `emptyTitles()` helper, `toContentShape` emits `titles`.
   - `src/components/editor/BookletEditor.tsx` — `Section` gained emoji/titleValue/titlePlaceholder/onTitleChange; the 5 sections (👶 مشخصات کودک، 🌱 وضعیت مهارت‌ها، 🧾 نتیجه غربالگری، 📖 مهارت‌ها در ۱۰ ماهگی، 🎯 بازی‌ها) got editable titles; draft loader normalizes missing `titles`.

4. **Verified:** `npm run content` ✓ (both booklets build), `npx tsc --noEmit` ✓,
   `npm run lint` ✓, `npm run build` ✓ (routes unchanged). Browser (fresh
   `next start` on 3114): the editor's five summary labels render as editable
   textboxes with the expected placeholders; typing «رنگ‌های وضعیت رشدی» into the
   🌱 statuses title updated the section header input AND the live preview page 2
   header («رنگ‌های وضعیت رشدی» won over the default) with 0 console errors; the
   typed value persisted to `localStorage["arman-booklet-draft:arman-daliri"].data.titles`
   (then cleared, so the user's real editor stays untouched — do not leave test
   drafts around). `/arman-daliri` still renders 20 flip-book pages with 0
   console errors.

5. **Left to do:** nothing required. Open idea: a per-page «عنوان» caption in the
   preview so editors see which header a title maps to.

6. **Traps:**
   - `titles` is optional everywhere: leave it out of a JSON file and the pages
     fall back to the hardcoded defaults. Do NOT make it required in the
     validators — that would break older files.
   - The editor title inputs live inside `<summary>`; they need
     `onClick={(e) => e.stopPropagation()}` or clicking into them toggles the
     collapsible open/closed state.
   - Old drafts have no `titles` key — `loadDraft` must merge via `emptyTitles()`
     or `data.titles.foo` throws on an old stored draft.
   - The 5 title keys match page-headers, NOT the reminder/next-step sections
     (those already had editable `title` fields) and NOT «📄 عنوان کتابچه»
     (already editable). Only the five page-header sections got inputs.
   - `pageTitle` trims before deciding empty, so a whitespace-only saved title
     acts as empty (falls back to the default).

### 2026-09-12 — Empty sections, default emojis, localStorage drafts, preview crash fix (DONE)

1. **Asked for:** (a) let booklet sections be empty and render "−" when a
   section is empty, (b) pre-fill the emoji fields with a default emoji the
   user can edit, (c) autosave every filled field to localStorage so a page
   refresh doesn't lose the data, (d) fix the «👁 پیش‌نمایش صفحات» button on
   `/admin/new` which threw.

2. **Plan / approach:** the preview crash was a data-arity bug, not a layout one:
   `emptyEditorData()` set `resultStatus: [...STATUS_KEYS]` (3 entries) but
   there are 5 domains, so `toContentShape` produced `status: undefined` for
   domains 4–5 and `StatusChip`/`statusStyles[undefined].soft` blew up. Fixed by
   seeding one 🟢 per domain. Then, since empty sections must be *valid* (the
   pages show "−" for them), all three validation layers (browser
   `validateBooklet.ts`, server `scripts/build-booklet.mjs`, `/admin/api/save`
   `looksLikeBookletData`) were relaxed from "non-empty text required" to
   "structure only" — the fixed counts (5 domains, 3 statuses in order, game
   counts 3/3/3/4/3, status-key validity, emoji cross-table equality, ≤6
   bullets / ≤5 steps) are still enforced; blank text is fine. Emoji defaults
   come from `emptyEditorData()` (domain `💬🏃🖐️🧩🤝`, 16 game emojis in a flat
   pool across the 16 games) and remain editable. A `orDash()` helper
   (`src/lib/fa.ts`) renders "−" for empty strings on every page that reads
   content (cover name, child info, statuses, results, ten-months intro, skill
   intro/bullets, game title/emoji/steps, reminder, next-step); empty *arrays*
   render a single "−" row. Draft persistence uses one localStorage record per
   slug (`arman-booklet-draft:<slug|new>`, `{v:1,data,newSlug}`), loaded in the
   `useState` initializers (draft beats `content`), written from a
   `useEffect` on every change, with a «🗑 پاک کردن پیش‌نویس» reset button in
   the save-flow note.

3. **Done:**
   - `src/lib/fa.ts` — new `orDash()`.
   - `src/components/editor/bookletData.ts` — `resultStatus` now 5 entries;
     `GAME_EMOJI_DEFAULTS` (16) + `DOMAIN_EMOJIS`; `emptyEditorData` seeds them.
   - `src/components/editor/validateBooklet.ts` — rewritten: structure-only.
   - `scripts/build-booklet.mjs` — `isText()` helper; ALL "must not be empty"
     checks removed (kept counts, order, emoji equality, limits).
   - `src/app/admin/api/save/route.ts` — `isNonEmptyString` → `isString`.
   - `src/components/editor/BookletEditor.tsx` — draft load/save/clear helpers +
     effect; «🗑 پاک کردن پیش‌نویس» button in the save-flow note.
   - `src/components/pages/` `cover.tsx`, `info.tsx`, `skills.tsx`, `games.tsx`,
     `closing.tsx` — `orDash()` everywhere; duplicate-key (empty-string) React
     keys changed to index keys; empty arrays render one "−".
   - `src/components/Booklet.tsx` — dropped unused `Link`/`slug` props.

4. **Verified:** `npm run content` ✓ (arns + an all-empty test booklet both
   build), `npx tsc --noEmit` ✓, `npm run lint` 0 warnings (all three
   pre-existing unused-var warnings fixed), `npm run build` ✓ (routes unchanged).
   Browser (Playwright, fresh `next start` on 3114): «👁 پیش‌نمایش صفحات» on
   `/admin/new` opens the live preview with **no crash** and 0 console errors;
   empty fields render "−" everywhere (cover name, child info, statuses,
   results, skills, games, reminder, next-step) as previewed; the 16 default
   game emojis 🎈⚽🧸🚂🪁🐶🧩🎨🎵📚🪀🛁🐢🦋🌼🚀 appear in order; typing a field →
   `localStorage["arman-booklet-draft:new"]` updated; reload restores the text;
   «🗑 پاک کردن پیش‌نویس» clears it; `/arman-daliri` still renders the real
   name/filled content (tour open, 0 console errors); `/admin/edit/arman-daliri`
   loads its own draft key separate from `new`. Save API round-trip: POSTing an
   all-empty `{slug:"empty-test",data}` file returns `{ok:true}` and the builder
   accepts it; test file removed afterwards. (Note: curl from Git-bash mangles
   multibyte emoji in `-d` — POST real booklets via `fetch`/the editor, or use
   `--data-binary @file` from the repo dir with the `{slug,data}` envelope.)

5. **Left to do:** nothing required. Open idea: a "this is a draft, not yet
   saved" badge when the localStorage draft differs from `content`.

6. **Traps:**
   - `orDash` renders the literal character "−" (U+2212 minus) for blank text;
   don't search for an ASCII hyphen.
   - `resultStatus` MUST stay length 5 (one per domain). `emptyEditorData` and
     `toContentShape` are the two places that pair domains ↔ statuses; if either
     drifts the `statusStyles[undefined]` crash returns.
   - The three validators (validateBooklet.ts, build-booklet.mjs, save route)
     are three copies of the "structure-only" rules — keep them in sync. Emoji
     cross-table equality is still enforced by the builder and by the API's
     count checks, so a saved file with mismatched domain emoji fails `npm run
     content`; the editor prevents it (single shared domain emoji).
   - Draft restore beats `content` on purpose (a refreshed edit should not lose
     typed text). The reset button exists precisely because drafts are sticky —
     if localStorage ever holds a stale model, clear it or click «پاک کردن
     پیشنویس».
   - The `nextScreeningAt` dash: `NextStepPage` reads `ns.lines[0]` / `ns.lines[2]`
     — the "−" placeholder also guards missing indices (`?? ""`).

### 2026-09-11 — JSON storage, /admin routing & save API; daayar landing (DONE)

1. **Asked for:** "i dont want to downlaod the thing to get working. you should
   store it your self in a json on this project" — the editor must save into the
   repo's own files, with no download-to-file workflow. Also: the workbook list
   must move OFF `/` to `/admin/workbooks`, and `/` should only show the daayar
   icon/title linking to daayar.com.

2. **Plan / approach:** replaced the plain-text pipeline with real data files.
   `booklets/arman-daliri.json` is now one full `BookletData` object per child
   (filename == slug); `scripts/build-booklet.mjs` reads/validates every
   `booklets/*.json` and regenerates `src/data/content-map.ts` (validates 5
   domains, 3 statuses 🟢🟡🟠 in order, game counts 3/3/3/4/3, ≤6 skills, ≤5
   steps). Cross-section check is now JSON-driven and compares emoji only (domain
   3 name differs legitimately between results «حل مسئله» and skills/games «حل
   مسئله و شناخت»). Saving is a `POST /admin/api/save` route that writes
   `booklets/<slug>.json` with `fs` (slug regex + minimal shape check; clear
   Persian errors; read-only-FS error for Vercel). The editor now POSTs to it
   instead of downloading a txt; the «نمایش متن» modal shows the JSON; the
   `exportBooklet.ts` writer was deleted. `/` is a daayar splash (logo at
   `/assets/images/logo.png`, title «دایار», subtitle, link to daayar.com), and
   the workbook list lives at `/admin/workbooks` with `/admin` as a hub with
   buttons. `[slug]/page.tsx` is the SSG per-child booklet page
   (`generateStaticParams` from `SLUG_LIST`, `generateMetadata`, `notFound`).

3. **Done:**
   - `booklets/arman-daliri.json` — new (migrated from the txt pipeline);
     `booklets/arman-daliri.txt` deleted from git.
   - `scripts/build-booklet.mjs` — rewritten: `booklets/*.json` → validate →
     `src/data/content-map.ts` (imports only `BookletData`); `SLUG_LIST` +
     `BOOKLETS` exported.
   - `src/app/admin/api/save/route.ts` — new save endpoint.
   - `src/app/page.tsx` — daayar landing (logo + «دایار» + link).
   - `src/app/admin/page.tsx` — hub: buttons to `/admin/workbooks`, `/admin/new`, `/`.
   - `src/app/admin/workbooks/page.tsx` — new workbook list (view/edit per child).
   - `src/app/admin/edit/[slug]/page.tsx` and `src/app/admin/new/page.tsx` — new.
   - `src/app/[slug]/page.tsx` — new SSG booklet page; `src/app/page.tsx` no longer renders the whole book.
   - `src/components/editor/BookletEditor.tsx` — `saveBooklet()` POSTs to the API;
     note/slug-hint/modal updated; removed `downloadBooklet`.
   - `src/components/editor/exportBooklet.ts` — deleted (txt writer). `bookletData.ts`
     / `validateBooklet.ts` / `types.ts` comments updated to the JSON model.
   - `src/components/Booklet.tsx` — `content` + `slug` props, edit link →
     `/admin/edit/<slug>`, passes `childInfo` to the tour.
   - `public/assets/images/logo.png` — placeholder 96×96 mint square; **the real
     daayar logo must be supplied by the user** (daayar.com unreachable from the
     sandbox; no logo on disk).
   - `README.md` + `AGENTS.md` — rewritten for JSON source of truth, new routes,
     browser-editor workflow.

4. **Verified:** `npm run content` ✓ (regenerates content-map from JSON); `npx
   tsc --noEmit` ✓; `npm run lint` ✓ (0 errors; distinct-booklet-name check is a
   build-only warning); `npm run build` ✓ — routes: `/` static, `/arman-daliri`
   SSG, `/admin` static, `/admin/api/save` dynamic, `/admin/edit/[slug]`
   dynamic, `/admin/new` + `/admin/workbooks` static. Live probe against `next
   start`: all 6 routes HTTP 200; save API wrote `booklets/test-kid.json` then
   rejected a bad slug and malformed data (Persian errors); test file removed
   after. Browser (Playwright): `/` shows logo/title/link with no console
   errors; `/arman-daliri` renders cover left + tour + edit link, flips to
   spread «صفحههای ۱ و ۲ از ۱۷»; `/admin` hub; `/admin/workbooks` lists
   آرمان دلیری with /arman-daliri slug + view/edit; editor shows «ذخیره در
   پروژه» + `booklets/arman-daliri.json` note and loads current content; the
   on-disk JSON round-trips through the editor's `toContentShape` unchanged.

5. **Left to do:** the user should drop the real daayar logo over
   `public/assets/images/logo.png`; nothing code-wise is pending.

6. **Traps:**
   - **There is no `booklet.txt` and no `src/data/content.ts` any more.** Do not
     trust older §9 entries that describe them; the whole data layer became
     `booklets/*.json` → `content-map.ts`. The generator's cross-section check
     must stay JSON-driven and emoji-only (except the intentional name mismatch).
   - The editor holds `EditorData` and converts via `toContentShape()`; the save
     request body must use **that** shape (`bookletData` memo, not the editor's
     working copy) or the page components will render wrong.
   - `/admin/api/save` uses `fs` — works on local dev/`next start`, fails with a
     clear Persian error on Vercel (read-only FS). That is expected, not a bug.
   - `exportBooklet.ts` is gone; do not re-import it. The «نمایش متن» modal now
     shows JSON (`dir="ltr"` for the code block).
   - The `.book-stage` chrome budget is exactly **132px** today (see the tour
     entry); if the `/` landing or admin chrome changes size, remeasure.

### 2026-09-11 — Plain-text booklet source + build pipeline (DONE)

1. **Asked for:** "I want to be able to put the text in the booklet myself" +
   written plan for a future in-browser editor (Option 3).

2. **Plan / approach:** move the source of truth for all Persian text out of
   `src/data/content.ts` into `booklet.txt` (repo root), a plain, Notepad-editable
   file whose format is documented at its top. A small Node parser
   (`scripts/build-booklet.mjs`) compiles it back into `content.ts`, enforcing the
   fixed layout constraints (5 domains, game counts 3/3/3/4/3, ≤6 skills, ≤5 steps)
   so a text edit can never silently break the page layout. Types were split into
   `src/data/types.ts` so the generator only emits data. Child name/age were
   threaded through all hardcoded spots (cover, info, closing, tour, layout) so a
   single name change in `booklet.txt` updates the entire book. The editor-plan
   document (`docs/editor-plan.md`) captures the Option-3 design.

3. **Done:**
   - `src/data/types.ts` — new: interfaces and `StatusKey`/`AccentKey` types
     moved here; the only hand-written file in the data layer.
   - `booklet.txt` — new: 190-line Notepad-editable Persian source, seeded from
     the old `content.ts` via `scripts/export-booklet.mjs` (one-time tool).
   - `scripts/build-booklet.mjs` — new: ~340-line parser/generator/validator;
     reads `booklet.txt`, validates structure, writes `content.ts`.
   - `scripts/export-booklet.mjs` — new: one-time tool that imported the old
     `content.ts` (Node 24 TS-stripping) and wrote the initial `booklet.txt`;
     not part of the normal build; kept in repo as a reference.
   - `src/data/content.ts` — now `AUTOGENERATED`; imports types from `./types`;
     new `childInfo.nextScreeningAt` field ("۱۲ ماهگی").
   - `package.json` — new scripts: `"content"`, `"predev"`, `"prebuild"`.
   - Type-only imports in `PageShell.tsx`, `skills.tsx`, `games.tsx` now point at
     `@/data/types`.
   - Parameterized name/age: `cover.tsx` (big name, tagline), `info.tsx` (status
     legend subtitle, results title, "در X ماهگی" heading), `closing.tsx` (pill
     age, back cover tagline), `GuidedTour.tsx` (welcome step), `layout.tsx`
     (metadata title/description).
   - `AGENTS.md` — updated §2 commands, §3 source-of-truth note, §6 `content.ts`
     note, this entry.
   - `README.md` — "Editing the content" subsection updated; `npm run content`
     added to the commands table; the file map updated with `types.ts` and
     `booklet.txt`; "How to edit the booklet's text" rewritten for the txt file.
   - `docs/editor-plan.md` — new: full design for the Option-3 browser editor
     (form, export flow, validation, static-site constraint, traps).
   - No page components changed.

4. **Verified:** `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean
   (prebuild auto-regenerated `content.ts`). Automated parity check confirmed
   every exported value (except the new `childInfo.nextScreeningAt`) is byte-
   identical between the old hand-written `content.ts` and the new generated
   version, including deep string comparison of every game step and ZWNJ-
   sensitive Persian text. A running dev server on port 3000 serves HTTP 200 with
   the correct `<title>` metadata. No browser probe was run because the page
   content is byte-identical to before (visual regression risk: none).

5. **Left to do:** the Option-3 in-browser editor (see `docs/editor-plan.md`).
   Open ideas: a "preview pane" in the editor rendering the actual booklet
   components at 550×733; a "Show the raw txt" clipboard copy mode for GitHub
   web-editing users.

6. **Traps:**
   - `booklet.txt` format uses `## ` / `### ` / `#### ` / `- ` as structural
     markers; the `;;` comment prefix is the only safe place for notes. If a
     user puts `##` in a description or `-` at the start of a game title the
     parser will misinterpret it. Document this clearly at the top of
     `booklet.txt` (done).
   - The `scripts/export-booklet.mjs` imports `.ts` directly; this works on
     Node ≥24 (type-stripping by default) but will emit a warning and would break
     on older Node. It is a one-time tool, not part of the build.
   - Game counts per domain are enforced as [3,3,3,4,3] because `bookPages.tsx`
     hard-codes the split for domain 3 (حل مسئله) across pages 13/14. If the
     page layout ever changes, the enforced counts in `build-booklet.mjs` and the
     game split in `bookPages.tsx` must be updated together.
   - The book title line (`# `) is parsed as `bookletTitle`; it is used by
     `layout.tsx` metadata but not by the cover page (which uses a decorative
     two-line layout). Changing the title changes the browser tab, not the cover.
   - `content.ts` is now regenerated on every `dev` and `build`. Hand-editing
     it is possible but pointless — your changes will be overwritten.
   - The `nextScreeningAt` field lives in `childInfo` (not in `nextStep`), so
     the closing page pill reads it from one canonical source.

### 2026-09-11 — Covers: spine shadow moved to the bound (right) edge (DONE)

1. **Asked for:** "the shadow on the cover to be on the right side".

2. **Plan / approach:** the spine shading is the bound-edge shadow — the dark
   band where the book folds, i.e. the edge that faces the centre spine. In the
   pre-mirror book the cover stood in the right half, so that edge was its LEFT
   side; after the mirror both covers sit in the left slot and their bound edge
   is the RIGHT one. So the fix is the same flip for both covers: move the
   shading (and the front cover's two stitch lines) from `left-0` to `right-0`
   and reverse the gradient, rather than adding a new shadow.

3. **Done:**
   - `src/app/globals.css` — `.cover-spine` gradient is now `to left` (Chrome
     serialises it as `270deg`), so the 0% dark stop starts on the right edge;
     comment updated to say which edge is the bound one.
   - `src/components/pages/cover.tsx` — shading `left-0` → `right-0`, stitch
     lines `left-[16px]`/`left-[22px]` → `right-[16px]`/`right-[22px]`.
   - `src/components/pages/closing.tsx` — same flip for the back cover.
   - This supersedes the older covers log entry below, which describes the spine
     shading and stitching sitting on the bound **(left)** edge — that was
     correct before the mirror, and is not correct now.

4. **Verified:** `tsc --noEmit`, `npm run lint`, `npm run build` clean. Headless
   Chrome at 1920×1080 (spread 620px wide per page):
   - front cover — shading flush with the cover's right edge (`right 960` vs
     `960`, offset **0px**), sitting in the right half (`left 942` vs centre
     `650`), both stitch lines at `601`/`594` of 620; computed gradient
     `linear-gradient(270deg, rgba(47,123,98,0.28) 0%, … 0.08 55%, 0 100%)`;
   - back cover (last spread) — identical alignment and gradient;
   - the `cover-front` / `cover-back` backgrounds still render (so the mirror and
     this change did not disturb the inline-style trap fix).
   All 10 checks pass. Probe deleted afterwards.

5. **Left to do:** nothing.

6. **Traps:** `to left` is *not* a mistake — with the covers in the left slot the
   bound edge is the right one, so the gradient has to run right → left. If the
   book is ever un-mirrored, this has to be flipped back along with the page
   order (§7).

### 2026-09-11 — Mirror the booklet into a real Persian (right-to-left) book (DONE)

1. **Asked for:** the *book itself*, not the buttons — "the pages starts on the
   right but it should be on the left", "the whole thing should be sideways".
   Reading it as: the closed cover belongs on the **left**, pages turn **left →
   right**, and in a spread the lower number is on the **right** (the page a
   Persian reader takes first).

2. **Plan / approach:** StPageFlip is an LTR engine — `showSpread()` paints
   `spread[0]` left / `spread[1]` right, index 0 alone on the **right**, flips
   right→left, and its `showCover` spread builder is fixed
   (`[[0],[1,2],[3,4],…]`, last index alone only when the count is even). It has
   no RTL/`direction` setting (checked the bundle: every `direction` hit is the
   internal flip direction, not a locale option).
   - Option A, rejected: mirror the DOM with `transform: scaleX(-1)` on the
     book plus each page. StPageFlip computes hit-testing from
     `getBoundingClientRect()` + raw `clientX` (`getMousePos`, `convertToPage`),
     so a mirrored element makes the corner you grab flip the *opposite* page.
   - Option B, **chosen**: hand the engine the pages **reversed**. No coordinate
     lying, so corner dragging, shadows and the flip animation all keep working
     unchanged — only the *meaning* of the two engine flips swaps.
   - Odd page count (19) problem: reversed, the front cover lands at the last
     index, but the engine only treats the last index as a closed cover when the
     count is **even**, so the cover would share a spread with p1 instead of
     standing alone. Fix: a spacer page at index 0 (even count 20) that sits
     where the mirror of the closed cover would be, i.e. past the back cover.

3. **Done:**
   - `src/components/bookPages.tsx` — rewritten around `buildBookPages()` →
     `{ nodes, meta }`. Order is now `[spacer, back cover, p17 … p1, front
     cover]`; `meta[i]` describes each index so the UI never has to do index
     arithmetic (`SPACER_INDEX`, `LAST_SPREAD_INDEX` exported).
   - `src/components/Booklet.tsx` — `flipNext` now calls the engine's `flipPrev`
     (and vice versa), `startPage` is the last index, the old `total`/`readTotal`
     state is gone (the indicator derives everything from `meta`), labels are
     built from the visible *numbered* descriptors in reading order, the arrow
     keys are gated by `atStart`/`atEnd`, and `onFlip` bounces any landing on
     `SPACER_INDEX` back to the back cover.
   - Docs: README §4 gained the reversed-order diagram + the spacer, §7 lost the
     stale "do not reorder the children array" trap and gained the flip-mapping
     rules; AGENTS.md §6/§7 updated the same way.

4. **Verified:** `tsc --noEmit`, `npm run lint`, `npm run build` clean. Headless
   Chrome, fresh load per viewport, **30+ checks all pass**: the book opens with
   the front cover **alone on the left half** (`cx 650 < 960`) and the indicator
   «جلد کتاب»; every spread after it shows the **lower number on the right**;
   walking forward gives the reading order `1,2,3,…,17` exactly once with the
   indicator walking «صفحههای ۱ و ۲» … «صفحه ۱۷ از ۱۷»; portrait (390×844) runs
   cover → ۱..۱۷ → back cover, one page at a time; a real corner **click** and a
   real 620px **drag** of the left page both advance the book; no negative-scale
   transform anywhere (`matrix(1, 0, 0, 1, 0, 0)`); clicking the left page at the
   last spread bounces back to the back-cover spread and the spacer ends
   `display: none` with a 0×0 rect (not visible); 0 uncaught exceptions. Probe
   scaffolding deleted afterwards.

5. **Left to do:** nothing. Untested by probe: touch swipe (the touch handler
   funnels through the same engine `start()`/direction code as the mouse path,
   which was tested).

6. **Traps:**
   - If a future agent reorders pages, the **reversed** shape must be preserved:
     front cover last, spacer first, and `flipNext`↔engine `flipPrev`. Breaking
     it silently un-mirrors the book (or breaks the covers).
   - `total` from `getPageCount()` is now 20 (19 content + spacer); the indicator
     intentionally reports ۱۷ (count of numbered pages), which is what the
     printed pills say. `getPageCount` is still on the `FlipBookHandle` type but
     nothing calls it.
   - Probing gotcha that cost time: the guided tour's overlay is `fixed inset-0
     z-[62]`, so on a fresh profile the tour is open and **every synthetic CDP
     pointer event is swallowed**. `el.click()` still works (JS dispatch), which
     is why button checks passed while the drag/click checks silently did
     nothing. Set `localStorage['arman-booklet-tour-v1'] = 1` and reload before
     testing gestures, and assert the dialog is gone.
   - The end-of-book bounce takes **two** full flips (~2s), so measure it after
     ~3s; at ~1.5s the spacer item still has a non-zero rect mid-animation.

### 2026-09-11 — Page-turn buttons: next on the left, prev on the right (DONE)

1. **Asked for:** commit the previous work, then fix the page-turn controls: this
   is a Persian booklet, so **next** belongs on the **left** and **previous** on
   the **right**.

2. **Plan / approach:** the previous entry's `rotate-180` wrappers were the actual
   bug — they pointed both arrows *away* from the direction the book turns (a left
   arrow on the right-hand back button, a right arrow on the left-hand forward
   button). The row inherits `dir="rtl"` from `<html>`, so the **first** button in
   the markup renders on the **right**; the existing order
   `[prev ❯][indicator][next ❮]` therefore already put prev right / next left, and
   the tour copy, the README and the pre-rotation glyphs all agree on that layout.
   Answer: delete the rotation, don't reorder anything, and write the rule down in
   a comment so it is not "fixed" again.

3. **Done:** `src/components/Booklet.tsx` — chevrons back to plain ❯ (prev, right)
   and ❮ (next, left), `title` attributes on both, plus a comment stating the RTL
   ordering rule. `README.md` §4 now documents which button sits on which side.

4. **Verified:** `tsc --noEmit`, `npm run lint` and `npm run build` clean.
   Headless Chrome (fresh page load per viewport) at 1920×1080, 1366×768 and
   390×844 — 30 checks, all pass: two buttons; `aria-label` «صفحه بعد» on the left
   (`cx 877`) and «صفحه قبل» on the right (`cx 1043`); glyphs ❮ left / ❯ right;
   19 pages rendered; clicking the left button moves **forward** («جلد کتاب» →
   «صفحه‌های ۱ و ۲ از ۱۷» landscape, «صفحه ۱ از ۱۷» portrait) and the right one
   **back**; 0 uncaught exceptions. Probe deleted afterwards.

5. **Left to do:** nothing.

6. **Traps:** do not re-add the `rotate-180` glyph flip — the chevrons already
   point the way the book turns. Also: `git status` was already clean when this
   task started (the previous entry's work is committed as `df0c349`), so
   "commit first" was a no-op.

### 2026-09-11 — chevrons, mobile page scaling, page-number agreement (DONE)

1. **Asked for:** (a) rotate the ❯/❮ page-turn chevrons 180° ("their sideways"),
   (b) some pages have more content than the page height in mobile view — "maybe the
   content should get smaller if the height wasn't enough", (c) the printed
   page-number pill (e.g. ۱۱) and the controls indicator («صفحه ۱۲ از ۱۹») disagree.

2. **Plan / approach:**
   - **Chevrons:** the glyphs were correct for LTR but read as pointing the wrong
     way here, so each is wrapped in `<span className="inline-block rotate-180">`.
     Kept the characters (not swapped) so the DOM still says which button is which.
   - **Mobile overflow — measured before designing.** Pages are laid out with fixed
     px sizes, and react-pageflip hands them a *box*, never a scale: a phone gets
     ~366×488 while the design is 550×733, so fixed-size content ran off the bottom
     (desktop 620×826 only ever hid this by giving extra room). New
     `PageCanvas.tsx` puts every page's artwork on a fixed 550×733 canvas and
     scales that canvas with `transform: scale(min(w/550, h/733))`, written from a
     `ResizeObserver` callback. Decisive measurement first: forcing every page into
     a 550×733 box showed **0px overflow on all 19 pages**, so scaling is safe and
     no page has to be shortened. Scaling *up* on desktop (1.127×) also means the
     typography finally scales with the page, which the "3D route removed" entry
     below lists as an open idea.
   - **Numbering — read the library, then the DOM.** In `showSpread()` StPageFlip
     does `setLeftPage(spread[0]) / setRightPage(spread[1])` and then
     `currentPageIndex = spread[0]`, while the pills print the page's array index.
     The old indicator was `index + 1`, so it named the *right* page of a landscape
     spread and was **one ahead of the printed pill in portrait** (the phone case
     the user saw). Fixed by printing the same numbers the pages print: the covers
     are named («جلد کتاب» / «پشت جلد») and a landscape spread names both visible
     pages («صفحه‌های ۱۱ و ۱۲ از ۱۷»). The spread size is measured from the drawn
     pages (`.stf__item` with a non-zero width) because the library exposes no
     orientation getter — `countVisiblePages()` in `Booklet.tsx`.

3. **Done:**
   - `src/components/PageCanvas.tsx` — new: exports `PAGE_WIDTH`/`PAGE_HEIGHT`, the
     measured wrapper + scaled canvas, transform written imperatively (no state, no
     unscaled flash: `ResizeObserver` fires before paint).
   - `src/components/pages/PageShell.tsx` — artwork moved onto `PageCanvas`; the
     solid page colour stays on the page root (so the paper fills the page) while
     the `paper-dots` texture moved inside the canvas so it scales with the content.
     Added `data-page-label` to the printed pill (the numbering contract).
   - `src/components/pages/cover.tsx`, `src/components/pages/closing.tsx`
     (`BackCoverPage`) — artwork wrapped in `PageCanvas`; gradient classes stay on
     the page root.
   - `src/components/Booklet.tsx` — chevrons rotated; `spreadSize` +
     `countVisiblePages()` + `measureSpread()` (rAF + resize listener); the
     indicator now renders `positionLabel`, derived with the page's own numbers.
   - `src/components/GuidedTour.tsx` — the «کجای کتابیم؟» step no longer quotes a
     stale example number; it explains that the pill shows where you are and that
     two pages show side by side on big screens.
   - `README.md` — `PageCanvas` in the file map, a "content scales with the page box"
     bullet, the new indicator wording, the transform trap corrected (scaling the
     *content* is fine, scaling the *book* is not), and a mobile clipping check.
   - `AGENTS.md` — this entry.
   - No content in `src/data/content.ts` changed.

4. **Verified:** `npx tsc --noEmit`, `npm run lint`, `npm run build` clean. CDP probe
   over all spreads at **1920x1080, 1366x768, 390x844** (Chrome, own port/profile,
   `next start`): 256 checks pass, no console errors/exceptions.
   - Canvas fills the page box exactly at every size (620x826 desktop, 477x636,
     366x488 phone) and **no page's content escapes the page box** in any spread —
     each page's max descendant right/bottom is within 0.5px of the page box.
   - Indicator == printed pills at every step: landscape «صفحه‌های ۱۱ و ۱۲ از ۱۷»
     while pills ۱۱ and ۱۲ are on screen; phone «صفحه ۱۱ از ۱۷» with pill ۱۱ (the
     reported bug); cover «جلد کتاب», last leaf «پشت جلد».
   - Mouse flipping survives the transform: a click on a page flips it, dragging a
     corner applies the fold `clip-path`, and a drag past the page width completes
     the flip.
   - The راهنما tour still opens with its card inside the viewport.
   - Before/after numbers for the overflow fix (same probe, forced 550x733 box): all
     19 pages `overflowY 0px`, i.e. the phone overflow was purely the missing scale.

5. **Left to do:** nothing required. Open ideas: cap the desktop scale (1.127x) if
   the bigger typography is not wanted, and add a page-fill step to the tour.

6. **Traps:**
   - **Never rebuild `.next` while `next start` is serving from it.** Doing that
     mid-verification produced a mixed tree: the server rendered the old markup
     while the new client chunks 404'd, so nothing hydrated (`.stf__item` count 0,
     indicator stuck at «صفحه ۱ از ۰»). Kill the server, build, start again — the
     code was fine, the probe was not.
   - The scaled canvas is a *child* element, which is why an inline `style` is safe
     there; page roots must still never carry inline styles (StPageFlip rewrites
     their `cssText`). Same reason the `paper-dots` class had to move off the root:
     the root keeps the solid colour, the canvas carries the artwork and texture.
   - `countVisiblePages()` reads the DOM, so it must be measured *after* the landing
     spread is drawn — hence the `requestAnimationFrame` (and the resize listener
     for orientation changes). Doing it synchronously inside `onFlip` reports the
     previous spread.
   - Page order is still `spread[0]` left / `spread[1]` right (the library is
     LTR-internal; see §7). The printed page numbers were left exactly as they were
     — the fix was in the indicator, not in the page order.
   - `data-page-label` on the printed pill is the numbering contract; the probe uses
     it to assert indicator/pill agreement. Keep it in sync if pages are renumbered.

### 2026-09-11 — guided tour (spotlight overlay) added (DONE)

1. **Asked for:** "why I don't see a guide" — the user did *not* want the README
   entry below; they clarified they want **something like Spotlight / Guided Tour:
   an overlay that highlights specific elements and shows instructional cards**.
   The README stays (it is still the developer guide), but the in-app tour is the
   thing that was actually requested.

2. **Plan / approach:**
   - New client component `GuidedTour.tsx` that dims the screen with one element
     whose huge `box-shadow` spread (`0 0 0 9999px rgba(60,42,32,.62)`) leaves a
     cut-out — cheaper and easier to animate than four dimming panels or an SVG
     mask, and it gives a real "spotlight ring" for free.
   - Steps are a plain `steps` array (emoji + title + body + optional `target`
     selector + placement) so the Persian copy is editable in one place. Targets
     are `data-tour="book" | "controls" | "indicator"` attributes on Booklet's
     chrome, i.e. the tour does **not** depend on component internals, and it only
     ever highlights chrome that exists on every page (page content changes as you
     flip, so spotlighting it would break on the next page).
   - The card position is derived from the measured target box: preferred side,
     then below, then above, and if the target is taller than the viewport (the
     book is) it floats near the bottom instead of trying to escape the spotlight.
   - Reset semantics: the tour is **mounted only while open**, so mounting is the
     restart — no "reset step" effect. First visit auto-opens it after 700 ms
     (the book needs a beat to lay itself out); a small «❓ راهنما» pill next to the
     hint line re-opens it, because a tour that can only ever be seen once is
     unreachable after the first dismissal. `localStorage['arman-booklet-tour-v1']`
     (written on close, wrapped in try/catch for private mode) stops the auto-open.
   - Keyboard: the arrow keys drive the tour in the **capture** phase with
     `stopPropagation`, otherwise Booklet's own window-level arrow handler would
     flip the book behind the overlay. Escape closes.
   - React 19 / Next 16 lint (`react-hooks/set-state-in-effect`) rejects setState
     called synchronously from an effect body, so all measurement goes through
     `ResizeObserver` / `requestAnimationFrame` / `setTimeout` **callbacks**.
     That is also the right mechanism anyway: the flip book resizes itself with
     `autoSize`, so a one-shot `getBoundingClientRect()` is not reliable.

3. **Done:**
   - `src/components/GuidedTour.tsx` — new: 5-step tour, spotlight + dim backdrop,
     instructional card (title, body, progress dots, «۱ از ۵» counter, قبلی/بعدی,
     «بزن بریم!» on the last step, ✕ close), `TOUR_STORAGE_KEY` export.
   - `src/components/Booklet.tsx` — `data-tour` on the book stage, the controls row
     and the page-indicator pill; `tourOpen` state + first-visit auto-start effect +
     `closeTour`; the hint line is now a row with the «❓ راهنما» button;
     `{tourOpen && <GuidedTour onClose={closeTour} />}`.
   - `src/app/globals.css` — `.book-stage` chrome budget **120px → 132px** (both the
     landscape and the portrait block). The hint row grew from ~17px to 29px once it
     gained the راهنما button, which pushed the book 4-5px past the viewport bottom on
     height-limited screens (see Verified). Note for the record: the `120px` in the
     2026-09-11 "3D route removed / booklet enlarged" entry below is **stale**, 132px
     is the current value.
   - `README.md` — file map + a "The guided tour (راهنما)" subsection under §4
     (how steps/targets/auto-start work, and the capture-phase keyboard trap),
     a tour bullet in the §8 check list, the booklet-only rule updated, and a
     Persian paragraph in the end-user section.
   - `AGENTS.md` — this entry; §7 "keep it a booklet only" now mentions the tour
     button as the one piece of chrome besides the page controls.

4. **Verified:** `npx tsc --noEmit`, `npm run lint` and `npm run build` clean.
   CDP probe (scratch script in the OS temp dir, Chrome on its own port/profile,
   see §8) walked all 5 steps at **1920x1080, 1366x768 and 390x844** against
   `next start`. For every step the spotlight box equals its `data-tour` target
   expanded by exactly 10px on all sides (`d(10,10) size(20,20)` against the
   matching target only), every card stayed fully inside the viewport
   (`cardFits: true`), the tour ended on «بزن بریم!» and closed with
   `localStorage['arman-booklet-tour-v1'] === "1"`, re-opening from the «❓ راهنما»
   button restarted at step 1, and pressing ArrowLeft **advanced the tour while the
   book's page indicator stayed at «صفحه ۱ از ۱۹»** (`bookDidNotFlip: true`) — the
   capture-phase trap works. Escape closes. Rerun after the CSS fix: all checks pass
   at 1920x1080, 1366x768 and 390x844.

   A second probe measured page fit before/after the chrome change. With the taller
   hint row and the old 120px budget, `documentElement.scrollHeight` exceeded the
   viewport by 4-5px at 1600x900, 1366x768, 1280x720 and 1024x640 (book bottom +
   hint bottom past the fold); 1920x1080 and 390x844 were unaffected. After bumping
   the budget to 132px: `worst overflow: 0` at every size, ~16px of slack on the
   height-limited ones, book 954x636 at 1366x768 (was 972x648), 1240x826 unchanged at
   1920x1080, 366x488 at 390x844 where the portrait width is what binds.

5. **Left to do:** nothing required. Open ideas: flip the book to the page a step
   is talking about (e.g. show the results page during a "what the colors mean"
   step), add a dedicated step for the 🟢/🟡/🟠 legend, or offer a "skip" that does
   not mark the tour as seen.

6. **Traps:**
   - **`data-tour` attributes are the contract.** Renaming/removing one silently
     degrades that step to a centered card (the code falls back, it does not throw)
     — so if a step stops highlighting, check the attribute first.
   - Do **not** move the tour's keydown listener from capture to bubble and do not
     drop `stopPropagation`: `Booklet.tsx` listens on `window` for the arrow keys,
     so the book would flip while the overlay is up.
   - Keep the tour mounted-only-when-open. Rendering it always-on with an `open`
     prop needs a reset effect, which trips `react-hooks/set-state-in-effect`
     (that is exactly the lint error this work started from).
   - The spotlight's `box-shadow` cut-out means the overlay must not gain a
     `transform`/`filter` ancestor (blur/scale creates a containing block and the
     fixed coordinates stop matching the target).
   - The tour card deliberately overlaps the bottom of the book on the
     "ورق زدن کتابچه" step: the book is taller than the space above/below it. That
     is the intended fallback, not a positioning bug.
   - When probing with node on this machine, `/tmp/...` inside a *script* is a
     literal `C:\tmp\...` (MSYS only rewrites paths in shell arguments). Use paths
     relative to the script's cwd, e.g. `writeFileSync("report.json", …)`.
   - **Adding anything to the chrome means remeasuring the `.book-stage` budget.**
     The 132px is real pixels, not a guess: padding 24 + two 12px flex gaps + 48px
     controls + 29px hint row. The previous agent's 120px note predates the hint row
     growing and would have clipped the book.
   - The tour's auto-open is one-shot per browser profile. A headless probe must
     clear `arman-booklet-tour-v1` (after the page has loaded — `about:blank` throws
     on `localStorage`) and reload, or only the first viewport gets the walkthrough.

### 2026-09-11 — first-time guide (README) written (DONE)

1. **Asked for:** "create a guide for a new user that wants to work with this
   website for the first time" and then commit the changes.

2. **Plan / approach:** the repo had a `README.md`, but it was still the
   untouched `create-next-app` boilerplate (Geist font, `app/page.tsx`, "Deploy on
   Vercel") — i.e. actively wrong about this project. Replaced it with a real
   onboarding guide rather than adding a second doc, so there is one obvious place
   for a newcomer to start. Audience decided as *developer*, with a short Persian
   end-user section at the end so the same file also serves whoever just reads the
   booklet. Everything in it is derived from the code (page list from
   `bookPages.tsx`, palettes from `PageShell.tsx`, the 120px chrome budget from
   `globals.css`) — no aspirational/planned features were documented as if they
   existed. `AGENTS.md` stays the deep reference; the README links to it.

3. **Done:**
   - `README.md` — rewritten: what the project is, requirements, run/build
     commands, an annotated file map, how the flip book works (550×733, `showCover`
     → cover on the right, order in `bookPages.tsx`, keyboard nav), how to edit the
     text in `src/data/content.ts` + how to add a page, the design system
     (`accentStyles`/`statusStyles`, decor SVGs, Tailwind v4 CSS-first), the
     gotchas that actually bite (inline-style wipe on page roots, `forwardRef`,
     `dir="rtl"`, no scrolling in pages, `.book-stage` budget, no `transform`
     scaling), a change-check list, deployment, and a فارسی "how to use the
     booklet" section.
   - `AGENTS.md` — this entry; the previous cover entry is no longer marked
     `CURRENT TASK`.
   - No source code changed in this task.

4. **Verified:** `npx tsc --noEmit`, `npm run build` and `npm run lint` clean at the
   commit. The README is prose, so the meaningful check was factual: every file
   path, command, prop, page count (19 = cover + 1..17 + back cover), palette name
   and CSS class it mentions was re-read from the source afterwards. Nothing in the
   repo was measured in a browser for this task (none of the code changed).

5. **Left to do:** nothing. Open ideas: a few screenshots in the README (there are
   none in the repo), and an npm `typecheck` script so the README does not have to
   tell people to run `npx tsc --noEmit`.

6. **Traps:**
   - `public/` still holds the `create-next-app` SVGs (`file.svg`, `globe.svg`,
     `next.svg`, `vercel.svg`, `window.svg`). None are referenced; they were left
     alone deliberately (deleting them is unrelated churn) — but do not copy the old
     README's claim that they are used.
   - The old README documented things this project does not have (Geist font via
     `next/font`, editing `app/page.tsx`). If you ever see that text come back, it is
     a bad revert, not a second opinion.
   - Keep the README honest about the 19-page layout; if you add or remove a page
     (see §5) update both `AGENTS.md` §5 and the README's page list.

### 2026-09-11 — covers were transparent → real cover design + decor color fix (DONE)

1. **Asked for:** "the covers are transparent but I don't like it that way — create a
   cute cover." The user had already looked at the site and saw translucent covers.

2. **Plan / approach:** first reproduce it instead of guessing, then fix the *cause*
   rather than paint over it. Two separate bugs showed up, both confirmed by
   measurement in the browser (see §4):
   - **The covers really were transparent.** react-pageflip's HTML renderer assigns
     `element.style.cssText = ...` on every page root (`drawHard`/`drawSoft`/`simpleDraw`),
     which **replaces the whole inline `style` attribute**. Both covers set their
     background with a React `style={{ background: ... }}` prop, so StPageFlip wiped
     it and the page rendered with `backgroundColor: rgba(0,0,0,0)` — you saw the
     body gradient through it. All the *other* pages were fine because `PageShell`
     paints itself with Tailwind classes, which survive. Fix: move the cover
     backgrounds into CSS classes (`.cover-front`, `.cover-back`, `.cover-dots`,
     `.cover-spine`) in `globals.css`. **Never set a page root's background (or any
     other style) inline.**
   - **Every decorative SVG was solid black.** `Star`, `Sparkle`, `Cloud`, `Heart`,
     `Flower`'s petals, `Sun` and `Ball`/`Block` had no `fill`, so SVG's default
     `fill: black` applied and the `text-*` Tailwind classes on them did nothing
     (measured `fill: rgb(0,0,0)`, `stroke: none`, despite `text-[#A99BE8]/60`).
     They now paint with `fill="currentColor"` (and `stroke="currentColor"` for the
     sun's rays), so the existing color classes work as intended. `Flower`'s centre
     stays yellow and the ball's seams are white.
   Then the front cover was redesigned as an actual cover: mint→cream gradient,
   white polka dots, a white sticker frame with a dashed inner line, spine shading +
   stitching on the bound (left) edge, the baby in a white circular badge, the title
   in dark green, "آرمان" big, an orange "کتابچه‌ی راهنمای والدین 💛" pill and a row of
   toy emojis (🐶⚽🧸). The back cover got the mirrored treatment (peach→pink→mint).

3. **Done:**
   - `src/app/globals.css` — added `.cover-front`, `.cover-back`, `.cover-dots`,
     `.cover-spine` (with a comment explaining the inline-style trap).
   - `src/components/pages/cover.tsx` — rewritten front cover, no inline style.
   - `src/components/pages/closing.tsx` — `BackCoverPage` rewritten the same way.
   - `src/components/decor.tsx` — `fill="currentColor"` / `stroke="currentColor"`
     added; header comment now explains the convention.

4. **Verified:** `npx tsc --noEmit`, `npm run build` and `npm run lint` all clean.
   Live DOM probe against the dev server in headless Chrome (CDP, see §8) — front
   cover computed background is now the `cover-front` gradient (was `none` +
   `rgba(0,0,0,0)`), the back cover likewise; a star's computed `fill` is a real
   color instead of `rgb(0,0,0)`; cover content column occupies y 125→560 inside the
   685px page (no overflow, `scrollHeight == clientHeight`), back cover content
   195→490; flipping still works (indicator goes ۱ → ۲ → ۴ of ۱۹ and both visible
   leaves keep their cream background), back cover reached and measured 514×685
   with its gradient intact.

5. **Left to do:** nothing required. Open ideas: give `PageShell` its own subtle
   cover-edge styling so paper pages and covers differ a bit more; the page-indicator
   reads one behind the back cover (spread index, pre-existing).

6. **Traps:**
   - **A page root's inline `style` is not yours.** StPageFlip overwrites `cssText`,
     so backgrounds/transforms/sizes set inline on a page root silently vanish. Use
     classes. Child elements are unaffected — that is why the page-number pill and
     the reminder card's inline styles are fine.
   - Decor SVGs need an explicit `fill`/`stroke`; `text-*` only works because of
     `currentColor`. If you add a new outline-style decoration, add
     `stroke="currentColor"` or it will be invisible.
   - The probe helper (`cdp.mjs`) lived at `../.arman-probe/` (outside the repo) and
     was deleted after use; recreate it from the §8 recipe rather than assuming it
     exists. Node 24 has global `fetch`/`WebSocket`, so a ~40-line script is enough;
     close the probe browser with CDP `Browser.close`, not `taskkill`.

### 2026-09-11 — 3D route removed, booklet enlarged (DONE)

1. **Asked for:** (a) remove the 3D part of the project completely,
   (b) make the booklet bigger in the main (2D) website.

2. **Plan / approach:** delete the `/3d` route, the `components/three/` scene code
   and the scratch probe tooling outright, and drop the three.js packages so no
   half-finished 3D code can rot in the repo. For the size, keep react-pageflip's
   `stretch` mode and make the *page box* bigger instead of scaling the book with
   a CSS transform (a transform would break corner-drag flipping, see traps).
   The width is derived from the viewport height because the landscape spread's
   height is width-driven (`spreadHeight = spreadWidth / 1.5`).

3. **Done:**
   - Deleted `src/app/3d/`, `src/components/three/` and `src/.probe/`; removed the
     `.book3d-overlay` rule from `globals.css`; fixed the stale "2D and 3D book"
     comment in `bookPages.tsx`.
   - `npm uninstall @react-three/drei @react-three/fiber three` (55 packages out).
     The app is back to `next`, `react`, `react-dom`, `react-pageflip` only.
   - Booklet is bigger: the wrapper `max-w-[820px]` was replaced by a `.book-stage`
     class in `globals.css` that derives the width from the viewport height
     (`min(1240px, (100dvh - 120px) * 1.5)`), with a `max-width: 640px` media
     query that uses the portrait ratio `(100dvh - 120px) * 0.75` so single-page
     mobile never runs off the bottom. Vertical chrome was tightened
     (`py-8`→`py-3`, `gap-6`→`gap-3`) and the arrow buttons went `h-11`→`h-12`.
     The `1.5` factor: the landscape spread is two 550×733 pages, so
     `spreadHeight = spreadWidth / 1.5`; the `0.75` factor is `550/733` for the
     portrait single page. 120px is the measured fixed chrome (page padding 24 +
     two flex gaps 24 + controls 48 + hint ~17 = 113, +7 slack).

4. **Verified:** `npm run build` and `npm run lint` are clean; `/` and
   `/_not-found` are the only routes (`/3d` returns 404). Measured in headless
   Chrome (fresh page load each time) the book is **1240×826** at 1920×1080,
   1170×780 at 1600×900, 972×648 at 1366×768 and 366×488 at 390×844 — all fit the
   viewport with no page scroll (previously 820×546 everywhere). Flipped through
   the densest pages: every page's content height stays inside the page box
   (e.g. 802 ≤ 826).

5. **Left to do:** nothing required. Open ideas: scale the page *content* with
   the page size (see traps), and re-check narrow/short viewports.

6. **Traps:**
   - The page text is fixed `px` (Tailwind), so a bigger page does *not* scale the
     typography — it just adds breathing room. CSS `transform: scale()` on the
     book is **not** an option: StPageFlip's `getMousePos()` uses raw client
     coordinates, so a scaled element breaks corner-drag flipping. Enlarge the
     real page size instead.
   - `.book-stage` must stay on the *outer* wrapper: `autoSize` writes an inline
     `max-width: 2*maxWidth` on `.stf__parent`, which would win over a class rule.
   - The viewport-height budget has to match the actual chrome (113px today). If
     you add a row (another hint line, a bigger control bar), bump the `120px` in
     `globals.css` to match or the bottom of the book gets clipped by
     `overflow-hidden`.
   - react-pageflip's `stretch` uses the *block width* to pick portrait vs
     landscape (below `2 * minWidth` = 600px it shows one page), so a width cap
     based only on the landscape ratio overflows the viewport on narrow screens.

### 2026-09-11 — 3D version of the booklet at `/3d` (ABANDONED / REMOVED)

**Asked for:** a 3D version of the same booklet, served at `/3d`, using
react-three-fiber / three.js (the user left the choice open).

**Plan:** keep the 2D booklet exactly as it is; add a second route that renders
the *same* `pages/` components inside a 3D scene. Approach chosen: build the
book out of real 3D paper/card meshes in a perspective scene and project the
existing Persian page components onto the page faces with
`<Html transform>` from `@react-three/drei`. This reuses the exact typography,
RTL layout and content (no second copy of the layout code, no font/SVG-shaping
problems that rendering Persian text with three's `Text` would cause). Leaves
flip around the spine on the page's own axis with a spring animation; only the
3-4 pages that are actually visible get mounted so the DOM stays small.

**Verified so far:**
- `@react-three/fiber`, `@react-three/drei` and `three` are already in
  `package.json`.
- drei's `<Html transform>` is the right tool, but it has two traps in *this*
  project, both confirmed by measurement (see §8 tooling):
  1. **The camera must have no rotation.** drei builds its CSS chain as
     `perspective → camera matrix → translate(½canvasW, ½canvasH)`, so a rotated
     camera rotates that canvas-centre offset and every page lands far off
     screen. Keep the camera on the +z axis (unrotated) and tilt/rotate the
     *book group* instead of orbiting the camera.
  2. **The document is RTL**, so drei's absolutely-positioned overlay wrapper
     (it has no `left/top`) resolves its static position from the right edge and
     every page is shifted sideways by `containerWidth - pageWidth`. Fix: give
     the overlay `direction: ltr` via `<Html wrapperClass="book3d-overlay">`
     (`.book3d-overlay { direction: ltr }` in `globals.css`). Page content keeps
     its own `dir="rtl"`.
- With those, `distanceFactor = 400 * (worldPageWidth / pageWidthInPx)` maps a
  550×733px page onto exactly the same world footprint as a 3×4 mesh — measured
  centre `(632, 354.5)` vs the canvas centre, and 139.14 px/world-unit for both
  the mesh and the overlay.

**Still to do:** the real book (columns: covers, paper stack, spring flip
animation, RTL reading order), the drag-to-orbit-rotate-the-stage controls,
prev/next + keyboard + page indicator, `/3d` route wiring, build + screenshots.

**Status:** the user asked for this to be removed before it was finished. The
files this entry refers to (`src/app/3d/`, `src/components/three/`,
`src/.probe/`, the `three` packages and `.book3d-overlay`) **no longer exist** —
the notes above are kept only so the findings are not re-derived if a 3D view is
ever asked for again.
