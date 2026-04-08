import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // ローカル開発: デバッグ認証が設定されている場合は認証をスキップ
  if (process.env.KAKEIBO_DEBUG_UID) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // 認証不要のパス
  if (pathname === "/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Cookie がなければログインへリダイレクト
  const token = request.cookies.get("__session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
