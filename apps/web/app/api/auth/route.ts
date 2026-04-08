import { NextRequest, NextResponse } from "next/server";
import { setSessionToken, clearSessionToken } from "../../../lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const idToken: unknown = body?.idToken;

  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  await setSessionToken(idToken);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSessionToken();
  return NextResponse.json({ ok: true });
}
