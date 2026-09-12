"use client";

import { useMemo, type ReactNode } from "react";
import CoverPage from "@/components/pages/cover";
import {
  ChildInfoPage,
  ResultsPage,
  StatusLegendPage,
  TenMonthsIntroPage,
} from "@/components/pages/info";
import SkillPage from "@/components/pages/skills";
import GamePage from "@/components/pages/games";
import { BackCoverPage, NextStepPage, ReminderPage } from "@/components/pages/closing";
import { PAGE_HEIGHT, PAGE_WIDTH } from "@/components/PageCanvas";
import { toContentShape, type EditorData } from "./bookletData";

/**
 * Live preview of every booklet page, reusing the REAL page components fed by
 * the current editor state (same 550×733 design canvas the flip book uses, so
 * overflow and typos show up here before export).
 */
export default function Preview({ data }: { data: EditorData }) {
  const content = useMemo(() => toContentShape(data), [data]);
  const pages = useMemo(() => buildPreviewPages(content), [content]);

  return (
    <div dir="rtl" className="grid gap-10">
      {pages.map(({ node, label }, i) => (
        <section key={i} className="mx-auto w-full max-w-[550px]">
          <p className="mb-2 text-center text-[11.5px] font-extrabold text-[#A08A77]">{label}</p>
          <div
            className="w-full overflow-hidden rounded-[6px] shadow-[0_18px_40px_-16px_rgba(90,74,60,0.4)] ring-1 ring-black/5"
            style={{ aspectRatio: `${PAGE_WIDTH} / ${PAGE_HEIGHT}` }}
          >
            {node}
          </div>
        </section>
      ))}
    </div>
  );
}

interface PreviewEntry {
  node: ReactNode;
  label: string;
}

/** Same layout logic as src/components/bookPages.tsx, but read from editor state. */
function buildPreviewPages(c: ReturnType<typeof toContentShape>): PreviewEntry[] {
  // This mirrors bookPages.tsx's game page split exactly (domain 3 spans pages 13-14).
  const gamePages = [
    { key: "g-comm", g: c.domainGames[0], n: 10, intro: c.gamesIntro },
    { key: "g-gross", g: c.domainGames[1], n: 11 },
    { key: "g-fine", g: c.domainGames[2], n: 12 },
    { key: "g-ps-1", g: c.domainGames[3], n: 13, slice: [0, 2] },
    { key: "g-ps-2", g: c.domainGames[3], n: 14, slice: [2] },
    { key: "g-social", g: c.domainGames[4], n: 15 },
  ];

  const numbered: PreviewEntry[] = [
    { node: <ChildInfoPage childInfo={c.childInfo} titles={c.titles} />, label: "۱ — مشخصات کودک" },
    {
      node: <StatusLegendPage childInfo={c.childInfo} statuses={c.statuses} titles={c.titles} />,
      label: "۲ — وضعیت مهارت‌ها",
    },
    {
      node: <ResultsPage childInfo={c.childInfo} results={c.results} titles={c.titles} />,
      label: "۳ — نتیجه غربالگری",
    },
    {
      node: (
        <TenMonthsIntroPage
          childInfo={c.childInfo}
          tenMonthsIntro={c.tenMonthsIntro}
          domainSkills={c.domainSkills}
          titles={c.titles}
        />
      ),
      label: "۴ — مهارت‌ها در ۱۰ ماهگی",
    },
    ...c.domainSkills.map((d, i) => ({
      node: <SkillPage key={d.name} domain={d} pageNumber={i + 5} />,
      label: `${i + 5} — ${d.emoji} ${d.name}`,
    })),
    ...gamePages.map((p) => ({
      node: (
        <GamePage
          key={p.key}
          accentKey={p.g.accent}
          domainEmoji={p.g.emoji}
          domainName={p.g.name}
          games={p.slice ? p.g.games.slice(p.slice[0], p.slice[1]) : p.g.games}
          intro={p.intro}
          pageNumber={p.n}
          titles={c.titles}
        />
      ),
      label: `${p.n} — بازی‌های ${p.g.emoji} ${p.g.name}${p.slice ? p.slice[0] === 0 ? " (۱ از ۲)" : " (۲ از ۲)" : ""}`,
    })),
    { node: <ReminderPage reminder={c.reminder} />, label: "۱۶ — یادآوری" },
    { node: <NextStepPage nextStep={c.nextStep} childInfo={c.childInfo} />, label: "۱۷ — قدم بعدی" },
  ];

  return [
    { node: <CoverPage childInfo={c.childInfo} />, label: "جلد" },
    ...numbered,
    { node: <BackCoverPage childInfo={c.childInfo} />, label: "پشت جلد" },
  ];
}