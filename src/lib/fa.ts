const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Convert Western digits in a number/string to Persian digits (e.g. 12 -> ۱۲). */
export function toFaDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/**
 * Render "−" for empty/whitespace-only text, so an unfilled section still
 * shows a visible dash instead of a blank hole on the page.
 */
export function orDash(value: string): string {
  return value && value.trim() !== "" ? value : "−";
}