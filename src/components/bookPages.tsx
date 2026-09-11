import { forwardRef, type ReactNode } from "react";
import CoverPage from "./pages/cover";
import { ChildInfoPage, ResultsPage, StatusLegendPage, TenMonthsIntroPage } from "./pages/info";
import SkillPage from "./pages/skills";
import GamePage from "./pages/games";
import { BackCoverPage, NextStepPage, ReminderPage } from "./pages/closing";
import PageShell from "./pages/PageShell";
import { domainGames, domainSkills, gamesIntro } from "@/data/content";

/** What a page is, in booklet terms. The engine itself only knows indices. */
export type BookPageKind = "spacer" | "back-cover" | "numbered" | "front-cover";

export interface BookPageMeta {
  kind: BookPageKind;
  /** Printed page number (۱..۱۷); only for `kind: "numbered"`. */
  pageNumber?: number;
}

export interface BookPages {
  /** Hand these to `<HTMLFlipBook>` as children, in this order. */
  nodes: ReactNode[];
  /** `meta[i]` describes the page the engine shows at index `i`. */
  meta: BookPageMeta[];
}

/**
 * The filler page that makes the page count even, which is what gets
 * StPageFlip to treat the last page as a closed cover (see below). It is never
 * shown: it sits one index past the back cover, and Booklet.tsx stops the book
 * at the back cover and bounces back if a drag lands here.
 */
export const SPACER_INDEX = 0;

/** Index of the last spread you can actually read: the back cover + page ۱۷. */
export const LAST_SPREAD_INDEX = SPACER_INDEX + 1;

const SpacerPage = forwardRef<HTMLDivElement>(function SpacerPage(_props, ref) {
  // Plain paper: only ever glimpsed if a drag overshoots the end.
  return <PageShell ref={ref} hard>{null}</PageShell>;
});

/**
 * Every page of the booklet, in **library order**.
 *
 * This booklet is a **Persian (right-to-left) book**, but StPageFlip is an LTR
 * engine: it always paints `spread[0]` on the LEFT and `spread[1]` on the
 * right, puts index 0 alone on the RIGHT, and turns pages from right to left.
 * With `showCover` its spread builder is fixed:
 *
 *     [[0], [1,2], [3,4], …]   — last index alone only when the count is even
 *
 * A Persian book is the mirror image of that: the closed cover sits on the
 * LEFT, pages turn left → right, and in a spread the lower number is on the
 * RIGHT (the reader takes the right page first). No CSS transform can mirror
 * the book safely — StPageFlip works in raw client coordinates, so a mirrored
 * element makes corner dragging grab the wrong page.
 *
 * So the mirror is done by handing it the pages in **reverse**, which mirrors
 * the whole book without touching the engine:
 *
 *     index    0        1            2    3    …    18     19
 *     page     spacer   back cover   p17  p16  …    p1     front cover
 *
 * - the front cover is the last index → alone on the LEFT, the exact mirror of
 *   the engine's "cover alone on the right";
 * - a spread `[i, i+1]` shows p(19-i) left and p(18-i) right, i.e. the lower
 *   number on the right;
 * - a single page (portrait, or the closed cover) is still shown on its own;
 * - "next page" becomes the engine's `flipPrev`, so the LEFT page turns to the
 *   right, the way a Persian book opens (Booklet.tsx does that mapping).
 */
export function buildBookPages(): BookPages {
  const gamePages = [
    { key: "g-comm", domain: domainGames[0], intro: gamesIntro, games: domainGames[0].games, pageNumber: 10 },
    { key: "g-gross", domain: domainGames[1], games: domainGames[1].games, pageNumber: 11 },
    { key: "g-fine", domain: domainGames[2], games: domainGames[2].games, pageNumber: 12 },
    { key: "g-ps-1", domain: domainGames[3], games: domainGames[3].games.slice(0, 2), pageNumber: 13 },
    { key: "g-ps-2", domain: domainGames[3], games: domainGames[3].games.slice(2), pageNumber: 14 },
    { key: "g-social", domain: domainGames[4], games: domainGames[4].games, pageNumber: 15 },
  ];

  /** The 17 numbered pages, in *reading* order (۱ … ۱۷). */
  const numbered: { node: ReactNode; pageNumber: number }[] = [
    { node: <ChildInfoPage key="child-info" />, pageNumber: 1 },
    { node: <StatusLegendPage key="status" />, pageNumber: 2 },
    { node: <ResultsPage key="results" />, pageNumber: 3 },
    { node: <TenMonthsIntroPage key="intro" />, pageNumber: 4 },
    ...domainSkills.map((domain, i) => ({
      node: <SkillPage key={domain.name} domain={domain} pageNumber={i + 5} />,
      pageNumber: i + 5,
    })),
    ...gamePages.map((g) => ({
      node: (
        <GamePage
          key={g.key}
          accentKey={g.domain.accent}
          domainEmoji={g.domain.emoji}
          domainName={g.domain.name}
          games={g.games}
          intro={g.intro}
          pageNumber={g.pageNumber}
        />
      ),
      pageNumber: g.pageNumber,
    })),
    { node: <ReminderPage key="reminder" />, pageNumber: 16 },
    { node: <NextStepPage key="next-step" />, pageNumber: 17 },
  ];

  // Reverse = mirror the reading direction. The printed page numbers stay on
  // their own pages; only the order the engine receives them changes.
  const mirrored = [...numbered].reverse();

  const nodes: ReactNode[] = [
    <SpacerPage key="spacer" />,
    <BackCoverPage key="back-cover" />,
    ...mirrored.map((p) => p.node),
    <CoverPage key="cover" />,
  ];

  const meta: BookPageMeta[] = [
    { kind: "spacer" },
    { kind: "back-cover" },
    ...mirrored.map((p): BookPageMeta => ({ kind: "numbered", pageNumber: p.pageNumber })),
    { kind: "front-cover" },
  ];

  return { nodes, meta };
}
