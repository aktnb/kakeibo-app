import { NextRequest, NextResponse } from "next/server";
import { clearSessionToken, setDebugSession, setSessionToken } from "../../../lib/session";

function isLoopbackHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

function isLoopbackAddress(value: string): boolean {
  return value === "127.0.0.1" || value === "::1" || value === "[::1]";
}

function isLocalRequest(request: NextRequest): boolean {
  if (!isLoopbackHostname(request.nextUrl.hostname)) {
    return false;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isLoopbackHostname(new URL(origin).hostname)) {
        return false;
      }
    } catch {
      return false;
    }
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const clientIP = forwardedFor.split(",")[0]?.trim();
    if (!clientIP || !isLoopbackAddress(clientIP)) {
      return false;
    }
  }

  return true;
}

function getDebugFirebaseUID(): string {
  return `local:${process.env.KAKEIBO_DEBUG_UID!}`;
}

async function createAppSession(headers: HeadersInit): Promise<Response> {
  const apiBaseURL = process.env.KAKEIBO_API_BASE_URL;
  if (!apiBaseURL) {
    return NextResponse.json({ error: "Missing API configuration" }, { status: 500 });
  }

  const url = new URL("/api/v1/auth/session", apiBaseURL);
  return fetch(url, {
    method: "POST",
    headers,
    cache: "no-store",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const idToken: unknown = body?.idToken;
  const mode: unknown = body?.mode;

  if (mode === "debug") {
    const debugUID = process.env.KAKEIBO_DEBUG_UID;
    const debugAllowed = process.env.NODE_ENV !== "production" && !!debugUID && isLocalRequest(request);
    if (!debugAllowed) {
      return NextResponse.json({ error: "Debug auth is not available" }, { status: 403 });
    }

    const sessionRes = await createAppSession({
      "Content-Type": "application/json",
      "X-Debug-Firebase-Uid": getDebugFirebaseUID(),
      "X-Debug-Display-Name": process.env.KAKEIBO_DEBUG_DISPLAY_NAME || debugUID,
    });
    if (!sessionRes.ok) {
      return NextResponse.json({ error: "Failed to create app session" }, { status: sessionRes.status });
    }

    await setDebugSession();
    return NextResponse.json(await sessionRes.json(), { status: 200 });
  }

  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  const sessionRes = await createAppSession({
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  });
  if (!sessionRes.ok) {
    return NextResponse.json({ error: "Failed to create app session" }, { status: sessionRes.status });
  }

  await setSessionToken(idToken);
  return NextResponse.json(await sessionRes.json(), { status: 200 });
}

export async function DELETE() {
  await clearSessionToken();
  return NextResponse.json({ ok: true });
}
