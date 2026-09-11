import { forwardRef } from "react";
import { nextStep, reminder } from "@/data/content";
import PageShell, { PageHeader, accentStyles } from "./PageShell";
import { BabyFace, Cloud, Flower, Heart, Sparkle, Star } from "@/components/decor";

// ---------- Reminder ----------

export const ReminderPage = forwardRef<HTMLDivElement>(function ReminderPage(_props, ref) {
  return (
    <PageShell ref={ref} accent={accentStyles.peach} pageNumber={16}>
      <div className="mb-4 flex items-center justify-center">
        <span className="text-6xl leading-none drop-shadow-sm">💛</span>
      </div>

      <PageHeader emoji="🌷" title={reminder.title} accent={accentStyles.peach} />

      <div
        className="flex flex-1 flex-col justify-center gap-3 rounded-3xl border-2 px-5 py-4"
        style={{
          borderColor: "#FDE6C8",
          background: "linear-gradient(170deg, #FFF6E9 0%, #FDECF3 100%)",
        }}
      >
        {reminder.lines.map((line, i) => (
          <p
            key={i}
            className="text-[13.5px] font-bold leading-[2.1] text-[#6B4A3A]"
            style={{ textAlign: i === 2 ? "center" : "right" }}
          >
            {line}
          </p>
        ))}
        <div className="mt-1 flex items-center justify-center gap-2">
          <Heart className="h-4 w-4 text-[#F4A3C2]" />
          <Heart className="h-5 w-5 text-[#F5B56B]" />
          <Heart className="h-4 w-4 text-[#F4A3C2]" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-10 left-6 opacity-20">
        <Flower className="h-12 w-12 text-[#F4A3C2]" />
      </div>
      <div className="pointer-events-none absolute right-8 bottom-14 opacity-25">
        <Star className="h-6 w-6 text-[#FFD34E]" />
      </div>
    </PageShell>
  );
});

// ---------- Next step ----------

export const NextStepPage = forwardRef<HTMLDivElement>(function NextStepPage(_props, ref) {
  return (
    <PageShell ref={ref} accent={accentStyles.mint} pageNumber={17}>
      <PageHeader emoji="📌" title={nextStep.title} accent={accentStyles.mint} />

      <div className="rounded-2xl border-2 border-[#D9F2E7] bg-[#E4F7EF] px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">🗓️</span>
          <span className="rounded-full bg-white/85 px-3.5 py-1 text-[12.5px] font-black text-[#3E9B7E]">
            غربالگری بعدی: ۱۲ ماهگی
          </span>
        </div>
        <p className="mt-3 text-[12px] font-medium leading-[2] text-[#3E6B5A]">
          {nextStep.lines[0]}
        </p>
      </div>

      <div className="mt-3 rounded-2xl border-2 border-[#FDEADD] bg-[#FDEADD] px-4 py-3">
        <p className="text-[12.5px] font-extrabold leading-7 text-[#B4552E]">
          ⚠️ یادتون باشه: غربالگری، تشخیص اختلال نیست.
        </p>
      </div>

      <div className="mt-3 rounded-2xl border-2 border-[#E4DCF8] bg-[#F0EDFC] px-4 py-3">
        <p className="text-[11.5px] font-medium leading-[2] text-[#5A4E8A]">{nextStep.lines[2]}</p>
      </div>

      <div className="pointer-events-none absolute bottom-10 left-5 opacity-20">
        <span className="text-[60px] leading-none">📌</span>
      </div>
      <div className="pointer-events-none absolute bottom-12 right-6">
        <Sparkle className="h-5 w-5 text-[#A99BE8]/70" />
      </div>
    </PageShell>
  );
});

// ---------- Back cover ----------

export const BackCoverPage = forwardRef<HTMLDivElement>(function BackCoverPage(_props, ref) {
  return (
    <div
      ref={ref}
      dir="rtl"
      lang="fa"
      data-density="hard"
      className="relative h-full w-full overflow-hidden rounded-[4px] select-none"
      style={{
        background: "linear-gradient(165deg, #FDECF3 0%, #FFF6E9 55%, #E4F7EF 100%)",
      }}
    >
      <div className="paper-dots absolute inset-0" />

      <div className="pointer-events-none absolute left-6 top-6">
        <Cloud className="h-9 w-10 text-[#A99BE8]/60" />
      </div>
      <div className="pointer-events-none absolute right-7 top-10">
        <Star className="h-5 w-5 text-[#FFD34E]/90" />
      </div>
      <div className="pointer-events-none absolute bottom-10 right-8">
        <Flower className="h-12 w-12 text-[#F4A3C2]/80" />
      </div>
      <div className="pointer-events-none absolute bottom-14 left-8">
        <Sparkle className="h-6 w-6 text-[#7FB5E8]/70" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-10 text-center">
        <BabyFace className="h-24 w-24 opacity-90" />
        <p className="mt-6 text-[34px] font-black leading-[1.4] text-[#3E9B7E]">پایان</p>
        <p className="mt-3 text-[14px] font-bold leading-7 text-[#8A7566]">
          با عشق، برای آرمان جان 🌱💛
        </p>

        <div className="mt-8 flex items-center gap-2">
          <Star className="h-4 w-4 text-[#F5B56B]" />
          <Heart className="h-5 w-5 text-[#F4A3C2]" />
          <Star className="h-4 w-4 text-[#F5B56B]" />
        </div>
      </div>
    </div>
  );
});