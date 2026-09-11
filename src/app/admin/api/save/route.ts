// /admin/api/save — writes one child's booklet into booklets/<slug>.json.
//
// The /admin editor POSTs the full BookletData here instead of making the user
// download a file: this route persists it into the project's own folder. The
// build (`npm run content`, also before dev/build) then regenerates
// content-map.ts from these JSON files. On Vercel the filesystem is read-only,
// so this is meant for the local dev / next start workflow (edit, save, commit,
// push); the editor reports a clear error when the write fails.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { NextResponse } from "next/server";
import type { BookletData } from "@/data/types";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

/** Minimal shape check mirroring scripts/build-booklet.mjs's file-level checks. */
function looksLikeBookletData(body: unknown): body is BookletData {
  const b = body as BookletData;
  if (!b || typeof b !== "object") return false;
  if (!isNonEmptyString(b.bookletTitle)) return false;
  const ci = b.childInfo;
  if (!ci || typeof ci !== "object") return false;
  for (const k of ["name", "birthDate", "screeningDate", "age", "nextScreeningAt"] as const) {
    if (!isNonEmptyString(ci[k])) return false;
  }
  if (!Array.isArray(b.statuses) || b.statuses.length !== 3) return false;
  if (!Array.isArray(b.results) || b.results.length !== 5) return false;
  if (!isNonEmptyString(b.tenMonthsIntro)) return false;
  if (!Array.isArray(b.domainSkills) || b.domainSkills.length !== 5) return false;
  if (!isNonEmptyString(b.gamesIntro)) return false;
  if (!Array.isArray(b.domainGames) || b.domainGames.length !== 5) return false;
  if (!b.reminder || !isNonEmptyString(b.reminder.title)) return false;
  if (!b.nextStep || !isNonEmptyString(b.nextStep.title)) return false;
  return true;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { slug?: unknown; data?: unknown }
    | null;
  const slug = body?.slug;
  const data = body?.data;

  if (typeof slug !== "string" || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { ok: false, error: "slug معتبر نیست (فقط حروف کوچک انگلیسی، عدد و «-»)" },
      { status: 400 }
    );
  }
  if (!looksLikeBookletData(data)) {
    return NextResponse.json(
      { ok: false, error: "محتوای کتابچه معتبر نیست — لطفاً خطاهای اعتبارسنجی را برطرف کنید." },
      { status: 400 }
    );
  }

  const file = join(process.cwd(), "booklets", `${slug}.json`);
  try {
    mkdirSync(dirname(file), { recursive: true });
    const json = `${JSON.stringify(data, null, 2)}\n`;
    writeFileSync(file, json, "utf8");
  } catch (err) {
    console.error("save-booklet write failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "ذخیره در پوشه‌ی booklets/ ممکن نشد (دیسک فقط‌خواندنی است؟). در حالت deploy این طبیعی است؛ در اجرای محلی (npm run dev) باید کار کند.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    slug,
    file: `booklets/${slug}.json`,
  });
}