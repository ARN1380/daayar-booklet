"use client";

import { toFaDigits } from "@/lib/fa";

/**
 * Editable single-line list (skill bullets, game steps, reminder/next-step
 * paragraphs). Each item is a row with up/down/remove buttons and an "add"
 * button at the bottom.
 */
export default function ListEditor({
  items,
  onChange,
  addLabel,
  itemLabel,
  max,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  /** Persian label used for the "remove" title, e.g. «حذف مهارت». */
  itemLabel: string;
  /** Hard cap; the add button disappears at the limit. */
  max?: number;
}) {
  const update = (i: number, value: string) => {
    const next = items.map((it, j) => (j === i ? value : it));
    onChange(next);
  };

  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const canAdd = max === undefined || items.length < max;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="mt-2.5 w-6 shrink-0 text-center text-[11px] font-black text-[#A08A77]">
            {toFaDigits(i + 1)}
          </span>
          <textarea
            dir="rtl"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            rows={Math.min(2, Math.max(1, item.split("\n").length))}
            className="min-h-[36px] flex-1 resize-y rounded-xl border-2 border-[#F0D9B8] bg-white/90 px-3 py-2 text-[12.5px] font-bold leading-6 text-[#5B4A3F] outline-none transition placeholder:text-[#C9B7A5] focus:border-[#F5B56B]"
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              title="بالا"
              className="flex h-5 w-6 items-center justify-center rounded-md bg-[#FDF1E0] text-[10px] font-black text-[#D98A3D] transition hover:bg-[#FDE6C8] disabled:opacity-30"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              title="پایین"
              className="flex h-5 w-6 items-center justify-center rounded-md bg-[#FDF1E0] text-[10px] font-black text-[#D98A3D] transition hover:bg-[#FDE6C8] disabled:opacity-30"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              title={`حذف ${itemLabel}`}
              className="flex h-5 w-6 items-center justify-center rounded-md bg-[#FDECF3] text-[10px] font-black text-[#D16A97] transition hover:bg-[#FBD9E6]"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      {canAdd && (
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="mr-7 h-8 w-fit rounded-full border-2 border-dashed border-[#F0CCC0] bg-white/70 px-3.5 text-[11.5px] font-extrabold text-[#D98A3D] transition hover:bg-white"
        >
          ▸ {addLabel}
        </button>
      )}
    </div>
  );
}