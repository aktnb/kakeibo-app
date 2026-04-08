import type { Metadata } from "next";
import "./globals.css";
import NavTabs from "./ui/NavTabs";
import { AuthSync } from "./ui/AuthSync";

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
        <main className="flex-1">{children}</main>
        <NavTabs />
      </body>
    </html>
  );
}
