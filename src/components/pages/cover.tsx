import { forwardRef } from "react";
import { BabyFace, Cloud, Heart, Sparkle, Star, Sun } from "@/components/decor";

/** Front cover (hard page). */
const CoverPage = forwardRef<HTMLDivElement>(function CoverPage(_props, ref) {
  return (
    <div
      ref={ref}
      dir="rtl"
      lang="fa"
      data-density="hard"
      className="relative h-full w-full overflow-hidden rounded-[4px] select-none"
      style={{
        background: "linear-gradient(165deg, #E4F7EF 0%, #FFF6E9 55%, #FDECF3 100%)",
      }}
    >
      <div className="paper-dots absolute inset-0" />

      {/* floating decorations */}
      <div className="pointer-events-none absolute right-5 top-5">
        <Sun className="h-11 w-11 text-[#FFD34E]" />
      </div>
      <div className="pointer-events-none absolute left-6 top-8">
        <Cloud className="h-9 w-10 text-[#A99BE8]/70" />
      </div>
      <div className="pointer-events-none absolute left-12 top-28">
        <Star className="h-5 w-5 text-[#7FB5E8]/70" />
      </div>
      <div className="pointer-events-none absolute right-10 top-36">
        <Sparkle className="h-6 w-6 text-[#6ECCAF]/80" />
      </div>
      <div className="pointer-events-none absolute right-16 top-52">
        <Star className="h-4 w-4 text-[#F5B56B]/80" />
      </div>

      <div className="pointer-events-none absolute bottom-10 right-8">
        <Heart className="h-6 w-6 text-[#F4A3C2]/80" />
      </div>
      <div className="pointer-events-none absolute bottom-16 left-8">
        <Sparkle className="h-5 w-5 text-[#A99BE8]/70" />
      </div>
      <div className="pointer-events-none absolute bottom-28 left-14">
        <Star className="h-4 w-4 text-[#FFD34E]/90" />
      </div>
      <div className="pointer-events-none absolute bottom-32 right-14">
        <Cloud className="h-7 w-8 text-[#7FB5E8]/60" />
      </div>

      {/* content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-10 text-center">
        <BabyFace className="mb-6 h-36 w-36 drop-shadow-md" />
        <h1 className="text-[27px] font-black leading-[1.55] text-[#3E9B7E]">
          🌱 کارنامه غربالگری رشد
        </h1>
        <p className="mt-0.5 text-[36px] font-black leading-[1.4] text-[#D98A3D]">آرمان</p>

        <div className="mt-6 rounded-full border border-[#F0D9B8] bg-white/85 px-6 py-2 text-[13px] font-bold text-[#8A7566] shadow-sm">
          کتابچه‌ی راهنمای والدین 💛
        </div>

        <p className="mt-7 text-[12px] font-medium leading-6 text-[#A08A77]">
          همراه آرمان، قدم‌به‌قدم در مسیر رشد 🌱
        </p>
      </div>

      {/* bottom row of hearts */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 text-sm opacity-70">
        <Heart className="h-3.5 w-3.5 text-[#F4A3C2]" />
        <Heart className="h-4 w-4 text-[#F5B56B]" />
        <Heart className="h-3.5 w-3.5 text-[#F4A3C2]" />
      </div>
    </div>
  );
});

export default CoverPage;