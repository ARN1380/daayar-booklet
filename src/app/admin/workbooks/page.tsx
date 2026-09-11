import Link from "next/link";
import { BOOKLETS, SLUG_LIST } from "@/data/content-map";
import { Cloud, Heart } from "@/components/decor";

/**
 * /admin/workbooks — the list of every child's booklet. Sits behind /admin
 * (only the booklet owner should reach it); the public home page is a brand
 * splash and each child's booklet is at /<slug>.
 */
export default function AdminWorkbooks() {
  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#FFF9EF]">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#FDECF3] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-56 h-80 w-80 rounded-full bg-[#E4F7EF] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#F0EDFC] blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-black text-[#2F7B62]">📚 کتابچه‌ها</h1>
            <p className="mt-1 text-[12px] font-bold leading-6 text-[#A08A77]">
              کتابچه‌های ساخته‌شده؛ برای هر کدام یک آدرس جدا در سایت هست.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border-2 border-[#F0D9B8] bg-white px-4 py-2 text-[12px] font-extrabold text-[#D98A3D] shadow-sm transition hover:bg-white"
          >
            → بازگشت به مدیریت
          </Link>
        </header>

        <div className="mb-6">
          <Link
            href="/admin/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F5B56B] px-6 py-3 text-[14px] font-black text-white shadow-[0_4px_0_#D98A3D] transition hover:brightness-105 active:translate-y-0.5 active:shadow-none"
          >
            ➕ ساخت کتابچه‌ی جدید
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {SLUG_LIST.map((slug) => {
            const c = BOOKLETS[slug];
            return (
              <div
                key={slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-[#F0D9B8] bg-white/90 px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F7EF] text-[22px] ring-4 ring-white">
                    👶
                  </div>
                  <div>
                    <p className="text-[16px] font-black text-[#3E9B7E]">{c.childInfo.name}</p>
                    <p className="mt-0.5 text-[11.5px] font-bold leading-5 text-[#A08A77]">
                      {c.childInfo.age && <>{c.childInfo.age} • </>}
                      <code className="rounded bg-[#FFF6E9] px-1.5 py-0.5" dir="ltr">
                        /{slug}
                      </code>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/edit/${slug}`}
                    className="rounded-full bg-[#6ECCAF] px-4 py-2 text-[12px] font-black text-white shadow-[0_3px_0_#3E9B7E] transition hover:brightness-105 active:translate-y-0.5 active:shadow-none"
                  >
                    ✏️ ویرایش
                  </Link>
                  <Link
                    href={`/${slug}`}
                    className="rounded-full border-2 border-[#F0D9B8] bg-white px-4 py-2 text-[12px] font-extrabold text-[#D98A3D] transition hover:bg-[#FFF6E9]"
                  >
                    👁 مشاهده
                  </Link>
                </div>
              </div>
            );
          })}
          {SLUG_LIST.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-[#E5CDA8] bg-white/60 px-6 py-10 text-center text-[13px] font-bold leading-7 text-[#A08A77]">
              هنوز کتابچه‌ای ساخته نشده. از دکمه‌ی «ساخت کتابچه‌ی جدید» شروع کنید 🌱
            </div>
          )}
        </div>

        <div className="pointer-events-none mt-10 flex items-center justify-center gap-2 opacity-40">
          <Heart className="h-5 w-5 text-[#F4829F]" />
          <Cloud className="h-6 w-8 text-[#A99BE8]/60" />
        </div>
      </div>
    </main>
  );
}