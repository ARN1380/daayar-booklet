import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BOOKLETS, SLUG_LIST } from "@/data/content-map";
import Booklet from "@/components/Booklet";

/**
 * One child's booklet at /<slug> (e.g. /arman-daliri). Statically generated for
 * every slug found in booklets/*.json.
 */
export function generateStaticParams() {
  return SLUG_LIST.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = BOOKLETS[slug];
  if (!content) return {};
  return {
    title: content.bookletTitle,
    description: `کتابچه‌ی راهنمای والدین برای رشد و شکوفایی ${content.childInfo.name} 🌱`,
  };
}

export default async function BookletPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = BOOKLETS[slug];
  if (!content) notFound();
  return <Booklet content={content} />;
}