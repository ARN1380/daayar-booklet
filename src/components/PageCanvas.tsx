"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The logical page size every booklet page is designed against. react-pageflip
 * is configured with the same 550x733 base (see Booklet.tsx).
 */
export const PAGE_WIDTH = 550;
export const PAGE_HEIGHT = 733;

/**
 * Puts the page content on a fixed 550x733 canvas that is scaled to fit
 * whatever box react-pageflip gives the page.
 *
 * Why: pages are laid out with fixed px sizes (Tailwind), so without this a
 * small page box (a phone, ~366x488) shows the content at its full design size
 * and it runs off the bottom, while a large one (a desktop spread, ~620x826)
 * only gets extra empty space. Scaling keeps the page looking exactly as
 * designed at any size — bigger on desktop, smaller on phones. Every page was
 * measured to fit 550x733 with 0px overflow, so nothing gets clipped.
 *
 * The transform is written imperatively from the ResizeObserver callback: the
 * observer fires before paint (no unscaled flash) and no state or re-render is
 * needed. This is safe because react-pageflip only rewrites the *page root's*
 * inline style — see the note in globals.css; child elements keep theirs.
 */
export default function PageCanvas({ children }: { children: ReactNode }) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;

    // Pages that are not part of the current spread have no size yet; the
    // observer fires again once react-pageflip lays them out.
    const fit = () => {
      const { clientWidth, clientHeight } = box;
      if (!clientWidth || !clientHeight) return;
      const scale = Math.min(clientWidth / PAGE_WIDTH, clientHeight / PAGE_HEIGHT);
      canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };

    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="relative h-full w-full overflow-hidden">
      <div
        ref={canvasRef}
        className="absolute left-1/2 top-1/2"
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          transform: "translate(-50%, -50%) scale(1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
