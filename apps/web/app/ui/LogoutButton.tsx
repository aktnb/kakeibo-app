"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { firebaseAuth, isFirebaseConfigured } from "../../lib/firebase";

export default function LogoutButton() {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  if (pathname === "/login") {
    return null;
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  async function handleLogout() {
    if (isFirebaseConfigured && firebaseAuth?.currentUser) {
      await signOut(firebaseAuth);
    }

    await fetch("/api/auth", { method: "DELETE" });
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="ユーザーメニュー"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-12 right-0 z-20 min-w-32 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button
            onClick={handleLogout}
            role="menuitem"
            className="block w-full px-4 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
