"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { buildBookPages } from "./bookPages";
import { toFaDigits } from "@/lib/fa";
import { Cloud, Heart, Sparkle } from "./decor";
import GuidedTour, { TOUR_STORAGE_KEY } from "./GuidedTour";

/** Minimal handle exposed by react-pageflip's ref (no bundled types). */
interface FlipBookHandle {
  pageFlip: () => {
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
    getPageCount: () => number;
    getCurrentPageIndex: () => number;
  } | null;
}

/**
 * How many pages are on screen right now: 2 in a landscape spread, 1 in
 * portrait (a phone) and 1 for the covers. react-pageflip exposes no
 * orientation getter, so the drawn pages themselves are the source of truth.
 */
function countVisiblePages(): number {
  if (typeof document === "undefined") return 1;
  return [...document.querySelectorAll(".stf__item")].filter(
    (el) => el.getBoundingClientRect().width > 0
  ).length;
}

export default function Booklet() {
  const bookRef = useRef<FlipBookHandle | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [spreadSize, setSpreadSize] = useState(1);
  const [tourOpen, setTourOpen] = useState(false);

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

  // First visit: open the guided tour once, after the book has laid itself out.
  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = window.localStorage.getItem(TOUR_STORAGE_KEY);
    } catch {
      // Private mode / storage disabled: just show the tour.
    }
    if (seen) return;
    const timer = window.setTimeout(() => setTourOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const closeTour = useCallback(() => {
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, "1");
    } catch {
      // Ignore: the tour simply shows again next time.
    }
    setTourOpen(false);
  }, []);

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

  // The landing spread is drawn a frame after onFlip fires, so the spread is
  // measured on the next frames (and again on resize, which can switch the
  // book between portrait and landscape).
  const measureSpread = useCallback(() => {
    requestAnimationFrame(() => setSpreadSize(countVisiblePages()));
  }, []);

  const onFlip = useCallback(
    (e: { data: number }) => {
      setPage(e.data);
      measureSpread();
    },
    [measureSpread]
  );

  const onInit = useCallback(() => {
    readTotal();
    measureSpread();
  }, [readTotal, measureSpread]);

  useEffect(() => {
    const onResize = () => measureSpread();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureSpread]);

  const atStart = page <= 0;
  const atEnd = total > 0 && page >= total - 1;

  /**
   * Where we are, printed with the SAME numbers the pages themselves show.
   * The cover and back cover are not numbered, so they get named instead, and
   * a landscape spread names both of the pages you can see at once.
   */
  const contentPages = Math.max(total - 2, 0);
  let positionLabel: string;
  if (page === 0) positionLabel = "جلد کتاب";
  else if (total > 0 && page >= total - 1) positionLabel = "پشت جلد";
  else if (spreadSize > 1 && page + 1 <= contentPages)
    positionLabel = `صفحه‌های ${toFaDigits(page)} و ${toFaDigits(page + 1)} از ${toFaDigits(
      contentPages
    )}`;
  else positionLabel = `صفحه ${toFaDigits(page)} از ${toFaDigits(contentPages)}`;

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

      <div className="book-stage relative z-10" data-tour="book">
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

      {/*
        Page-turn controls. The row is RTL (the whole document is), so the FIRST
        button below sits on the RIGHT and the LAST one on the LEFT. In a Persian
        book forward is to the left, so: right button = previous (arrow pointing
        right, the way you turn back), left button = next (arrow pointing left).
        Do not rotate the glyphs — they already point the way the book turns.
      */}
      <div className="relative z-10 flex items-center gap-3" data-tour="controls">
        <button
          type="button"
          onClick={flipPrev}
          disabled={atStart}
          aria-label="صفحه قبل"
          title="صفحه قبل"
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#F0D9B8] bg-white/90 text-xl text-[#D98A3D] shadow-sm transition hover:scale-105 hover:bg-white active:scale-95 disabled:pointer-events-none disabled:opacity-35"
        >
          ❯
        </button>
        <div
          data-tour="indicator"
          className="rounded-full border-2 border-[#F0D9B8] bg-white/90 px-5 py-2 text-[13px] font-extrabold text-[#8A7566] shadow-sm"
        >
          {positionLabel}
        </div>
        <button
          type="button"
          onClick={flipNext}
          disabled={atEnd}
          aria-label="صفحه بعد"
          title="صفحه بعد"
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#F0D9B8] bg-white/90 text-xl text-[#D98A3D] shadow-sm transition hover:scale-105 hover:bg-white active:scale-95 disabled:pointer-events-none disabled:opacity-35"
        >
          ❮
        </button>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5">
        <p className="text-center text-[11.5px] font-bold text-[#A08A77]">
          برای ورق زدن، گوشه‌ی صفحه رو بگیر یا از دکمه‌ها استفاده کن 🌸
        </p>
        <button
          type="button"
          onClick={() => setTourOpen(true)}
          className="rounded-full border-2 border-[#F0D9B8] bg-white/90 px-3.5 py-1 text-[11px] font-extrabold text-[#D98A3D] shadow-sm transition hover:scale-105 hover:bg-white active:scale-95"
        >
          ❓ راهنما
        </button>
      </div>

      {tourOpen && <GuidedTour onClose={closeTour} />}
    </main>
  );
}