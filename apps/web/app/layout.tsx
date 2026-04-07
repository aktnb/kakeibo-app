import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
