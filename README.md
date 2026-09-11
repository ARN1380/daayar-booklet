# 🌱 کارنامه غربالگری رشد آرمان

An interactive **Persian flip book** (کتابچه) for parents: the developmental
screening report of a 10-month-old baby, Arman. The whole website *is* the
booklet — there is no navbar, no footer and no marketing page, just a page-turn
animation with prev/next controls.

If you are opening this repo for the first time, read this file top to bottom
before changing anything. `AGENTS.md` is the deeper companion document: tech
decisions, the design brief and a task log of every previous change.

---

## 1. Requirements

| Tool | Version used here | Notes |
|---|---|---|
| Node.js | 20+ (24 is fine) | Anything Next.js 16 supports. |
| npm | 12 | Node ships it. Only `npm` lockfile/scripts are used — no yarn/pnpm/bun. |
| Browser | Chrome/Edge/Safari/Firefox | Page flipping is drag- and touch-based, so test on a real (or emulated) touch device too. |

No database, no API keys, no environment variables. Nothing to configure.

## 2. Run it

```bash
npm install     # once
npm run dev     # http://localhost:3000 (Next prints 3001 if 3000 is taken)
```

Then open the printed URL in a browser.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload. |
| `npm run build` | Production build. **Run this before committing** — it is the type check. |
| `npm run start` | Serves the production build (after `npm run build`). |
| `npm run lint` | ESLint (`eslint-config-next`). Keep it clean. |
| `npx tsc --noEmit` | TypeScript-only check; faster feedback than a full build. |

## 3. Where everything lives

```
src/
├── app/
│   ├── layout.tsx        lang="fa" dir="rtl", Vazirmatn font, page <title>
│   ├── page.tsx          renders <Booklet /> and nothing else
│   └── globals.css       Tailwind v4 theme, paper/cover styles, .book-stage sizing
├── components/
│   ├── Booklet.tsx       "use client" — HTMLFlipBook + controls + keyboard nav
│   ├── bookPages.tsx     THE page order (index 0 = front cover, 18 = back cover)
│   ├── GuidedTour.tsx    the راهنما spotlight tour (overlay + instructional cards)
│   ├── PageCanvas.tsx    fixed 550×733 page canvas, scaled to the real page box
│   ├── decor.tsx         cute inline SVG shapes (BabyFace, Star, Heart, …)
│   └── pages/
│       ├── PageShell.tsx shared paper page + accent/status palettes
│       ├── cover.tsx     front cover (hard)
│       ├── info.tsx      child info, status legend, results table, intro
│       ├── skills.tsx    reusable: one page per skill domain
│       ├── games.tsx     reusable: one page of suggested games
│       └── closing.tsx   reminder, next step, back cover (hard)
├── data/content.ts       all the Persian text, as typed data
└── lib/fa.ts             toFaDigits() — Western → Persian numerals (۱۲۳)
```

**The booklet has 19 pages:** the front cover, numbered pages ۱–۱۷, and the
back cover. Page numbers in the UI come from the `pageNumber` prop, not from the
array index.

## 4. How the flip book works

`Booklet.tsx` renders `react-pageflip` (`HTMLFlipBook`), a wrapper around
StPageFlip:

- Pages are sized **550×733** (a fixed ratio) and `size="stretch"` + `autoSize`
  scale them to the viewport. Two pages show side by side on wide screens; below
  ~600px of width the library switches to one page at a time (good for phones).
- **The page content scales with the page box.** `PageCanvas` lays every page out
  on a fixed 550×733 canvas and scales that canvas to whatever box the library
  gives the page (a phone gets ~366×488, a desktop spread ~620×826), so the page
  proportions are identical at every size: slightly larger typography on desktop,
  smaller on a phone — instead of fixed-size text overflowing a small page. All
  19 pages were measured to fit the 550×733 base with 0px overflow.
- The page-number button shows the **same numbers that are printed on the pages**,
  and in a landscape spread it names both visible pages, e.g.
  «صفحههای ۱۱ و ۱۲ از ۱۷»; on a phone it reads «صفحه ۱۱ از ۱۷». The covers are
  named instead («جلد کتاب» / «پشت جلد») because they carry no number. The
  printed pill and this indicator both read the same `meta` descriptors from
  `bookPages.tsx`, so they can never disagree — see `Booklet.tsx`.
- **The book is mirrored into a Persian book, and that is done by page order,
  not by CSS.** StPageFlip is an LTR engine: it paints `spread[0]` on the left,
  puts index 0 alone on the *right* and turns pages right-to-left. `bookPages.tsx`
  therefore hands it the pages **reversed**, so the front cover is the *last*
  index (alone on the **left**), a spread shows the lower number on the **right**
  (the page a Persian reader takes first) and `flipPrev` is "forward", turning the
  left page over to the right. A spacer page at index 0 keeps the count even,
  which is what makes the engine treat that last page as a closed cover; it is
  never shown (see the guard in `Booklet.tsx`). The layout is therefore:

  ```
  index    0        1            2    3    …    18     19
  page     spacer   back cover   p17  p16  …    p1     front cover
  ```

- Page order is defined **once**, in `bookPages.tsx` (the array plus the `meta`
  descriptors). Adding or moving a page means editing that file — and keeping
  the "reverse + spacer" shape, or the mirror breaks.
- The controls (❯ / ❮ buttons, «صفحه ۳ از ۱۷» pill, hint line) are the only
  chrome on the site. Arrow-Left = next page, Arrow-Right = previous page,
  matching RTL reading direction.
- **Which button sits on which side is deliberate.** The row inherits `dir="rtl"`,
  so the *first* button in the markup renders on the **right**. Forward in a
  Persian book is to the left, so the order is `[prev ❯][indicator][next ❮]` and
  the controls land **prev on the right, next on the left**.
  ❯ on the right and ❮ on the left are already correct — do **not** "fix" them
  with `rotate-180`, which points both arrows backwards (that mistake shipped
  once; see the AGENTS.md log).
- Exact page design (which page shows what) is documented in `AGENTS.md` §5.

### The guided tour (راهنما)

A first-time visitor gets a **spotlight tour**: the screen dims, a cut-out
highlights one element at a time, and a small card explains it in Persian.

- The whole tour lives in `src/components/GuidedTour.tsx`. The script is the
  `steps` array at the top — emoji, title (bold, green), body, an optional
  `target` CSS selector and a preferred `placement` (`top` / `bottom` / `center`).
  Steps without a `target` get a centered card over a plain dimmed backdrop.
- Targets match the `data-tour="…"` attributes that `Booklet.tsx` puts on the
  book, the controls row and the page-indicator pill (`book`, `controls`,
  `indicator`). Add `data-tour="x"` to an element in `Booklet.tsx` and
  `target: '[data-tour="x"]'` to a step to spotlight it.
- The spotlight is one element with a huge `box-shadow` spread (a cut-out, not
  four dimming panels), so it also animates smoothly between steps. The card is
  positioned from the measured target box: `computeLayout()` prefers the
  requested side and falls back to “float near the bottom” when the target is
  taller than the viewport (the book is).
- The tour is **mounted only while it is open** — `{tourOpen && <GuidedTour …/>}`
  — so mounting restarts it at step 1. Auto-start happens once, 700 ms after
  load, unless `localStorage['arman-booklet-tour-v1']` is set. The «❓ راهنما»
  pill next to the hint line re-opens it any time, and closing it sets that flag.
- While the tour is open it swallows clicks and traps the arrow keys in the
  **capture phase** (`stopPropagation`), so paging the book with ← / → is
  disabled until the tour closes. Escape also closes it.
- Positioning uses `fixed` coordinates measured with `ResizeObserver` +
  `requestAnimationFrame` + viewport listeners, because the flip book resizes
  itself with `autoSize`. If you add a step, target something that exists on
  every page (chrome), not page content.

## 5. Editing the text (most common task)

All wording lives in **`src/data/content.ts`** as typed objects:

| Export | Used by |
|---|---|
| `childInfo` | صفحه‌ی مشخصات کودک |
| `statuses` | the three 🟢/🟡/🟠 status explanations |
| `results` | the five-row screening results table |
| `domainSkills` | the five «در ۱۰ ماهگی» skill pages |
| `domainGames` | the six game pages |
| `reminder`, `nextStep` | the two closing pages |

Rules for content edits:

1. **Keep the Persian wording verbatim** if it came from the report — including
   emojis and Persian digits (۰۹/۰۸/۱۴۰۴). Do not "fix" spacing or `ـ`.
2. Write digits in Persian; use `toFaDigits()` when a number is computed.
3. If you change text that is *long*, re-check the page in the browser — pages
   are fixed-height and content that overflows gets clipped, not scrolled.
   Shorten the text or split it onto another page instead.
4. Only `src/data/content.ts` holds content. Do not hard-code strings inside
   page components (page titles that are one-off decorations are the exception).

### Adding/removing a page

1. Add the data to `content.ts` if it is new content.
2. Add or edit the entry in `bookPages.tsx` (this is the single source of order).
3. Update the `pageNumber` props so the page numbers stay consecutive, and bump
   the "N of M" total if you added one (the total is read from the library, so it
   updates itself).
4. Update `AGENTS.md` §5 (the page table) — it is the map other contributors use.

## 6. Design system

- **Tailwind CSS v4, CSS-first.** There is no `tailwind.config.js`. Theme tokens
  and custom classes live in `src/app/globals.css` (`@theme`, `.paper-dots`,
  `.cover-front`, `.book-stage`, …).
- **Palettes** live in `src/components/pages/PageShell.tsx`:
  - `accentStyles` — one pastel accent per skill domain (blue, mint, pink,
    lavender, peach) with `soft` / `strong` / `deep` shades. Pass an accent to
    `<PageShell accent={…}>` and a page recolors itself.
  - `statusStyles` — the meaningful 🟢/🟡/🟠 result colors. Do not change these
    to arbitrary pastels; they carry meaning.
- **Illustrations** are inline SVG in `src/components/decor.tsx` — no image
  files, no downloads, no icon library. They paint with `currentColor`, so size
  them with `h-*`/`w-*` and color them with a Tailwind `text-[#…]` class.
- **Every page** goes through `PageShell` (dashed inner frame, corner doodles,
  numbered pill) and puts its artwork on `PageCanvas`. Covers are the exception:
  they build their own full-bleed background (but still use `PageCanvas` for
  their artwork).
- **Text sizes** are small on purpose (11–17px) because the design canvas is
  550×733 (see `PageCanvas`, which scales that canvas to the real page box). Keep
  new text inside that scale; a page is meant to be readable at a glance, not
  dense.

## 7. Rules that will bite you

- **Never style a page root with React's `style={{…}}` prop.** StPageFlip does
  `element.style.cssText = …` on every page element and *wipes the whole inline
  style attribute*, so an inline background silently renders transparent. That
  is exactly why `.cover-front` / `.cover-back` exist in `globals.css`. Use a
  class on the page root; inline styles on **children** are fine.
- **Every page component must `forwardRef`** and attach the ref to its root
  element — react-pageflip measures the DOM node. Covers additionally set
  `data-density="hard"`.
- **Each page root needs `dir="rtl" lang="fa"`** (or goes through `PageShell`,
  which already does it). The library itself is LTR internally; the right-to-left
  *book* comes from the reversed page order described in §4 — do not try to
  mirror it with a CSS `transform`, because StPageFlip reads raw client
  coordinates and a mirrored element makes corner dragging grab the wrong page.
- **Keep the engine's flips and the controls mapped.** Because the pages are in
  reverse, `flipNext` must call the engine's `flipPrev` (and vice versa) — see the
  two wrappers in `Booklet.tsx`. Any new control (gesture, key, button) has to go
  through those wrappers, and anything that can land on index 0 (`SPACER_INDEX`)
  must be blocked or bounced back.
- **No scrolling inside a page.** `PageShell` is `overflow-hidden`. If something
  does not fit, cut text or move it to another page.
- **Keep the site a booklet only.** No headers, navbars, footers or extra
  sections — the page controls plus the small «❓ راهنما» tour button are the
  entire UI.
- **`.book-stage` sizing:** the wrapper width is derived from the viewport height
  (`max-width: min(1240px, (100dvh - 132px) * 1.5)`). The `132px` is the measured
  vertical chrome around the book (page padding 24 + flex gaps 24 + controls row
  48 + hint line 29 + slack). If you add another row of controls or a hint line,
  bump that number or the bottom of the book gets pushed off the viewport. Do not scale the
  flip book itself (`.book-stage`, `.stf__parent`) with a CSS `transform` —
  StPageFlip reads raw mouse coordinates and corner-drag flipping breaks. Scaling
  the content *inside* a page (what `PageCanvas` does) is fine: the library only
  measures the page root, which keeps its real size. Verified by clicking and
  dragging pages after the change.
- Write code comments in **English**; all UI text stays in **Persian**.

## 8. Checking your change

```bash
npx tsc --noEmit && npm run build && npm run lint
```

Then walk the book in the browser (cover → back cover) and confirm:

- the cover is fully opaque and starts on the **right**;
- the page indicator in the controls matches the page you are on;
- the two densest pages (the games pages, pages ۱۳–۱۵) do not clip or scroll;
- the arrows and the Left/Right keys both page backwards *and* forwards;
- a narrow window (≈390px wide) shows one page at a time without a stray
  horizontal scrollbar, and **no page content is clipped** (the scaled page fills
  the page box; check a few of the games pages, ۱۳–۱۵);
- the **راهنما tour** highlights the right element on every step and its card
  stays fully inside the viewport (check it at ~390px wide too). The tour only
  auto-opens on a fresh profile — clear `arman-booklet-tour-v1` from
  localStorage, or use the app's own «راهنما» button, to see it again.

## 9. Deploying

The app is a static-friendly Next.js project with no server state or env vars,
so any Next.js host works. On Vercel: import the repo, accept the detected
settings (`npm run build`), deploy — nothing to configure. `next build` also
works behind any Node host with `npm run build && npm run start`.

---

## راهنمای استفاده از کتابچه 🌸

این کتابچه برای والدین آرمان ساخته شده و کاملاً فارسی و راست‌به‌چپ است.

- **ورق زدن:** گوشه‌ی صفحه را با انگشت یا ماوس بگیرید و بکشید، روی دکمه‌های
  ❯ و ❮ بزنید، یا از کلیدهای جهت‌دار استفاده کنید (کلید چپ = صفحه‌ی بعد،
  کلید راست = صفحه‌ی قبل).
- **ترتیب صفحه‌ها:** جلد، مشخصات کودک، توضیح وضعیت‌ها، جدول نتیجه‌ی غربالگری،
  مهارت‌ها و بازی‌های پیشنهادی برای پنج حیطه‌ی رشدی، یادآوری مهم و قدم بعدی.
- **رنگ‌ها:** 🟢 متناسب با سن، 🟡 محدوده‌ی پایش، 🟠 نیاز به ارزیابی بیشتر.
  این رنگ‌ها معنی‌دار هستند، پس تغییری در آن‌ها ندهید.
- روی موبایل، صفحه‌ها یکی‌یکی و به همان ترتیب نمایش داده می‌شوند.
- **راهنمای تصویری:** برای بار اول، یک راهنمای کوتاه خودش باز می‌شود و بخش‌های
  مختلف کتابچه را با نور و توضیح نشون می‌ده. هر وقت خواستید دوباره ببینیدش،
  روی دکمه‌ی «❓ راهنما» پایین صفحه بزنید.
