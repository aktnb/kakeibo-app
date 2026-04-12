export function accountTypeLabel(type: string): string {
  if (type === "bank") return "銀行口座";
  if (type === "cash") return "現金";
  if (type === "credit") return "クレジット";
  if (type === "ewallet") return "電子マネー";
  return type;
}

export default function AccountTypeIcon({ type }: { type: string }) {
  const configs: Record<string, { bg: string; text: string; char: string }> = {
    bank: { bg: "bg-blue-100", text: "text-blue-600", char: "銀" },
    cash: { bg: "bg-amber-100", text: "text-amber-600", char: "現" },
    credit: { bg: "bg-purple-100", text: "text-purple-600", char: "カ" },
    ewallet: { bg: "bg-green-100", text: "text-green-600", char: "電" },
  };
  const c = configs[type] ?? { bg: "bg-slate-100", text: "text-slate-500", char: "他" };
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.bg} ${c.text}`}
    >
      {c.char}
    </span>
  );
}
