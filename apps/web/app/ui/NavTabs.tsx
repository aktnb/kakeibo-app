"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "ホーム", href: "/" },
  { label: "収支", href: "/entries" },
  { label: "口座", href: "/accounts" },
  { label: "カテゴリ", href: "/categories" },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <TabIcon href={tab.href} active={isActive} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TabIcon({ href, active }: { href: string; active: boolean }) {
  const color = active ? "currentColor" : "currentColor";
  const strokeWidth = active ? 2.5 : 2;

  if (href === "/") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M3 12L12 3l9 9" />
        <path d="M9 21V12h6v9" />
      </svg>
    );
  }
  if (href === "/entries") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }
  if (href === "/accounts") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    );
  }
  if (href === "/categories") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M4 6h16M4 12h10M4 18h6" />
      </svg>
    );
  }
  return null;
}
