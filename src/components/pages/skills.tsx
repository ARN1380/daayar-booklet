import { forwardRef } from "react";
import type { DomainSkill } from "@/data/content";
import PageShell, { PageHeader, accentStyles } from "./PageShell";
import { Sparkle } from "@/components/decor";

/** One page describing a single skill domain's milestones at 10 months. */
const SkillPage = forwardRef<HTMLDivElement, { domain: DomainSkill; pageNumber: number }>(
  function SkillPage({ domain, pageNumber }, ref) {
    const accent = accentStyles[domain.accent];
    return (
      <PageShell ref={ref} accent={accent} pageNumber={pageNumber}>
        <PageHeader emoji={domain.emoji} title={domain.name} accent={accent} />

        <div
          className="rounded-2xl border-2 px-4 py-3.5"
          style={{ borderColor: accent.soft, backgroundColor: accent.soft }}
        >
          <p className="text-[12.5px] font-bold leading-[2] text-[#4d3f33]">{domain.intro}</p>
        </div>

        <p className="mb-2 mt-4 text-[12px] font-extrabold text-[#8A7566]">
          نمونه‌هایی از مهارت‌هایی که در این سن شکل می‌گیرن:
        </p>
        <div className="flex flex-1 flex-col gap-2">
          {domain.bullets.map((bullet) => (
            <div
              key={bullet}
              className="flex items-center gap-3 rounded-2xl bg-white/85 px-4 py-2.5 shadow-sm"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white"
                style={{ backgroundColor: accent.strong }}
              >
                {domain.emoji}
              </span>
              <span className="text-[12.5px] font-bold leading-6 text-[#5B4A3F]">{bullet}</span>
            </div>
          ))}
        </div>

        {/* big faded domain emoji in the corner */}
        <div className="pointer-events-none absolute bottom-10 left-5 opacity-15">
          <span className="text-[64px] leading-none">{domain.emoji}</span>
        </div>
        <div className="pointer-events-none absolute bottom-12 right-6">
          <Sparkle className="h-5 w-5 text-[#F5B56B]/70" />
        </div>
      </PageShell>
    );
  }
);

export default SkillPage;