// Resolve the (optional) editable section titles in BookletData down to the
// final string a page header should show. Empty/absent titles fall back to the
// default Persian text that was hardcoded before the titles feature existed, so
// existing booklets render byte-identically.

import type { BookletTitles } from "@/data/types";

/** The value for one title key, or its default when unset/blank. */
export function pageTitle(
  titles: Partial<BookletTitles> | undefined,
  key: keyof BookletTitles,
  fallback: string
): string {
  const v = titles?.[key];
  return v && v.trim() ? v : fallback;
}