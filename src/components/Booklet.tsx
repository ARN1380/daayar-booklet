"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { buildBookPages } from "./bookPages";
import { toFaDigits } from "@/lib/fa";
import { Cloud, Heart, Sparkle } from "./decor";

/** Minimal handle exposed by react-pageflip's ref (no bundled types). */
interface FlipBookHandle {
  pageFlip: () => {
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
    getPageCount: () => number;
    getCurrentPageIndex: () => number;
  } | null;
}

export default function Booklet() {
  const bookRef = useRef<FlipBookHandle | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  // Children are memoized so react-pageflip doesn't re-clone pages on every render.
  const pages = useMemo(() => buildBookPages(), []);

  const readTotal = useCallback(() => {
    const flip = bookRef.current?.pageFlip();
    if (flip) setTotal(flip.getPageCount());
  }, []);

  useEffect(() => {
    // Fallback: in case onInit hasn't fired yet.
    readTotal();
  }, [readTotal]);

  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);
  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);

  // Keyboard navigation (RTL book: forward is to the left).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") flipNext();
      if (e.key === "ArrowRight") flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipNext, flipPrev]);

  const onFlip = useCallback((e: { data: number }) => setPage(e.data), []);
  const onInit = useCallback(() => readTotal(), [readTotal]);

  const atStart = page <= 0;
  const atEnd = total > 0 && page >= total - 1;

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-3 overflow-hidden px-3 py-3">
      {/* soft background blobs behind the book */}
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#FDECF3] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-80 w-80 rounded-full bg-[#E4F7EF] blur-3xl" />
      <div className="pointer-events-none absolute left-10 top-10 opacity-60">
        <Cloud className="h-8 w-10 text-[#A99BE8]/50" />
      </div>
      <div className="pointer-events-none absolute right-8 top-40 opacity-70">
        <Sparkle className="h-5 w-5 text-[#F5B56B]/70" />
      </div>
      <div className="pointer-events-none absolute bottom-24 left-8 opacity-70">
        <Heart className="h-5 w-5 text-[#F4A3C2]/70" />
      </div>

      <div className="book-stage relative z-10">
        <HTMLFlipBook
          ref={bookRef}
          width={550}
          height={733}
          size="stretch"
          minWidth={300}
          maxWidth={800}
          minHeight={400}
          maxHeight={1000}
          startPage={0}
          drawShadow
          usePortrait
          startZIndex={0}
          autoSize
          maxShadowOpacity={0.5}
          showCover
          mobileScrollSupport
          clickEventForward
          useMouseEvents
          swipeDistance={30}
          showPageCorners
          disableFlipByClick={false}
          flippingTime={900}
          style={{}}
          className="book"
          onFlip={onFlip}
          onInit={onInit}
        >
          {pages}
        </HTMLFlipBook>
      </div>

      {/* page-turn controls */}
      <div className="relative z-10 flex items-center gap-3">
        <button
          type="button"
          onClick={flipPrev}
          disabled={atStart}
          aria-label="صفحه قبل"
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#F0D9B8] bg-white/90 text-xl text-[#D98A3D] shadow-sm transition hover:scale-105 hover:bg-white active:scale-95 disabled:pointer-events-none disabled:opacity-35"
        >
          ❯
        </button>
        <div className="rounded-full border-2 border-[#F0D9B8] bg-white/90 px-5 py-2 text-[13px] font-extrabold text-[#8A7566] shadow-sm">
          صفحه {toFaDigits(page + 1)} از {toFaDigits(total)}
        </div>
        <button
          type="button"
          onClick={flipNext}
          disabled={atEnd}
          aria-label="صفحه بعد"
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#F0D9B8] bg-white/90 text-xl text-[#D98A3D] shadow-sm transition hover:scale-105 hover:bg-white active:scale-95 disabled:pointer-events-none disabled:opacity-35"
        >
          ❮
        </button>
      </div>

      <p className="relative z-10 text-center text-[11.5px] font-bold text-[#A08A77]">
        برای ورق زدن، گوشه‌ی صفحه رو بگیر یا از دکمه‌ها استفاده کن 🌸
      </p>
    </main>
  );
}