// /admin/api/save — persists one child's booklet into booklets/<slug>.json.
//
// Two paths:
//  1. DEPLOYED (Vercel): the filesystem is read-only, so the route commits the
//     file to GitHub via the Contents API using GITHUB_TOKEN. Vercel sees the
//     push to `main` and auto-redeploys (its prebuild runs `npm run content`,
//     which regenerates the content map), so an ordinary admin only ever clicks
//     the editor's save button — nobody has to run anything.
//  2. LOCAL DEV: if GITHUB_TOKEN is not set, it falls back to writing the file
//     straight into the project's booklets/ folder (fs), the old behavior.
//
// Required env: GITHUB_TOKEN (fine-grained PAT with Contents Read & Write on the
// repo). Optional: GITHUB_REPO ("owner/repo"), GITHUB_BRANCH (default "main").

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { NextResponse } from "next/server";
import type { BookletData } from "@/data/types";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REPO = process.env.GITHUB_REPO || "ARN1380/daayar-booklet";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const API = "https://api.github.com";

function isString(v: unknown): v is string {
  return typeof v === "string";
}

/** Minimal shape check mirroring scripts/build-booklet.mjs's file-level checks. */
function looksLikeBookletData(body: unknown): body is BookletData {
  const b = body as BookletData;
  if (!b || typeof b !== "object") return false;
  if (!isString(b.bookletTitle)) return false;
  const ci = b.childInfo;
  if (!ci || typeof ci !== "object") return false;
  for (const k of ["name", "birthDate", "screeningDate", "age", "nextScreeningAt"] as const) {
    if (!isString(ci[k])) return false;
  }
  if (!Array.isArray(b.statuses) || b.statuses.length !== 3) return false;
  if (!Array.isArray(b.results) || b.results.length !== 5) return false;
  if (!isString(b.tenMonthsIntro)) return false;
  if (!Array.isArray(b.domainSkills) || b.domainSkills.length !== 5) return false;
  if (!isString(b.gamesIntro)) return false;
  if (!Array.isArray(b.domainGames) || b.domainGames.length !== 5) return false;
  if (!b.reminder || !isString(b.reminder.title)) return false;
  if (!b.nextStep || !isString(b.nextStep.title)) return false;
  return true;
}

/** Commit booklets/<slug>.json to the repo (create or update via the sha). */
async function commitToGithub(slug: string, json: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const path = `booklets/${slug}.json`;
  const authHeaders = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // GET the current file to learn its sha (needed to update instead of create).
  let sha: string | undefined;
  const getRes = await fetch(`${API}/repos/${REPO}/contents/${path}`, { headers: authHeaders });
  if (getRes.status === 200) {
    const meta = (await getRes.json()) as { sha?: string };
    sha = meta.sha;
  } else if (getRes.status !== 404) {
    throw new Error(`GitHub GET failed (${getRes.status}): ${await getRes.text()}`);
  }

  const putRes = await fetch(`${API}/repos/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `کتابچه ${slug}`,
      content: Buffer.from(json, "utf8").toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!putRes.ok) {
    throw new Error(`GitHub PUT failed (${putRes.status}): ${await putRes.text()}`);
  }
  return `booklets/${slug}.json`;
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

  const json = `${JSON.stringify(data, null, 2)}\n`;

  // Path 1: deployed — commit to GitHub so Vercel auto-redeploys.
  if (process.env.GITHUB_TOKEN) {
    try {
      const file = await commitToGithub(slug, json);
      if (!file) {
        return NextResponse.json(
          { ok: false, error: "GITHUB_TOKEN تنظیم شده اما commit انجام نشد." },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true, slug, file, mode: "github" });
    } catch (err) {
      console.error("save-booklet github commit failed:", err);
      return NextResponse.json(
        { ok: false, error: "ارسال به GitHub ناموفق بود — توکن را بررسی کنید." },
        { status: 500 }
      );
    }
  }

  // Path 2: local dev — write straight into the project's booklets/ folder.
  const file = join(process.cwd(), "booklets", `${slug}.json`);
  try {
    mkdirSync(dirname(file), { recursive: true });
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
    mode: "local",
  });
}