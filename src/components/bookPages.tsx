import type { ReactNode } from "react";
import CoverPage from "./pages/cover";
import { ChildInfoPage, ResultsPage, StatusLegendPage, TenMonthsIntroPage } from "./pages/info";
import SkillPage from "./pages/skills";
import GamePage from "./pages/games";
import { BackCoverPage, NextStepPage, ReminderPage } from "./pages/closing";
import { domainGames, domainSkills, gamesIntro } from "@/data/content";

/**
 * Every page of the booklet in reading order.
 *
 * Index 0 is the front cover, index 18 the back cover, and for the numbered
 * pages `index === pageNumber` (1..17). The flip book builds itself from this
 * array, so page order lives in exactly one place.
 */
export function buildBookPages(): ReactNode[] {
  const gamePages = [
    { key: "g-comm", domain: domainGames[0], intro: gamesIntro, games: domainGames[0].games, pageNumber: 10 },
    { key: "g-gross", domain: domainGames[1], games: domainGames[1].games, pageNumber: 11 },
    { key: "g-fine", domain: domainGames[2], games: domainGames[2].games, pageNumber: 12 },
    { key: "g-ps-1", domain: domainGames[3], games: domainGames[3].games.slice(0, 2), pageNumber: 13 },
    { key: "g-ps-2", domain: domainGames[3], games: domainGames[3].games.slice(2), pageNumber: 14 },
    { key: "g-social", domain: domainGames[4], games: domainGames[4].games, pageNumber: 15 },
  ];

  return [
    <CoverPage key="cover" />,
    <ChildInfoPage key="child-info" />,
    <StatusLegendPage key="status" />,
    <ResultsPage key="results" />,
    <TenMonthsIntroPage key="intro" />,
    ...domainSkills.map((domain, i) => (
      <SkillPage key={domain.name} domain={domain} pageNumber={i + 5} />
    )),
    ...gamePages.map((g) => (
      <GamePage
        key={g.key}
        accentKey={g.domain.accent}
        domainEmoji={g.domain.emoji}
        domainName={g.domain.name}
        games={g.games}
        intro={g.intro}
        pageNumber={g.pageNumber}
      />
    )),
    <ReminderPage key="reminder" />,
    <NextStepPage key="next-step" />,
    <BackCoverPage key="back-cover" />,
  ];
}
