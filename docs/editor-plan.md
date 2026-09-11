# Plan: in-browser booklet editor (Option 3)

Status: **planned — not implemented yet.** The booklet is editable today via the
plain-text `booklet.txt` (Option 1, done). This document is the design for a
friendlier "edit in the browser" mode so a non-programmer never needs to touch
a text file at all.

## 1. Goal

A parent opens the site, clicks an «ویرایش کتابچه» button, gets a form for every
text field (child info, statuses, results, skills, games, reminder, next step),
edits everything in Persian inside the browser, and exports a finished
`booklet.txt` they drop into the repo. The rest of the pipeline is unchanged:
the existing `scripts/build-booklet.mjs` stays the sole compiler, so the editor
only needs to *write the same plain-text format booklet.txt uses*.

## 2. The fundamental constraint (read this first)

The deployed site is **static** (Next.js pre-renders on Vercel). A browser
editor cannot save the text back to the GitHub repo or to Vercel's disk. So the
editor is an **authoring tool, not a CMS**: it produces a `booklet.txt` that the
user (or anyone) drops into the repo; the next `git push` deploys the new text.
That is fine for this project's real usage (a specialist fills in a report once,
then it is built). Anything that claims to "save forever without touching a
file" would need a backend/cron, which is out of scope and not what the static
host supports.

## 3. Implementation sketch

### 3.1 Editor route — `/edit` (client component)

Add `src/app/edit/page.tsx` (a `"use client"` page). It must NOT render the
flip book; it is a plain RTL form. It is reachable via a small «ویرایش» link,
e.g. on the cover page or next to the راهنما button; on the deployed site it can
stay (harmless) or be hidden behind a query flag.

### 3.2 Data model = the same format as booklet.txt

To keep ONE source of truth, the editor reads/writes **the booklet.txt grammar**
(not a parallel JSON). Reuse the exact string headings (`## مشخصات کودک`,
`### 🟢 متناسب با سن`, `#### بازی…`, `- ` bullets) so what the browser exports
is byte-compatible with what the builder already parses.

Two ways to wire it:
- **Embed the format parser in the app** (a TS port of `build-booklet.mjs`
  — keep the Node script the canonical reference and the app copy in sync, or
  share the parsing module if the app is ever split).
- **Lighter:** the editor never parses; it just *builds* the text pieces itself
  (fields already have fixed order), plus a small validator mirroring the rules
  (5 domains, game counts 3/3/3/4/3, bullets 1–6, steps 1–5). Recommended —
  less code, same result, no dual parser debt.

### 3.3 Where the initial values come from

Fetch the current text. Options:
- Import the generated data (`src/data/content`) directly — the editor page is
  a normal component, so `content.ts` (already in the bundle) is the initial
  state. **Chosen** — no extra request, values are what the deployed book shows.
- (Alternative if we ever need the raw txt: host `booklet.txt` in `public/`
  and `fetch()` it. Not needed.)

### 3.4 The form

Mirror the booklet sections as collapsible groups:
1. مشخصات کودک — 5 single-line inputs (name, birth date, screening date, age,
   next screening).
2. وضعیت مهارتها — 3 textareas (descriptions). Titles/emojis read-only (they
   drive the fixed layout).
3. نتیجه غربالگری — 5 selects (one per domain row: 🟢/🟡/🟠).
4. مهارتها در ۱۰ ماهگی — intro textarea + per domain: intro textarea + bullet
   list editor (add/remove up to 6).
5. بازیها — per domain (fixed counts 3,3,3,4,3): each game = emoji+title+steps
   list editor (1–5 steps).
6. یادآوری / قدم بعدی — title + paragraph list editors.

Live preview (optional but very nice): a small panel that renders the current
form state through the *existing page components* (`ChildInfoPage`,
`StatusLegendPage`, …) inside a 550×733 box, so the user sees overflow/typos
before exporting. Highlighting the «آرمان»-style dynamic spots is a plus
(they are already data-driven, so the preview is accurate).

### 3.5 Export

A «دانلود booklet.txt» button produces the file as a Blob download
(`encodeURIComponent` safe; the txt is UTF-8). The user saves it over the repo's
`booklet.txt`, then runs `npm run content && npm run build` (or just `git push`
— Vercel's `prebuild` already regenerates). Optionally also a «Show the text»
popup with select-all for copy-paste, for users who edit files in GitHub's web
view. No save-to-server.

### 3.6 Validation before export

Run the same rules `build-booklet.mjs` enforces, in the browser, and block
export with a clear Persian message otherwise:
- exactly 5 domains, aligned emojis across the three sections;
- 3 statuses (🟢🟡🟠), each result row one of the three labels;
- game counts 3,3,3,4,3 and steps/bullets within limits (otherwise page
  overflow, which we deliberately avoid).

## 4. Deliverables when it is picked up

- `src/app/edit/page.tsx` + `src/components/editor/*` (form, field editors,
  preview, exporter, validator — ~400–600 lines total).
- A `«ویرایش کتابچه»` link on the cover (data-tour-compatible, not breaking the
  booklet-only design: a pencil icon in the corner).
- `scripts/build-booklet.mjs` gains a `--from-json`? **No** — keep it feeding
  from `booklet.txt` only, so there is exactly one input format.
- README section «ویرایش در مرورگر» + AGENTS.md entry.
- Optional: E2E check that the exported file round-trips through
  `npm run content` with `PARITY OK` (reuse the parity pattern from the
  Option-1 entry).

## 5. Traps / decisions already made

- Static site ⇒ no server-side save; the editor downloads a file. Do not promise
  persistence without a backend.
- Keep the exported format **exactly** `booklet.txt`'s grammar so the builder
  stays untouched and the validator in the browser has to be kept in sync with
  it manually (only ~6 rules — acceptable).
- The preview must reuse `pages/*` components (already `forwardRef` + PageCanvas
  sized, they render fine outside the flip book) and must set `dir="rtl"`.
- Do not let the editor grow into a second content format (no `content.json`).
  One text file, one builder, nothing else to drift.
- The editor page should not ship in the user's future screenshots' tour; keep
  it off the `data-tour` paths.