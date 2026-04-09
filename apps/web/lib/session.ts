import "server-only";
import { cookies } from "next/headers";

const SESSION_COOKIE = "__session";
const MAX_AGE = 60 * 60; // Firebase ID token の有効期限に合わせて 1 時間

export type SessionCookie =
  | { mode: "firebase"; token: string }
  | { mode: "debug" };

function parseSessionCookie(value: string | undefined): SessionCookie | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as Partial<SessionCookie>;
    if (parsed.mode === "firebase" && typeof parsed.token === "string" && parsed.token) {
      return { mode: "firebase", token: parsed.token };
    }
    if (parsed.mode === "debug") {
      return { mode: "debug" };
    }
  } catch {
    // 旧形式の token cookie を読み続ける
  }

  return { mode: "firebase", token: value };
}

async function setSessionCookie(session: SessionCookie): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<SessionCookie | undefined> {
  const jar = await cookies();
  return parseSessionCookie(jar.get(SESSION_COOKIE)?.value);
}

export async function setSessionToken(token: string): Promise<void> {
  await setSessionCookie({ mode: "firebase", token });
}

export async function setDebugSession(): Promise<void> {
  await setSessionCookie({ mode: "debug" });
}

export async function clearSessionToken(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
