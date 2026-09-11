import { forwardRef } from "react";
import type { ChildInfo, DomainResult, DomainSkill, StatusInfo } from "@/data/types";
import PageShell, { PageHeader, StatusChip, accentStyles, statusStyles } from "./PageShell";
import { Flower, Heart, Star } from "@/components/decor";

// ---------- Child info ----------

export const ChildInfoPage = forwardRef<HTMLDivElement, { childInfo: ChildInfo }>(
  function ChildInfoPage({ childInfo: ci }, ref) {
    const infoItems = [
      { emoji: "👶", label: "نام و نام خانوادگی", value: ci.name },
      { emoji: "🎂", label: "تاریخ تولد", value: ci.birthDate },
      { emoji: "📋", label: "تاریخ انجام غربالگری", value: ci.screeningDate },
      { emoji: "⏰", label: "سن هنگام غربالگری", value: ci.age },
    ];

    return (
      <PageShell ref={ref} accent={accentStyles.peach} pageNumber={1}>
        <PageHeader emoji="👶" title="مشخصات کودک" accent={accentStyles.peach} />

        <div className="grid grid-cols-2 gap-3">
          {infoItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-[#F5D9B8]/70 bg-white/80 px-3 py-5 text-center shadow-sm"
            >
              <span className="text-3xl leading-none">{item.emoji}</span>
              <span className="text-[10.5px] font-bold text-[#A08A77]">{item.label}</span>
              <span className="text-[15px] font-extrabold text-[#5B4A3F]">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[#FDF1E0] to-[#FDECF3] px-4 py-5 text-center">
          <Heart className="h-7 w-7 text-[#F4A3C2]" />
          <p className="text-[13px] font-extrabold leading-7 text-[#8A5A3B]">
            این کتابچه، راهنمای رشد و شکوفایی
          </p>
          <p className="text-[13px] font-extrabold leading-7 text-[#8A5A3B]">دردونه‌ی شماست 💛</p>
        </div>
      </PageShell>
    );
  }
);

// ---------- Status legend ----------

export const StatusLegendPage = forwardRef<
  HTMLDivElement,
  { childInfo: ChildInfo; statuses: StatusInfo[] }
>(function StatusLegendPage({ childInfo: ci, statuses: st }, ref) {
  return (
    <PageShell ref={ref} accent={accentStyles.peach} pageNumber={2}>
      <PageHeader
        emoji="🌱"
        title="وضعیت مهارت‌های رشدی"
        accent={accentStyles.peach}
        subtitle={`نتیجه‌ی ارزیابی پنج حیطه‌ی رشدی ${ci.name} جان با سه توصیف زیر به شما نمایش داده می‌شه. پس با توجه به توضیحات زیر برای گام بعدی مسیر رشد دردونه‌تون تصمیم بگیرین.`}
      />

      <div className="flex flex-1 flex-col gap-2.5">
        {st.map((status) => {
          const s = statusStyles[status.key];
          return (
            <div
              key={status.key}
              className="rounded-2xl border-2 px-4 py-3"
              style={{ borderColor: s.soft, backgroundColor: s.soft }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{status.emoji}</span>
                <h3 className="text-[14px] font-extrabold" style={{ color: s.strong }}>
                  {status.title}
                </h3>
              </div>
              <p className="mt-1.5 text-[11.5px] font-medium leading-[1.95] text-[#6B5A4C]">
                {status.description}
              </p>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
});

// ---------- Results table ----------

export const ResultsPage = forwardRef<
  HTMLDivElement,
  { childInfo: ChildInfo; results: DomainResult[] }
>(function ResultsPage({ childInfo: ci, results: rs }, ref) {
  const needsAttention = rs.filter((r) => r.status === "evaluate");
  return (
    <PageShell ref={ref} accent={accentStyles.lavender} pageNumber={3}>
      <PageHeader emoji="🧾" title={`نتیجه غربالگری ${ci.name}`} accent={accentStyles.lavender} />

      <div className="overflow-hidden rounded-2xl border-2 border-[#E4DCF8] bg-white/85 shadow-sm">
        <div className="flex items-center justify-between bg-[#F0EDFC] px-4 py-2">
          <span className="text-[12px] font-extrabold text-[#7C6BD1]">حیطه رشدی</span>
          <span className="text-[12px] font-extrabold text-[#7C6BD1]">وضعیت</span>
        </div>
        {rs.map((row, i) => (
          <div
            key={row.name}
            className="flex items-center justify-between px-4 py-[9px]"
            style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAF7FF" }}
          >
            <span className="flex items-center gap-2 text-[13px] font-bold text-[#5B4A3F]">
              <span className="text-lg leading-none">{row.emoji}</span>
              {row.name}
            </span>
            <StatusChip status={row.status} />
          </div>
        ))}
      </div>

      {needsAttention.length > 0 && (
        <div className="mt-4 rounded-2xl border-2 border-[#FDEADD] bg-[#FDEADD] px-4 py-3">
          <p className="text-[11.5px] font-bold leading-6 text-[#B4552E]">
            🧐 در این حیطه‌ها بررسی دقیق‌تر توسط متخصص پیشنهاد می‌شه:
          </p>
          <p className="mt-1 text-[12px] font-bold leading-6 text-[#8A5A3B]">
            {needsAttention.map((r) => `${r.emoji} ${r.name}`).join("  •  ")}
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-12 left-6 opacity-25">
        <Flower className="h-14 w-14 text-[#A99BE8]" />
      </div>
    </PageShell>
  );
});

// ---------- 10-months intro ----------

export const TenMonthsIntroPage = forwardRef<
  HTMLDivElement,
  { childInfo: ChildInfo; tenMonthsIntro: string; domainSkills: DomainSkill[] }
>(function TenMonthsIntroPage({ childInfo: ci, tenMonthsIntro: intro, domainSkills: ds }, ref) {
  return (
    <PageShell ref={ref} accent={accentStyles.mint} pageNumber={4}>
      <PageHeader
        emoji="🌱"
        title={`در ${ci.age} چه مهارت‌هایی در حال شکل‌گیری هستند؟`}
        accent={accentStyles.mint}
      />

      <div className="rounded-2xl border-2 border-[#D9F2E7] bg-[#E4F7EF] px-4 py-3.5">
        <p className="text-[12px] font-medium leading-[1.95] text-[#3E6B5A]">{intro}</p>
      </div>

      <p className="mt-4 mb-2 text-[12px] font-extrabold text-[#8A7566]">
        پنج حیطه‌ی رشدی که در ادامه می‌خونیم:
      </p>
      <div className="flex flex-col gap-2">
        {ds.map((d) => {
          const a = accentStyles[d.accent];
          return (
            <div
              key={d.name}
              className="flex items-center gap-3 rounded-2xl border-2 bg-white/85 px-4 py-2.5"
              style={{ borderColor: a.soft }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: a.soft }}
              >
                {d.emoji}
              </span>
              <span className="flex-1 text-[13.5px] font-extrabold" style={{ color: a.deep }}>
                {d.name}
              </span>
              <Star className="h-4 w-4 text-[#F5B56B]/80" />
            </div>
          );
        })}
      </div>
    </PageShell>
  );
});