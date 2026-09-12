"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ListEditor from "./ListEditor";
import Preview from "./Preview";
import { editorFromContent, emptyEditorData, emptyTitles, toContentShape, type EditorData, type DomainIdentity, type EditableStatus } from "./bookletData";
import { validateBooklet } from "./validateBooklet";
import type { BookletData, BookletTitles, ChildInfo, Game, StatusKey } from "@/data/types";
import { toFaDigits } from "@/lib/fa";

/**
 * The in-browser booklet editor for ONE child, served only under /admin.
 *
 * It is an authoring tool, not a CMS: the deployed site is static, so the only
 * persistence is POSTing the edited booklet to /admin/api/save, which writes it
 * into the project's own booklets/<slug>.json file. From there `npm run
 * content` (automatic before dev/build) regenerates the app data and the next
 * git push deploys it. No file download needed.
 */

interface BookletEditorProps {
  /** URL slug — also the file name saved as booklets/<slug>.json. */
  slug: string;
  /** The booklet being edited (the current content for this slug). */
  content: BookletData | null;
}

// ---------- draft autosave in localStorage ----------
//
// Every keypress is persisted locally (per slug) so a page refresh does not
// wipe the form (only the browser and this slug, not the server). The saved
// draft takes priority over `content` when the editor opens, so half-finished
// edits survive a reload; the «پاک کردن پیش‌نویس» button below discards it.

const DRAFT_PREFIX = "arman-booklet-draft";

function draftKey(slug: string): string {
  return `${DRAFT_PREFIX}:${slug || "new"}`;
}

function saveDraft(slug: string, data: EditorData, newSlug: string): void {
  try {
    localStorage.setItem(
      draftKey(slug),
      JSON.stringify({ v: 1, data, newSlug, at: Date.now() })
    );
  } catch {
    // storage unavailable (private mode) — editing still works, just no autosave
  }
}

function loadDraft(slug: string): { data: EditorData; newSlug: string } | null {
  try {
    const raw = localStorage.getItem(draftKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v?: number; data?: EditorData; newSlug?: unknown };
    if (!parsed || parsed.v !== 1 || !parsed.data) return null;
    return {
      // Old drafts (pre-titles) lack the titles object — normalize it so the
      // editor never reads undefined keys.
      data: { ...parsed.data, titles: emptyTitles(parsed.data.titles) },
      newSlug: typeof parsed.newSlug === "string" ? parsed.newSlug : "",
    };
  } catch {
    return null;
  }
}

function clearDraft(slug: string): void {
  try {
    localStorage.removeItem(draftKey(slug));
  } catch {
    // ignore
  }
}

// ---------- small presentational pieces ----------

function Section({
  title,
  emoji,
  titleValue,
  titlePlaceholder,
  onTitleChange,
  children,
  defaultOpen,
}: {
  title?: string;
  emoji?: string;
  titleValue?: string;
  titlePlaceholder?: string;
  onTitleChange?: (v: string) => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const editableTitle = !!onTitleChange;
  return (
    <details
      open={defaultOpen}
      className="group rounded-3xl border-2 border-[#F0D9B8] bg-white/80 shadow-sm"
    >
      <summary className="flex cursor-pointer select-none items-center gap-2 rounded-3xl bg-[#FFF6E9] px-5 py-3.5 text-[15px] font-black text-[#5B4A3F] transition hover:bg-[#FDF1E0]">
        {editableTitle ? (
          <>
            {emoji && <span className="shrink-0">{emoji}</span>}
            <input
              dir="rtl"
              value={titleValue ?? ""}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={titlePlaceholder}
              className="w-full min-w-0 flex-1 bg-transparent px-0 text-[15px] font-black text-[#5B4A3F] outline-none placeholder:text-[#C9A76E]"
              onClick={(e) => e.stopPropagation()}
            />
          </>
        ) : (
          <span className="min-w-0 flex-1">{title ?? emoji}</span>
        )}
        <span className="shrink-0 text-[11px] font-bold text-[#C9A76E]">▾</span>
      </summary>
      <div className="flex flex-col gap-4 px-5 py-4">{children}</div>
    </details>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-extrabold text-[#8A7566]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "rounded-xl border-2 border-[#F0D9B8] bg-white px-3.5 py-2 text-[13px] font-bold text-[#5B4A3F] outline-none transition placeholder:text-[#C9B7A5] focus:border-[#F5B56B]";
const areaClass =
  "min-h-[64px] resize-y rounded-xl border-2 border-[#F0D9B8] bg-white px-3.5 py-2 text-[13px] font-bold leading-6 text-[#5B4A3F] outline-none transition placeholder:text-[#C9B7A5] focus:border-[#F5B56B]";

function DomainBadge({ domain }: { domain: DomainIdentity }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF1E0] px-3 py-1 text-[12px] font-extrabold text-[#8A5A3B]">
      <span>{domain.emoji}</span>
      {domain.name}
    </span>
  );
}

// ---------- the editor page ----------

export default function BookletEditor({ slug, content }: BookletEditorProps) {
  const [data, setData] = useState<EditorData>(() => {
    const draft = loadDraft(slug);
    if (draft) return draft.data;
    return content ? editorFromContent(content) : emptyEditorData();
  });
  const [newSlug, setNewSlug] = useState<string>(() => {
    const draft = loadDraft(slug);
    return draft ? draft.newSlug : "";
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showText, setShowText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const validation = useMemo(() => validateBooklet(data), [data]);
  // The booklet in its exact API shape — what the pages render and what gets
  // POSTed to /admin/api/save.
  const bookletData = useMemo(() => toContentShape(data), [data]);
  const exportedText = useMemo(() => JSON.stringify(bookletData, null, 2), [bookletData]);

  // Persist every change to localStorage (per-slug draft). Runs on the client
  // only, so the browser-only storage access is safe here.
  const draftKeySlug = slug || "new";
  useEffect(() => {
    saveDraft(draftKeySlug, data, newSlug);
  }, [draftKeySlug, data, newSlug]);

  // Discard the local draft and restore the last saved state (or a blank form).
  const resetDraft = () => {
    clearDraft(draftKeySlug);
    setData(content ? editorFromContent(content) : emptyEditorData());
    setNewSlug("");
    setSaveMsg(null);
  };

  const upd = (fn: (d: EditorData) => EditorData) => setData(fn);

  // scalar fields
  const setSimple = <K extends keyof EditorData>(key: K, value: EditorData[K]) =>
    upd((d) => ({ ...d, [key]: value }));

  const setTitle = (key: keyof BookletTitles, value: string) =>
    upd((d) => ({ ...d, titles: { ...d.titles, [key]: value } }));

  const setChild = (key: keyof ChildInfo, value: string) =>
    upd((d) => ({ ...d, childInfo: { ...d.childInfo, [key]: value } }));

  const setStatus = (i: number, patch: Partial<EditableStatus>) =>
    upd((d) => ({ ...d, statuses: d.statuses.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  const setDomain = (i: number, patch: Partial<DomainIdentity>) =>
    upd((d) => ({ ...d, domains: d.domains.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));

  const setResult = (i: number, status: StatusKey) =>
    upd((d) => ({ ...d, resultStatus: d.resultStatus.map((s, j) => (j === i ? status : s)) }));

  const setSkillIntro = (i: number, value: string) =>
    upd((d) => ({ ...d, skillIntros: d.skillIntros.map((v, j) => (j === i ? value : v)) }));

  const setSkillBullets = (i: number, bullets: string[]) =>
    upd((d) => ({ ...d, skillBullets: d.skillBullets.map((b, j) => (j === i ? bullets : b)) }));

  const setGameAt = (domainIdx: number, gameIdx: number, patch: Partial<Game>) =>
    upd((d) => ({
      ...d,
      games: d.games.map((gs, i) =>
        i === domainIdx ? gs.map((g, j) => (j === gameIdx ? { ...g, ...patch } : g)) : gs
      ),
    }));

  const setGameSteps = (domainIdx: number, gameIdx: number, steps: string[]) =>
    upd((d) => ({
      ...d,
      games: d.games.map((gs, i) =>
        i === domainIdx ? gs.map((g, j) => (j === gameIdx ? { ...g, steps } : g)) : gs
      ),
    }));

  const saveBooklet = async () => {
    if (!validation.ok) return;
    const fileSlug = slug || newSlug.trim();
    if (!fileSlug) {
      setSaveMsg({ kind: "err", text: "برای کتابچه‌ی جدید ابتدا slug را بنویسید." });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/admin/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: fileSlug, data: bookletData }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; file?: string } | null;
      if (res.ok && json?.ok) {
        clearDraft(draftKeySlug);
        setSaveMsg({
          kind: "ok",
          text: "✓ ذخیره شد در " + json.file + " — با اجرای npm run dev (یا push) کتابچه دوباره ساخته می‌شود.",
        });
      } else {
        setSaveMsg({ kind: "err", text: json?.error ?? "ذخیره ناموفق بود." });
      }
    } catch {
      setSaveMsg({ kind: "err", text: "ارتباط با سرور برقرار نشد؛ ذخیره ناموفق بود." });
    } finally {
      setSaving(false);
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(exportedText);
      setCopied(true);
    } catch {
      const el = textRef.current;
      if (el) {
        el.focus();
        el.select();
        document.execCommand("copy");
        setCopied(true);
      }
    }
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#FFF9EF]">
      {/* soft background blobs */}
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#FDECF3] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-56 h-80 w-80 rounded-full bg-[#E4F7EF] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#F0EDFC] blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
        {/* header */}
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-black text-[#2F7B62]">
              ✏️ {content ? "ویرایش متن کتابچه" : "ساخت کتابچه‌ی جدید"}
            </h1>
            <p className="mt-1 text-[12px] font-bold leading-6 text-[#A08A77]">
              این صفحه در <span className="text-[#D98A3D]">/admin</span> قرار دارد و برای مخاطب
              معمولی کتابچه دیده نمی‌شود.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border-2 border-[#F0D9B8] bg-white px-4 py-2 text-[12px] font-extrabold text-[#D98A3D] shadow-sm transition hover:bg-white"
          >
            → بازگشت به مدیریت
          </Link>
        </header>

        {/* slug field — only for brand new booklets */}
        {!slug && (
          <div className="mb-5 rounded-2xl border-2 border-[#D9F2E7] bg-[#E4F7EF] px-4 py-3">
            <label className="mb-1 block text-[12px] font-extrabold text-[#3E6B5A]">
              نام انگلیسی کودک (slug — آدرس کتابچه در سایت)
            </label>
            <p className="mb-2 text-[11px] font-bold leading-5 text-[#6E9A88]">
              فقط حروف کوچک انگلیسی، عدد و «-» مجاز است. مثلاً:{" "}
              <code className="rounded bg-white/80 px-1.5 py-0.5">sara-ahmadi</code>
            </p>
            <input
              dir="ltr"
              value={newSlug}
              onChange={(e) =>
                setNewSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "")
                    .replace(/-{2,}/g, "-")
                    .replace(/^-+|-+$/g, "")
                )
              }
              placeholder="sara-ahmadi"
              className="w-full rounded-xl border-2 border-[#A9D9C7] bg-white px-3.5 py-2 text-[13px] font-bold text-[#3E6B5A] outline-none transition placeholder:text-[#A9C5B8] focus:border-[#6ECCAF]"
            />
            {newSlug.trim() && (
              <p className="mt-2 text-[11px] font-bold text-[#3E6B5A]">
                فایل ذخیره‌شده:{" "}
                <code className="rounded bg-white/80 px-1.5 py-0.5" dir="ltr">
                  booklets/{newSlug.trim()}.json
                </code>
              </p>
            )}
          </div>
        )}

        {/* save-flow note */}
        <div className="mb-5 rounded-2xl border-2 border-[#F5D9B8] bg-[#FFF6E9] px-4 py-3 text-[12px] font-bold leading-6 text-[#8A7566]">
          <p>
            با دکمه‌ی «ذخیره در پروژه» همین متن، در همین پروژه، داخل فایل{" "}
            <code className="rounded bg-white/80 px-1.5 py-0.5">
              booklets/{slug || "…"}.json
            </code>{" "}
            ذخیره می‌شود. بعد اجرای «npm run dev» (یا push) کتابچه دوباره ساخته می‌شود 🌸
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[#6E9A88]">✍️ تغییرات شما به‌صورت خودکار در همین مرورگر ذخیره می‌شود (پیش‌نویس).</span>
            <button
              type="button"
              onClick={resetDraft}
              className="rounded-full border border-[#F0D9B8] bg-white px-3 py-1 text-[11px] font-extrabold text-[#B4552E] transition hover:bg-[#FDF1E7]"
              title="حذف پیش‌نویس و بازگشت به آخرین حالت ذخیره‌شده"
            >
              🗑 پاک کردن پیش‌نویس
            </button>
          </p>
        </div>

        {/* save result / error */}
        {saveMsg && (
          <div
            className={`mb-5 rounded-2xl border-2 px-4 py-3 text-[12px] font-bold leading-6 ${
              saveMsg.kind === "ok"
                ? "border-[#B9E6CF] bg-[#E9F9F0] text-[#2F7B62]"
                : "border-[#F5CDB1] bg-[#FDF1E7] text-[#B4552E]"
            }`}
          >
            {saveMsg.text}
          </div>
        )}

        {/* action bar */}
        <div className="sticky top-3 z-20 mb-5 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-[#F0D9B8] bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() => saveBooklet()}
            disabled={!validation.ok || saving}
            className="flex items-center gap-1.5 rounded-full bg-[#F5B56B] px-5 py-2.5 text-[13px] font-black text-white shadow-[0_3px_0_#D98A3D] transition hover:brightness-105 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {saving ? "…در حال ذخیره" : "💾 ذخیره در پروژه"}
          </button>
          <button
            type="button"
            onClick={() => setShowText((v) => !v)}
            className="rounded-full border-2 border-[#F0D9B8] bg-white px-4 py-2 text-[12px] font-extrabold text-[#D98A3D] transition hover:bg-[#FFF6E9]"
          >
            نمایش متن
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className={`rounded-full border-2 px-4 py-2 text-[12px] font-extrabold transition ${
              showPreview
                ? "border-[#6ECCAF] bg-[#E4F7EF] text-[#3E9B7E]"
                : "border-[#F0D9B8] bg-white text-[#D98A3D] hover:bg-[#FFF6E9]"
            }`}
          >
            {showPreview ? "بستن پیش‌نمایش" : "👁 پیش‌نمایش صفحات"}
          </button>
          <span
            className={`mr-auto rounded-full px-3 py-1.5 text-[11px] font-black ${
              validation.ok ? "bg-[#E5F6EC] text-[#4CAF7D]" : "bg-[#FDEADD] text-[#E87A4A]"
            }`}
          >
            {validation.ok ? "✓ آماده‌ی خروجی" : `${toFaDigits(validation.errors.length)} مورد نیاز به اصلاح`}
          </span>
        </div>

        {/* validation errors */}
        {!validation.ok && (
          <div className="mb-5 rounded-2xl border-2 border-[#FDEADD] bg-[#FDF1E7] px-4 py-3">
            <p className="mb-2 text-[13px] font-black text-[#B4552E]">⚠️ قبل از ذخیره این‌ها را اصلاح کنید:</p>
            <ul className="flex flex-col gap-1.5">
              {validation.errors.map((err, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] font-bold leading-6 text-[#8A5A3B]">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E87A4A]" />
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ---- the form ---- */}
        <div className="flex flex-col gap-4">
          <Section title="📄 عنوان کتابچه" defaultOpen>
            <Field label="عنوان (در برگه‌ی مرورگر نمایش داده می‌شود)">
              <input
                dir="rtl"
                value={data.bookletTitle}
                onChange={(e) => setSimple("bookletTitle", e.target.value)}
                className={inputClass}
              />
            </Field>
          </Section>

          <Section
            emoji="👶"
            titleValue={data.titles.childInfo}
            titlePlaceholder="مشخصات کودک"
            onTitleChange={(v) => setTitle("childInfo", v)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="نام و نام خانوادگی">
                <input dir="rtl" value={data.childInfo.name} onChange={(e) => setChild("name", e.target.value)} className={inputClass} />
              </Field>
              <Field label="تاریخ تولد">
                <input dir="rtl" value={data.childInfo.birthDate} onChange={(e) => setChild("birthDate", e.target.value)} className={inputClass} />
              </Field>
              <Field label="تاریخ انجام غربالگری">
                <input dir="rtl" value={data.childInfo.screeningDate} onChange={(e) => setChild("screeningDate", e.target.value)} className={inputClass} />
              </Field>
              <Field label="سن هنگام غربالگری">
                <input dir="rtl" value={data.childInfo.age} onChange={(e) => setChild("age", e.target.value)} className={inputClass} />
              </Field>
              <Field label="غربالگری بعدی">
                <input dir="rtl" value={data.childInfo.nextScreeningAt} onChange={(e) => setChild("nextScreeningAt", e.target.value)} className={inputClass} />
              </Field>
            </div>
          </Section>

          <Section title="🌈 حیطه‌های رشدی (اموجی و نام)">
            <p className="text-[11.5px] font-medium leading-6 text-[#A08A77]">
              این حیطه‌ها در سه بخش «نتیجه غربالگری»، «مهارت‌ها» و «بازی‌ها» مشترک‌اند؛ یک‌جا ویرایش
              می‌شوند تا هیچ‌وقت ناهماهنگ نشوند.
            </p>
            <div className="flex flex-col gap-3">
              {data.domains.map((dom, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-8 text-center text-[15px]">{toFaDigits(i + 1)}</span>
                  <input
                    dir="rtl"
                    value={dom.emoji}
                    onChange={(e) => setDomain(i, { emoji: e.target.value })}
                    placeholder="✨"
                    title="اموجی حیطه"
                    className={`${inputClass} w-16 text-center`}
                  />
                  <input
                    dir="rtl"
                    value={dom.name}
                    onChange={(e) => setDomain(i, { name: e.target.value })}
                    className={`${inputClass} flex-1`}
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section
            emoji="🌱"
            titleValue={data.titles.statuses}
            titlePlaceholder="وضعیت مهارت‌های رشدی"
            onTitleChange={(v) => setTitle("statuses", v)}
          >
            <div className="flex flex-col gap-3">
              {data.statuses.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border-2 border-[#F0D9B8] bg-[#FFF6E9] bg-opacity-50 px-3.5 py-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xl leading-none">{s.emoji}</span>
                    <span className="text-[11px] font-black text-[#A08A77]">اموجی ثابت است</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <Field label="عنوان وضعیت">
                      <input dir="rtl" value={s.title} onChange={(e) => setStatus(i, { title: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="توضیح">
                      <textarea dir="rtl" value={s.description} onChange={(e) => setStatus(i, { description: e.target.value })} className={areaClass} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            emoji="🧾"
            titleValue={data.titles.results}
            titlePlaceholder={`نتیجه غربالگری ${data.childInfo.name.trim() || "…"}`}
            onTitleChange={(v) => setTitle("results", v)}
          >
            <div className="flex flex-col gap-2.5">
              {data.domains.map((dom, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[#F0D9B8] bg-white px-3.5 py-2.5">
                  <DomainBadge domain={dom} />
                  <select
                    value={data.resultStatus[i]}
                    onChange={(e) => setResult(i, e.target.value as StatusKey)}
                    className={`${inputClass} w-auto cursor-pointer`}
                  >
                    {data.statuses.map((s, si) => (
                      <option key={si} value={["onTrack", "monitor", "evaluate"][si]}>
                        {s.emoji} {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </Section>

          <Section
            emoji="📖"
            titleValue={data.titles.tenMonths}
            titlePlaceholder={`در ${data.childInfo.age.trim() || "…"} چه مهارت‌هایی در حال شکل‌گیری هستند؟`}
            onTitleChange={(v) => setTitle("tenMonths", v)}
          >
            <Field label="مقدمه">
              <textarea dir="rtl" value={data.tenMonthsIntro} onChange={(e) => setSimple("tenMonthsIntro", e.target.value)} className={areaClass} />
            </Field>
            {data.domains.map((dom, i) => (
              <div key={i} className="rounded-2xl border-2 border-[#F0D9B8] bg-[#FFF6E9] bg-opacity-50 px-3.5 py-3">
                <div className="mb-2.5">
                  <DomainBadge domain={dom} />
                </div>
                <div className="flex flex-col gap-3">
                  <Field label="مقدمه‌ی حیطه">
                    <textarea dir="rtl" value={data.skillIntros[i]} onChange={(e) => setSkillIntro(i, e.target.value)} className={areaClass} />
                  </Field>
                  <Field label="مهارت‌ها">
                    <ListEditor
                      items={data.skillBullets[i]}
                      onChange={(items) => setSkillBullets(i, items)}
                      addLabel="افزودن مهارت"
                      itemLabel="مهارت"
                      max={6}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </Section>

          <Section
            emoji="🎯"
            titleValue={data.titles.games}
            titlePlaceholder="بازی‌ها و فعالیت‌های پیشنهادی"
            onTitleChange={(v) => setTitle("games", v)}
          >
            <Field label="مقدمه">
              <textarea dir="rtl" value={data.gamesIntro} onChange={(e) => setSimple("gamesIntro", e.target.value)} className={areaClass} />
            </Field>
            {data.domains.map((dom, i) => (
              <div key={i} className="rounded-2xl border-2 border-[#F0D9B8] bg-[#FFF6E9] bg-opacity-50 px-3.5 py-3">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <DomainBadge domain={dom} />
                  <span className="text-[11px] font-bold text-[#C9A76E]">
                    {toFaDigits(data.games[i].length)} بازی
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {data.games[i].map((game, gi) => (
                    <div key={gi} className="rounded-2xl bg-white px-3.5 py-3 shadow-sm">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[12px] font-black text-[#C9A76E]">بازی {toFaDigits(gi + 1)}</span>
                      </div>
                      <div className="mb-2.5 flex items-center gap-2">
                        <input
                          dir="rtl"
                          value={game.emoji}
                          onChange={(e) => setGameAt(i, gi, { emoji: e.target.value })}
                          placeholder="🎈"
                          title="اموجی بازی"
                          className={`${inputClass} w-16 text-center`}
                        />
                        <input
                          dir="rtl"
                          value={game.title}
                          onChange={(e) => setGameAt(i, gi, { title: e.target.value })}
                          placeholder="عنوان بازی"
                          className={`${inputClass} flex-1`}
                        />
                      </div>
                      <ListEditor
                        items={game.steps}
                        onChange={(steps) => setGameSteps(i, gi, steps)}
                        addLabel="افزودن قدم"
                        itemLabel="قدم"
                        max={5}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          <Section title="💛 یادآوری مهم">
            <Field label="عنوان">
              <input dir="rtl" value={data.reminderTitle} onChange={(e) => setSimple("reminderTitle", e.target.value)} className={inputClass} />
            </Field>
            <Field label="متن (هر پاراگراف یک سطر)">
              <ListEditor items={data.reminderLines} onChange={(items) => setSimple("reminderLines", items)} addLabel="افزودن پاراگراف" itemLabel="پاراگراف" />
            </Field>
          </Section>

          <Section title="📌 قدم بعدی">
            <Field label="عنوان">
              <input dir="rtl" value={data.nextStepTitle} onChange={(e) => setSimple("nextStepTitle", e.target.value)} className={inputClass} />
            </Field>
            <Field label="متن (هر پاراگراف یک سطر)">
              <ListEditor items={data.nextStepLines} onChange={(items) => setSimple("nextStepLines", items)} addLabel="افزودن پاراگراف" itemLabel="پاراگراف" />
            </Field>
          </Section>
        </div>

        {/* ---- raw text modal ---- */}
        {showText && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4A3A2E]/50 p-4 backdrop-blur-sm" dir="rtl">
            <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-[#F0D9B8] bg-[#FFF9EF] shadow-2xl">
              <div className="flex items-center justify-between border-b-2 border-[#F0D9B8] px-5 py-3">
                <h2 className="text-[15px] font-black text-[#5B4A3F]">📄 JSON کتابچه (برای مرور/کپی)</h2>
                <button
                  type="button"
                  onClick={() => setShowText(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDEADD] text-[13px] font-black text-[#B4552E] transition hover:bg-[#FBD9C4]"
                  title="بستن"
                >
                  ✕
                </button>
              </div>
              <textarea
                ref={textRef}
                readOnly
                dir="ltr"
                value={exportedText}
                onFocus={(e) => e.target.select()}
                className="max-h-[calc(85vh-120px)] w-full flex-1 resize-none overflow-auto whitespace-pre bg-white px-5 py-4 text-[11.5px] font-medium leading-6 text-[#5B4A3F] outline-none"
              />
              <div className="flex items-center justify-end gap-2.5 border-t-2 border-[#F0D9B8] px-5 py-3">
                <button
                  type="button"
                  onClick={copyText}
                  className={`rounded-full px-5 py-2 text-[12.5px] font-black transition ${
                    copied ? "bg-[#E5F6EC] text-[#4CAF7D]" : "bg-[#F5B56B] text-white shadow-[0_2px_0_#D98A3D] hover:brightness-105"
                  }`}
                >
                  {copied ? "✓ کپی شد!" : "کپی متن"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---- live preview ---- */}
      {showPreview && (
        <div className="relative z-10 border-t-2 border-[#F0D9B8] bg-[#FDF6EC]">
          <div className="mx-auto max-w-3xl px-4 py-8">
            <h2 className="mb-5 text-center text-[16px] font-black text-[#2F7B62]">
              👁 پیش‌نمایش زنده (همان صفحات واقعی کتابچه)
            </h2>
            <Preview data={data} />
          </div>
        </div>
      )}
    </main>
  );
}