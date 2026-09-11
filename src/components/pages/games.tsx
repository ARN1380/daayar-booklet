import { forwardRef } from "react";
import type { AccentKey, Game } from "@/data/content";
import PageShell, { PageHeader, type AccentStyle, accentStyles } from "./PageShell";
import { toFaDigits } from "@/lib/fa";

interface GamePageProps {
  accentKey: AccentKey;
  domainEmoji: string;
  domainName: string;
  games: Game[];
  pageNumber: number;
  /** Show the shared games intro paragraph at the top (first games page only). */
  intro?: string;
}

/** One page of suggested games for a skill domain. */
const GamePage = forwardRef<HTMLDivElement, GamePageProps>(function GamePage(
  { accentKey, domainEmoji, domainName, games, pageNumber, intro },
  ref
) {
  const accent = accentStyles[accentKey];
  return (
    <PageShell ref={ref} accent={accent} pageNumber={pageNumber}>
      <PageHeader
        emoji="🎯"
        title="بازی‌ها و فعالیت‌های پیشنهادی"
        accent={accent}
        subtitle={`${domainEmoji} ${domainName}`}
      />

      {intro && (
        <p className="mb-3 rounded-2xl bg-[#FFF6E9] px-4 py-2.5 text-[11.5px] font-medium leading-[1.9] text-[#8A7566]">
          {intro}
        </p>
      )}

      <div className="flex flex-1 flex-col gap-3">
        {games.map((game, i) => (
          <GameCard key={game.title} game={game} index={i} accent={accent} />
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-10 left-5 opacity-15">
        <span className="text-[56px] leading-none">{domainEmoji}</span>
      </div>
    </PageShell>
  );
});

function GameCard({ game, index, accent }: { game: Game; index: number; accent: AccentStyle }) {
  return (
    <div className="rounded-2xl border-2 bg-white/90 px-4 py-3 shadow-sm" style={{ borderColor: accent.soft }}>
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white"
          style={{ backgroundColor: accent.strong }}
        >
          {toFaDigits(index + 1)}
        </span>
        <span className="text-lg leading-none">{game.emoji}</span>
        <h3 className="text-[14px] font-extrabold" style={{ color: accent.deep }}>
          {game.title}
        </h3>
      </div>
      <ul className="mt-2 space-y-1.5">
        {game.steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-[11.5px] font-medium leading-[1.85] text-[#6B5A4C]">
            <span
              className="mt-[9px] inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: accent.strong }}
            />
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GamePage;