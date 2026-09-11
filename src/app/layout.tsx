import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { bookletTitle, childInfo } from "@/data/content";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: bookletTitle,
  description: `کتابچه‌ی راهنمای والدین برای رشد و شکوفایی ${childInfo.name} 🌱`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body>{children}</body>
    </html>
  );
}