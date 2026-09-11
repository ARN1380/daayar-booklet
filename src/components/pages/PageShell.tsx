import { forwardRef, type ReactNode } from "react";
import type { AccentKey, StatusKey } from "@/data/content";
import { toFaDigits } from "@/lib/fa";
import { Sparkle, Star, Heart } from "@/components/decor";
import PageCanvas from "@/components/PageCanvas";

// ---------- Accent palette (per skill domain) ----------

export interface AccentStyle {
  soft: string;
  strong: string;
  deep: string;
}

export const accentStyles: Record<AccentKey, AccentStyle> = {
  blue: { soft: "#EAF3FC", strong: "#7FB5E8", deep: "#4A7FB5" },
  mint: { soft: "#E4F7EF", strong: "#6ECCAF", deep: "#3E9B7E" },
  pink: { soft: "#FDECF3", strong: "#F4A3C2", deep: "#D16A97" },
  lavender: { soft: "#F0EDFC", strong: "#A99BE8", deep: "#7C6BD1" },
  peach: { soft: "#FDF1E0", strong: "#F5B56B", deep: "#D98A3D" },
};

// ---------- Status palette (screening results) ----------

export const statusStyles: Record<
  StatusKey,
  { label: string; shortLabel: string; soft: string; strong: string }
> = {
  onTrack: { label: "متناسب با سن", shortLabel: "متناسب با سن", soft: "#E5F6EC", strong: "#4CAF7D" },
  monitor: { label: "محدوده پایش", shortLabel: "محدوده پایش", soft: "#FDF3DC", strong: "#E5A93B" },
  evaluate: { label: "نیاز به ارزیابی بیشتر", shortLabel: "نیاز به ارزیابی", soft: "#FDEADD", strong: "#E87A4A" },
};

// ---------- Page shell ----------

interface PageShellProps {
  children: ReactNode;
  /** Accent used for corner decorations and the page-number pill. */
  accent?: AccentStyle;
  /** Show a page number in the footer. */
  pageNumber?: number;
  /** Hard cover pages (first/last) get data-density="hard". */
  hard?: boolean;
  /** Extra corner decorations, e.g. a specific illustration. */
  corner?: ReactNode;
}

/**
 * Shared paper page used by every booklet page.
 * Must forward a ref: react-pageflip measures the root element.
 */
const PageShell = forwardRef<HTMLDivElement, PageShellProps>(function PageShell(
  { children, accent = accentStyles.peach, pageNumber, hard, corner },
  ref
) {
  return (
    <div
      ref={ref}
      dir="rtl"
      lang="fa"
      data-density={hard ? "hard" : undefined}
      className="relative h-full w-full overflow-hidden rounded-[4px] bg-[#FFF9EF] select-none"
    >
      {/* Everything visual lives on the scaled canvas, so the layout is identical
          at every page size (see PageCanvas). The solid page colour stays on the
          root so the paper still fills the whole page. */}
      <PageCanvas>
        <div className="paper-dots pointer-events-none absolute inset-0" />

        {/* soft inner frame */}
        <div className="pointer-events-none absolute inset-[10px] rounded-[22px] border-2 border-dashed border-[#F0D9B8]/80" />

        {/* corner decorations */}
        <div className="pointer-events-none absolute right-4 top-3 text-right">
          <Sparkle className="h-4 w-4 text-[#F5B56B]/70" />
        </div>
        <div className="pointer-events-none absolute left-4 top-3">
          <Star className="h-5 w-5 text-[#A99BE8]/60" />
        </div>
        <div className="pointer-events-none absolute bottom-8 left-5">
          <Heart className="h-4 w-4 text-[#F4A3C2]/60" />
        </div>
        {corner}

        {/* content */}
        <div className="relative z-10 flex h-full flex-col px-7 pb-10 pt-6">{children}</div>

        {/* page number footer */}
        {pageNumber !== undefined && (
          <div className="absolute inset-x-0 bottom-2.5 z-10 flex items-center justify-center gap-1.5">
            <span
              data-page-label={pageNumber}
              className="rounded-full px-3 py-0.5 text-[10px] font-bold leading-5"
              style={{ backgroundColor: accent.soft, color: accent.deep }}
            >
              {toFaDigits(pageNumber)}
            </span>
          </div>
        )}
      </PageCanvas>
    </div>
  );
});

export default PageShell;

// ---------- Small shared pieces ----------

/** Page header band with emoji + title, colored by accent. */
export function PageHeader({
  emoji,
  title,
  accent,
  subtitle,
}: {
  emoji: string;
  title: string;
  accent: AccentStyle;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <div
        className="inline-flex items-center gap-2 rounded-2xl px-4 py-1.5"
        style={{ backgroundColor: accent.soft }}
      >
        <span className="text-xl leading-none">{emoji}</span>
        <h2 className="text-[17px] font-extrabold leading-6" style={{ color: accent.deep }}>
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="mt-2 text-[11.5px] font-medium leading-6 text-[#8A7566]">{subtitle}</p>
      )}
    </div>
  );
}

/** Colored status chip for the results table. */
export function StatusChip({ status }: { status: StatusKey }) {
  const s = statusStyles[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
      style={{ backgroundColor: s.soft, color: s.strong }}
    >
      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.strong }} />
      {s.shortLabel}
    </span>
  );
}