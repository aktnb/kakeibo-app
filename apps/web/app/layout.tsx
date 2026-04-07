import type { Metadata } from "next";
import "./globals.css";
import NavTabs from "./ui/NavTabs";
import { createSession } from "../lib/api";

export const metadata: Metadata = {
  title: "残高の森",
  description: "家計の全体像を一画面で確認するための MVP Web UI",
};

// 初回アクセス時に household を自動作成する（EnsureUser は upsert なので冪等）
async function ensureSession() {
  try {
    await createSession();
  } catch {
    // API 未設定・起動前は無視（モックデータで動作継続）
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureSession();

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-100">
        <main className="flex-1">{children}</main>
        <NavTabs />
      </body>
    </html>
  );
}
