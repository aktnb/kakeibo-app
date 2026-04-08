import "server-only";
import { cookies } from "next/headers";

const SESSION_COOKIE = "__session";
const MAX_AGE = 60 * 60; // Firebase ID token の有効期限に合わせて 1 時間

export async function getSessionToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value;
}

export async function setSessionToken(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionToken(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
