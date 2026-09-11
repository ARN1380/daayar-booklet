# AGENTS.md — Arman's Growth Booklet (کارنامه غربالگری رشد آرمان)

This file tells AI agents (and humans) what this project is, how it is set up,
and what still needs to be done. Read it before modifying the codebase.

---

## 1. What this project is

A **single-page Next.js website that renders a cute, interactive booklet**
(flip book) for parents. It presents the results of a **developmental screening
report for a 10-month-old baby named Arman** (آرمان دلیری). The booklet is
written in **Persian (Farsi)**, so the whole UI is **right-to-left (RTL)**.

The website is **only the booklet** — no navbar, no footer, no extra sections,
no marketing content. Just the book, its page-turn interaction, and controls to
flip pages.

The content comes from a plain-text file the user supplied (see §3). An AI
agent parsed that text and laid it out page by page.

### Core requirements (from the user)
- Cute, friendly, child/parent-friendly design with cute illustrations.
- Users must be able to **turn pages** (page-flip animation, works on desktop and mobile).
- The entire website is the booklet and nothing else.
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
✅ `react-pageflip` installed; flip book works (verified via headless Chrome: all 19 pages render, flip book initializes, no console errors).
✅ Content parsed into `src/data/content.ts`.
✅ Cute SVG decorations in `src/components/decor.tsx`.
✅ Page components in `src/components/pages/` + shared `PageShell.tsx`.
✅ Booklet wired up in `src/components/Booklet.tsx` with prev/next controls, page indicator (Persian digits) and keyboard navigation (ArrowLeft/ArrowRight).
✅ RTL Persian layout with Vazirmatn font in `src/app/layout.tsx`; homepage renders only the booklet.

Everything below describes how the code is organized. If you change content, edit `src/data/content.ts` (and page numbering in `src/components/Booklet.tsx` if pages are added/removed).

### Useful commands
```bash
npm run dev        # dev server (usually http://localhost:3001 if 3000 is busy)
npm run build      # production build (verifies types)
npm run lint       # eslint
```

---

## 3. Source content

The original text lives at (Windows path, outside the repo):

```
C:\Users\ARN\Desktop\Any\sare\karname arman.txt
```

It is a Persian developmental-screening report card. It is **not copied into the
repo** — parse it once, and hard-code the parsed result into a data file (e.g.
`src/data/content.ts`). Do **not** read the file at runtime.

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

2. **`src/data/content.ts`** — hard-code the parsed content as typed data
   (child info, statuses, results table, domain skill descriptions, games per domain, reminder, next-step text). Keep the exact Persian wording from the source file, including emojis.

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
   - `showCover={true}` makes the first/last pages hard covers and shows the **cover on the right** — correct for a Persian book.
   - Use a `ref` (`flipBook.getPageFlip()`) for prev/next buttons: `flipNext()` / `flipPrev()`.
   - Track current page via `onFlip` for page indicators/controls.
   - Every page wrapper must have `dir="rtl"` and `lang="fa"`.

7. **`src/app/page.tsx`** — replace boilerplate: render `<Booklet />` full-screen, centered, nothing else.

8. **`src/app/layout.tsx`** — `lang="fa" dir="rtl"`, Vazirmatn font, background styling.

9. **`src/app/globals.css`** — Tailwind v4 `@theme` tokens for the pastel palette + Vazirmatn font family + any custom page-flip CSS. Delete all Next.js boilerplate CSS.

10. **Verify:** `npm run build`, then `npm run dev` and click through every page (desktop + narrow/mobile view). Check page-turn animation, cover on the right, RTL text, and that no content overflows a page.

---

## 7. Gotchas & conventions

- **npm 12 blocks install scripts.** It may warn: `install-scripts ... blocked because they are not covered by allowScripts`. This is expected and non-fatal; do not fight it. If a package genuinely needs its postinstall, run `npm install-scripts approve <pkg>` or add `"allowScripts"` to `package.json`/`.npmrc`.
- **Slow network on this machine:** npm fetches can stall for minutes (default fetch-timeout 300 s). Pass `--fetch-timeout=60000 --fetch-retries=1` when installing.
- **react-pageflip RTL notes:** the library is LTR-internally, which is fine — set `dir="rtl"` on page content. In two-page (landscape) mode spreads show adjacent pages; in portrait/narrow mode pages show one at a time in reading order (good for mobile). The cover shows on the right with `showCover`, matching Persian books. Do **not** reorder the children array to force RTL — it breaks portrait mode.
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

### 2026-09-11 — CURRENT TASK: guided tour (spotlight overlay) added (DONE)

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
