"use client";

import { use } from "react";
import BookletEditor from "@/components/editor/BookletEditor";
import { BOOKLETS } from "@/data/content-map";

/**
 * /admin/edit/[slug] — edit one existing child's booklet. The editor is a
 * client component; the content is passed in as props (loaded from the
 * client-side generated content map).
 */
export default function AdminEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const content = BOOKLETS[slug] ?? null;
  return <BookletEditor slug={slug} content={content} />;
}