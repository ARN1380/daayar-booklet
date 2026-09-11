"use client";

import BookletEditor from "@/components/editor/BookletEditor";

/**
 * /admin/new — create a booklet for a new child. The editor starts blank; the
 * slug is entered before saving so the file lands as booklets/<slug>.json.
 */
export default function AdminNewPage() {
  return <BookletEditor slug="" content={null} />;
}