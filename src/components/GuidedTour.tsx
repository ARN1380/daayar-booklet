"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toFaDigits } from "@/lib/fa";
import { childInfo } from "@/data/content";

/** localStorage flag: set once the tour has been finished or skipped. */
export const TOUR_STORAGE_KEY = "arman-booklet-tour-v1";

interface TourStep {
  emoji: string;
  title: string;
  body: string;
  /** CSS selector of the element to spotlight. Omit for a centered card. */
  target?: string;
  /** Preferred side for the card. Defaults to below the spotlight. */
  placement?: "top" | "bottom" | "center";
}

/**
 * The tour script (Persian). `target` matches the `data-tour="…"` attributes
 * that Booklet.tsx puts on the book, the controls and the page indicator.
 */
const steps: TourStep[] = [
  {
    emoji: "🌸",
    title: `به کتابچه‌ی ${childInfo.name} خوش آمدید!`,
    body:
      "چند نکته‌ی کوچک رو با هم ببینیم تا راحت‌تر توی کتابچه بگردید. کمتر از نیم دقیقه طول می‌کشه 💛",
    placement: "center",
  },
  {
    emoji: "📖",
    title: "ورق زدن کتابچه",
    body:
      "گوشه‌ی صفحه رو با ماوس یا انگشت بگیر و بکش تا صفحه ورق بخوره. روی موبایل هم کشیدن انگشت کافیه.",
    target: '[data-tour="book"]',
    placement: "bottom",
  },
  {
    emoji: "🔄",
    title: "دکمه‌های ورق زدن",
    body:
      "دکمه‌ی سمت راست (❯) یک صفحه عقب و دکمه‌ی سمت چپ (❮) یک صفحه جلو می‌بره. کلیدهای ← و → روی کیبورد هم کار می‌کنن.",
    target: '[data-tour="controls"]',
    placement: "top",
  },
  {
    emoji: "🔢",
    title: "کجای کتابیم؟",
    body:
      "این حباب می‌گه کجای کتاب هستی؛ همون شماره‌ای که پایین صفحه‌ها نوشته شده. روی موبایل یک صفحه و روی صفحه‌های بزرگ‌تر دو صفحه‌ی کنار هم رو نشون می‌ده.",
    target: '[data-tour="indicator"]',
    placement: "top",
  },
  {
    emoji: "🌱",
    title: "حالا نوبت توئه!",
    body:
      "هر وقت خواستی این راهنما رو دوباره ببینی، روی «راهنما» پایین صفحه بزن. سفر خوبی توی کتابچه داشته باشی 🌸",
    placement: "center",
  },
];

// ---------- layout helpers (client-only) ----------

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Gap between the spotlight edge and the card. */
const CARD_GAP = 16;
/** How far the dimmed backdrop is pulled back around the target. */
const SPOT_PAD = 10;
/** Minimum distance kept from the viewport edges. */
const EDGE = 14;
const CARD_MAX_WIDTH = 360;
/** Rough card height used until the real one has been measured. */
const CARD_HEIGHT_FALLBACK = 210;

const DIM = "rgba(60, 42, 32, 0.62)";

/**
 * Picks where the instructional card goes. Preference order: the requested
 * placement, then below the spotlight, then above it, and if the spotlight is
 * taller than the viewport (the book is) the card floats near the bottom.
 */
function computeLayout(step: TourStep, rect: Rect | null, cardHeight: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(CARD_MAX_WIDTH, vw - EDGE * 2);

  if (!rect || step.placement === "center") {
    return {
      width,
      left: Math.round((vw - width) / 2),
      top: Math.round(Math.max(EDGE, (vh - cardHeight) / 2)),
    };
  }

  const belowTop = rect.y + rect.height + SPOT_PAD + CARD_GAP;
  const aboveTop = rect.y - CARD_GAP - SPOT_PAD - cardHeight;
  const fitsBelow = belowTop + cardHeight <= vh - EDGE;
  const fitsAbove = aboveTop >= EDGE;

  let top: number;
  if (step.placement === "top" && fitsAbove) top = aboveTop;
  else if (fitsBelow) top = belowTop;
  else if (fitsAbove) top = aboveTop;
  else top = vh - cardHeight - 24;

  const left = Math.min(
    Math.max(rect.x + rect.width / 2 - width / 2, EDGE),
    Math.max(EDGE, vw - width - EDGE)
  );
  const maxTop = Math.max(EDGE, vh - cardHeight - EDGE);

  return { width, left: Math.round(left), top: Math.round(Math.min(Math.max(top, EDGE), maxTop)) };
}

// ---------- component ----------

interface GuidedTourProps {
  /** Called when the user finishes, skips or closes the tour. */
  onClose: () => void;
}

/**
 * Spotlight tour over the booklet: a dimmed backdrop with a cut-out around the
 * highlighted element plus a small card of instructions. Positioning is done
 * with fixed coordinates measured from the target, so it survives the flip
 * book resizing itself.
 *
 * Mount it only while the tour is open — mounting restarts it from step 1,
 * which is why there is no "reset" effect here.
 */
export default function GuidedTour({ onClose }: GuidedTourProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT_FALLBACK);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const step = steps[Math.min(index, steps.length - 1)];
  const isLast = index === steps.length - 1;
  const targetSelector = step.target;

  // Track the highlighted element's box. The book sizes itself with `autoSize`,
  // so measuring once is not enough: a ResizeObserver catches that, the extra
  // frames catch webfont/layout settling, and the listeners catch viewport
  // changes (including the mobile URL bar via visualViewport).
  useLayoutEffect(() => {
    const measure = () => {
      const el = targetSelector ? document.querySelector(targetSelector) : null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect((prev) =>
        prev &&
        Math.abs(prev.x - r.left) < 1 &&
        Math.abs(prev.y - r.top) < 1 &&
        Math.abs(prev.width - r.width) < 1 &&
        Math.abs(prev.height - r.height) < 1
          ? prev
          : { x: r.left, y: r.top, width: r.width, height: r.height }
      );
    };

    const observer = new ResizeObserver(measure);
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    if (target) observer.observe(target);

    const raf = requestAnimationFrame(measure);
    const timer = window.setTimeout(measure, 300);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [targetSelector]);

  // Measure the card so the placement maths uses its real height.
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setCardHeight((prev) => (Math.abs(prev - h) > 1 ? h : prev));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= steps.length - 1 ? i : i + 1));
  }, []);

  const goBack = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const next = useCallback(() => {
    if (isLast) onClose();
    else goNext();
  }, [goNext, isLast, onClose]);

  // Keyboard: Escape closes; the arrow keys walk the tour. The capture phase
  // plus stopPropagation keeps Booklet's own arrow-key page flipping quiet
  // while the tour is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "ArrowLeft") next();
        else goBack();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [next, goBack, onClose]);

  const layout = computeLayout(step, rect, cardHeight);

  return (
    <div
      dir="rtl"
      lang="fa"
      role="dialog"
      aria-modal="true"
      aria-label="راهنمای استفاده از کتابچه"
      className="fixed inset-0 z-[60]"
    >
      {/* dimmed backdrop with a cut-out around the highlighted element */}
      {rect ? (
        <div
          className="pointer-events-none fixed z-[61] transition-all duration-300 ease-out"
          style={{
            left: rect.x - SPOT_PAD,
            top: rect.y - SPOT_PAD,
            width: rect.width + SPOT_PAD * 2,
            height: rect.height + SPOT_PAD * 2,
            borderRadius: 24,
            boxShadow: `0 0 0 9999px ${DIM}`,
            border: "3px solid rgba(255, 255, 255, 0.85)",
          }}
        />
      ) : (
        <div className="fixed inset-0 z-[61]" style={{ backgroundColor: DIM }} />
      )}

      {/* swallows clicks so the page underneath cannot be used mid-tour */}
      <div className="fixed inset-0 z-[62]" />

      {/* instructional card */}
      <div
        ref={cardRef}
        className="fixed z-[70] rounded-3xl border-2 border-[#F0D9B8] bg-[#FFFBF4] p-5 shadow-[0_18px_40px_-12px_rgba(60,42,32,0.5)]"
        style={{ left: layout.left, top: layout.top, width: layout.width }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن راهنما"
          className="absolute left-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[13px] font-black text-[#C0A88F] shadow-sm transition hover:scale-105 hover:text-[#D98A3D] active:scale-95"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 pl-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FDECF3] text-2xl leading-none">
            {step.emoji}
          </span>
          <h2 className="text-[15px] font-black leading-6 text-[#2F7B62]">{step.title}</h2>
        </div>

        <p className="mt-3 text-[12.5px] font-medium leading-[2] text-[#6B5A4C]">{step.body}</p>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === index ? 20 : 6,
                backgroundColor: i === index ? "#F5B56B" : "#F0D9B8",
              }}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[#A08A77]">
            {toFaDigits(index + 1)} از {toFaDigits(steps.length)}
          </span>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border-2 border-[#F0D9B8] bg-white px-4 py-1.5 text-[12px] font-extrabold text-[#8A7566] shadow-sm transition hover:scale-105 hover:bg-[#FFFBF4] active:scale-95"
              >
                قبلی
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-[#F5B56B] px-5 py-1.5 text-[12px] font-black text-white shadow-[0_3px_0_#D98A3D] transition hover:scale-105 active:scale-95"
            >
              {isLast ? "بزن بریم!" : "بعدی"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
