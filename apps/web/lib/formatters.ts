export function formatJPY(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${year}年${parseInt(m)}月`;
}

export function signedJPY(value: number): string {
  return (value >= 0 ? "+" : "") + formatJPY(value);
}

export function formatDateTime(rfc3339: string): string {
  const d = new Date(rfc3339);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}`;
}
