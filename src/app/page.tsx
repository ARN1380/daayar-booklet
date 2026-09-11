/**
 * Landing page: the daayar brand. Just the logo, a title and a short line
 * pointing at daayar.com — the workbooks live under /admin/workbooks and the
 * booklet pages at /<slug>, so this page has no interaction of its own.
 */
export default function Home() {
  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-4 overflow-hidden px-6 bg-gradient-to-b from-[#FFF9EF] to-[#FDF1E6]">
      <a
        href="https://daayar.com"
        target="_blank"
        rel="noopener noreferrer"
        title="daayar.com"
        className="flex flex-col items-center text-center transition hover:scale-[1.03]"
      >
        {/* The exact logo markup daayar uses; keep the plain <img> tag as-is. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="logo"
          loading="lazy"
          width="48"
          height="48"
          decoding="async"
          className="lg:w-12 lg:h-12 w-8 h-8"
          srcSet="/_next/image?url=%2Fassets%2Fimages%2Flogo.png&w=48&q=75 1x, /_next/image?url=%2Fassets%2Fimages%2Flogo.png&w=96&q=75 2x"
          src="/_next/image?url=%2Fassets%2Fimages%2Flogo.png&w=96&q=75"
          style={{ color: "transparent" }}
        />
        <h1 className="mt-4 text-[28px] font-black leading-[1.5] text-[#2F7B62]">دایار</h1>
        <p className="text-[14px] font-bold leading-7 text-[#A08A77]">
          کتابچه‌های غربالگری رشد و راهنمای بازی
        </p>
      </a>
    </main>
  );
}