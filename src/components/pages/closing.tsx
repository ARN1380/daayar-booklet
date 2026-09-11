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

/**
 * Back cover (hard page).
 *
 * Like the front cover, the background has to come from the `cover-back`
 * class — react-pageflip wipes the page root's inline `style` attribute.
 */
export const BackCoverPage = forwardRef<HTMLDivElement>(function BackCoverPage(_props, ref) {
  return (
    <div
      ref={ref}
      dir="rtl"
      lang="fa"
      data-density="hard"
      className="cover-back relative h-full w-full overflow-hidden rounded-[6px] select-none"
    >
      <div className="cover-dots absolute inset-0" />

      {/* spine shading mirrors the front cover so the bound edge lines up */}
      <div className="cover-spine pointer-events-none absolute inset-y-0 left-0 w-4" />

      {/* sticker-style frame */}
      <div className="pointer-events-none absolute inset-[12px] rounded-[20px] border-[3px] border-white/80" />
      <div className="pointer-events-none absolute inset-[20px] rounded-[14px] border border-dashed border-white/70" />

      <div className="pointer-events-none absolute left-8 top-8">
        <Cloud className="h-10 w-12 text-white/85" />
      </div>
      <div className="pointer-events-none absolute right-9 top-14">
        <Star className="h-5 w-5 text-[#FFD34E]" />
      </div>
      <div className="pointer-events-none absolute right-12 top-36">
        <Sparkle className="h-5 w-5 text-white/85" />
      </div>
      <div className="pointer-events-none absolute bottom-12 right-9">
        <Flower className="h-11 w-11 text-[#F9A8C4]" />
      </div>
      <div className="pointer-events-none absolute bottom-32 left-9">
        <Sparkle className="h-6 w-6 text-[#7FB5E8]" />
      </div>
      <div className="pointer-events-none absolute bottom-24 left-16">
        <Heart className="h-5 w-5 text-[#F4829F]" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-12 text-center">
        <div className="flex h-[132px] w-[132px] items-center justify-center rounded-full bg-white/75 ring-4 ring-white/70 shadow-[0_12px_28px_-10px_rgba(209,106,151,0.4)]">
          <BabyFace className="h-28 w-28" />
        </div>

        <p className="mt-6 text-[36px] font-black leading-[1.3] text-[#C9743A] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
          پایان
        </p>
        <p className="mt-3 text-[14px] font-bold leading-7 text-[#6B5B4E]">
          با عشق، برای آرمان جان 🌱💛
        </p>

        <div className="mt-8 flex items-center gap-2">
          <Star className="h-4 w-4 text-[#F5B56B]" />
          <Heart className="h-5 w-5 text-[#F4829F]" />
          <Star className="h-4 w-4 text-[#F5B56B]" />
        </div>
      </div>
    </div>
  );
});