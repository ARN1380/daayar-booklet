import Link from "next/link";
import { SLUG_LIST } from "@/data/content-map";
import { Cloud, Heart } from "@/components/decor";
import { toFaDigits } from "@/lib/fa";

/**
 * /admin — the admin hub. Everything owner-facing hangs off it: the workbook
 * list (/admin/workbooks) and creating a new booklet (/admin/new). The public
 * home page is a brand splash; each child's booklet is at /<slug>.
 */
export default function AdminDashboard() {
  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#FFF9EF]">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#FDECF3] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-56 h-80 w-80 rounded-full bg-[#E4F7EF] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#F0EDFC] blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-xl px-4 pb-16 pt-10">
        <header className="mb-8 text-center">
          <h1 className="text-[26px] font-black text-[#2F7B62]">🛠 مدیریت</h1>
          <p className="mt-2 text-[13px] font-bold leading-7 text-[#A08A77]">
            این‌جا فقط برای شماست؛ بازدیدکننده‌ها صفحات کتابچه را می‌بینند، نه این‌جا را.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <Link
            href="/admin/workbooks"
            className="group flex items-center gap-4 rounded-3xl border-2 border-[#F0D9B8] bg-white/90 px-6 py-5 shadow-[0_10px_30px_-16px_rgba(90,74,60,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(90,74,60,0.45)]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E4F7EF] text-[26px] ring-4 ring-white">
              📚
            </span>
            <span className="flex-1">
              <span className="block text-[16px] font-black text-[#3E9B7E]">
                کتابچه‌ها ({toFaDigits(SLUG_LIST.length)})
              </span>
              <span className="mt-0.5 block text-[11.5px] font-bold leading-5 text-[#A08A77]">
                مشاهده، ویرایش یا حذف کتابچه‌های موجود
              </span>
            </span>
            <span className="text-[20px] text-[#D98A3D] opacity-60 transition group-hover:opacity-100">
              ←
            </span>
          </Link>

          <Link
            href="/admin/new"
            className="group flex items-center gap-4 rounded-3xl border-2 border-[#F0D9B8] bg-white/90 px-6 py-5 shadow-[0_10px_30px_-16px_rgba(90,74,60,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(90,74,60,0.45)]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FDECF3] text-[26px] ring-4 ring-white">
              🌱
            </span>
            <span className="flex-1">
              <span className="block text-[16px] font-black text-[#F4829F]">
                کتابچه‌ی جدید
              </span>
              <span className="mt-0.5 block text-[11.5px] font-bold leading-5 text-[#A08A77]">
                ساخت کتابچه برای یک کودک تازه
              </span>
            </span>
            <span className="text-[20px] text-[#D98A3D] opacity-60 transition group-hover:opacity-100">
              ←
            </span>
          </Link>

          <Link
            href="/"
            className="group flex items-center gap-4 rounded-3xl border-2 border-[#F0D9B8] bg-white/90 px-6 py-5 shadow-[0_10px_30px_-16px_rgba(90,74,60,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(90,74,60,0.45)]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F0EDFC] text-[26px] ring-4 ring-white">
              🏠
            </span>
            <span className="flex-1">
              <span className="block text-[16px] font-black text-[#8A75C9]">صفحه‌ی اصلی</span>
              <span className="mt-0.5 block text-[11.5px] font-bold leading-5 text-[#A08A77]">
                صفحه‌ی عمومی با لوگوی دایار
              </span>
            </span>
            <span className="text-[20px] text-[#D98A3D] opacity-60 transition group-hover:opacity-100">
              ←
            </span>
          </Link>
        </div>

        <div className="pointer-events-none mt-12 flex items-center justify-center gap-2 opacity-40">
          <Heart className="h-5 w-5 text-[#F4829F]" />
          <Cloud className="h-6 w-8 text-[#A99BE8]/60" />
        </div>
      </div>
    </main>
  );
}