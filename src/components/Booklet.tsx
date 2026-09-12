"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  buildBookPages,
  LAST_SPREAD_INDEX,
  SPACER_INDEX,
  type BookPageMeta,
} from "./bookPages";
import { toFaDigits } from "@/lib/fa";
import { Cloud, Heart, Sparkle } from "./decor";
import GuidedTour, { TOUR_STORAGE_KEY } from "./GuidedTour";
import type { BookletData } from "@/data/types";

/**
 * The part of react-pageflip's ref handle this component uses (the package
 * ships no types). See bookPages.tsx for why the two flips are swapped over.
 */
interface FlipBookHandle {
  pageFlip: () => {
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
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

/** Narrows a page descriptor to a numbered page (it has a printed number). */
function isNumbered(
  page: BookPageMeta | undefined
): page is BookPageMeta & { pageNumber: number } {
  return page?.kind === "numbered" && typeof page.pageNumber === "number";
}

export default function Booklet({ content }: { content: BookletData }) {
  const bookRef = useRef<FlipBookHandle | null>(null);
  // Children are memoized so react-pageflip doesn't re-clone pages on every render.
  const { nodes: pages, meta } = useMemo(() => buildBookPages(content), [content]);
  // The book opens on whichever page is last in the array = the front cover.
  const [page, setPage] = useState(() => meta.length - 1);
  const [spreadSize, setSpreadSize] = useState(1);
  const [tourOpen, setTourOpen] = useState(false);

  /** The front cover sits at the END of the array — see bookPages.tsx. */
  const coverIndex = meta.length - 1;
  /** How many numbered pages (۱..۱۷) the booklet has. */
  const contentPages = meta.filter((m) => m.kind === "numbered").length;

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

  // The pages are handed to the engine in reverse, so the engine's two flips
  // are swapped for us: turning FORWARD in this Persian book is the engine's
  // "previous", which is what turns the LEFT page over to the right.
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);

  // The closed cover is the start of the book and the back-cover spread its end.
  const atStart = page >= coverIndex;
  const atEnd = page <= LAST_SPREAD_INDEX;

  // Keyboard navigation (RTL book: forward is to the left). Gated at the two
  // ends exactly like the buttons, so the arrows cannot walk onto the spacer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && !atEnd) flipNext();
      if (e.key === "ArrowRight" && !atStart) flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipNext, flipPrev, atStart, atEnd]);

  // The landing spread is drawn a frame after onFlip fires, so the spread is
  // measured on the next frames (and again on resize, which can switch the
  // book between portrait and landscape).
  const measureSpread = useCallback(() => {
    requestAnimationFrame(() => setSpreadSize(countVisiblePages()));
  }, []);

  const onFlip = useCallback(
    (e: { data: number }) => {
      // A drag can overshoot the back cover onto the spacer page. That page only
      // exists to keep the page count even (see bookPages.tsx), so bounce back
      // to the back cover — note this is the ENGINE's flipNext, i.e. our prev.
      if (e.data <= SPACER_INDEX) {
        window.setTimeout(() => bookRef.current?.pageFlip()?.flipNext(), 60);
        return;
      }
      setPage(e.data);
      measureSpread();
    },
    [measureSpread]
  );

  const onInit = useCallback(() => measureSpread(), [measureSpread]);

  useEffect(() => {
    const onResize = () => measureSpread();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureSpread]);

  /**
   * Where we are, printed with the SAME numbers the pages themselves show.
   *
   * In a Persian spread the reader takes the RIGHT page first, so a two-page
   * spread is named in ascending order («صفحه‌های ۱ و ۲ از ۱۷») — the order you
   * read it in. Covers carry no number, so they are named instead.
   */
  const left = meta[page];
  const right = spreadSize > 1 ? meta[page + 1] : undefined;
  const visibleNumbers = [left, right]
    .filter(isNumbered)
    .map((m) => m.pageNumber)
    .sort((a, b) => a - b);
  const named = [left, right].find((m) => m && m.kind !== "numbered");

  let positionLabel: string;
  if (visibleNumbers.length === 2)
    positionLabel = `صفحه‌های ${toFaDigits(visibleNumbers[0])} و ${toFaDigits(
      visibleNumbers[1]
    )} از ${toFaDigits(contentPages)}`;
  else if (visibleNumbers.length === 1)
    positionLabel = `صفحه ${toFaDigits(visibleNumbers[0])} از ${toFaDigits(contentPages)}`;
  else positionLabel = named?.kind === "front-cover" ? "جلد کتاب" : "پشت جلد";

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
          startPage={coverIndex}
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
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#F0D9B8] bg-white/90 text-xl text-[#D98A3D] shadow-sm transition hover:scale-105 hover:bg-white active:scale-95 disabled:pointer-events-none disabled:opacity-35 rotate-180 pt-1"
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
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#F0D9B8] bg-white/90 text-xl text-[#D98A3D] shadow-sm transition hover:scale-105 hover:bg-white active:scale-95 disabled:pointer-events-none disabled:opacity-35 rotate-180 pt-1"
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

      {tourOpen && <GuidedTour childInfo={content.childInfo} onClose={closeTour} />}
    </main>
  );
}