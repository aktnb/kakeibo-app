import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import NavTabs from "./ui/NavTabs";
import { AuthSync } from "./ui/AuthSync";
import FloatingEntryWrapper from "./ui/FloatingEntryWrapper";
import LogoutButton from "./ui/LogoutButton";

export const metadata: Metadata = {
  title: "残高の森",
  description: "家計の全体像を一画面で確認するための MVP Web UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-100">
        <AuthSync />
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="text-lg font-bold tracking-tight text-slate-900 hover:opacity-70 transition-opacity">残高の森</Link>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <FloatingEntryWrapper />
        <NavTabs />
      </body>
    </html>
  );
}
