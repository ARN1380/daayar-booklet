import { forwardRef } from "react";
import { BabyFace, Cloud, Flower, Heart, Sparkle, Star, Sun } from "@/components/decor";
import PageCanvas from "@/components/PageCanvas";

/**
 * Front cover (hard page).
 *
 * The background MUST come from the `cover-front` class: react-pageflip
 * overwrites the page root's inline `style` attribute, so a `style={{...}}`
 * background would be wiped out and the cover would render transparent. The
 * artwork itself sits on the scaled PageCanvas so it keeps its proportions on
 * small screens.
 */
const CoverPage = forwardRef<HTMLDivElement>(function CoverPage(_props, ref) {
  return (
    <div
      ref={ref}
      dir="rtl"
      lang="fa"
      data-density="hard"
      className="cover-front relative h-full w-full overflow-hidden rounded-[6px] select-none"
    >
      <PageCanvas>
        <div className="cover-dots absolute inset-0" />

        {/*
          Spine shading + stitched binding line on the bound edge. The closed
          cover sits in the left half of the stage, so its bound edge — where the
          book folds — is on the RIGHT, next to the centre spine.
        */}
        <div className="cover-spine pointer-events-none absolute inset-y-0 right-0 w-4" />
        <div className="pointer-events-none absolute inset-y-8 right-[16px] w-px bg-white/70" />
        <div className="pointer-events-none absolute inset-y-8 right-[22px] w-px bg-white/40" />

        {/* sticker-style frame */}
        <div className="pointer-events-none absolute inset-[12px] rounded-[20px] border-[3px] border-white/80" />
        <div className="pointer-events-none absolute inset-[20px] rounded-[14px] border border-dashed border-white/70" />

        {/* floating decorations */}
        <div className="pointer-events-none absolute right-7 top-7">
          <Sun className="h-12 w-12 text-[#FFD34E]" />
        </div>
        <div className="pointer-events-none absolute left-9 top-14">
          <Cloud className="h-10 w-12 text-white/85" />
        </div>
        <div className="pointer-events-none absolute right-12 top-32">
          <Star className="h-5 w-5 text-white/90" />
        </div>
        <div className="pointer-events-none absolute left-10 top-40">
          <Sparkle className="h-6 w-6 text-[#FFD34E]" />
        </div>
        <div className="pointer-events-none absolute bottom-32 right-9">
          <Sparkle className="h-5 w-5 text-white/85" />
        </div>
        <div className="pointer-events-none absolute bottom-40 left-11">
          <Star className="h-4 w-4 text-[#FFF0B8]" />
        </div>
        <div className="pointer-events-none absolute bottom-12 left-8">
          <Flower className="h-11 w-11 text-[#F9A8C4]" />
        </div>
        <div className="pointer-events-none absolute bottom-24 right-16">
          <Heart className="h-5 w-5 text-[#F4829F]" />
        </div>

        {/* content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-12 text-center">
          <div className="mb-5 flex h-[168px] w-[168px] items-center justify-center rounded-full bg-white/75 ring-4 ring-white/70 shadow-[0_12px_28px_-10px_rgba(47,123,98,0.45)]">
            <BabyFace className="h-36 w-36" />
          </div>

          <h1 className="text-[25px] font-black leading-[1.5] text-[#2F7B62] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
            🌱 کارنامه غربالگری رشد
          </h1>
          <p className="text-[42px] font-black leading-[1.25] text-[#C9743A] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
            آرمان
          </p>

          <div className="mt-6 rounded-full bg-[#F5B56B] px-7 py-2 text-[13px] font-black text-white shadow-[0_4px_0_#D98A3D]">
            کتابچه‌ی راهنمای والدین 💛
          </div>

          <p className="mt-6 text-[12.5px] font-bold leading-7 text-[#3E7F68]">
            همراه آرمان، قدم‌به‌قدم در مسیر رشد 🌱
          </p>

          <div className="mt-6 flex items-center gap-3 text-[22px] leading-none">
            <span>🐶</span>
            <span>⚽</span>
            <span>🧸</span>
          </div>
        </div>

        {/* bottom row of hearts */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
          <Star className="h-3.5 w-3.5 text-[#FFF0B8]" />
          <Heart className="h-4 w-4 text-[#F4829F]" />
          <Heart className="h-5 w-5 text-[#F5B56B]" />
          <Heart className="h-4 w-4 text-[#F4829F]" />
          <Star className="h-3.5 w-3.5 text-[#FFF0B8]" />
        </div>
      </PageCanvas>
    </div>
  );
});

export default CoverPage;
