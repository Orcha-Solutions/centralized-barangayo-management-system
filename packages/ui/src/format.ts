/** Formatting helpers shared by every app. */

/** Centavos (string|bigint|number) -> "₱1,234.56" */
export function peso(centavos: string | bigint | number | null | undefined): string {
  if (centavos === null || centavos === undefined) return "₱0.00";
  if (typeof centavos === "bigint") {
    const neg = centavos < 0n;
    const abs = neg ? -centavos : centavos;
    const whole = (abs / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const frac = (abs % 100n).toString().padStart(2, "0");
    return `${neg ? "-" : ""}₱${whole}.${frac}`;
  }
  const clean = typeof centavos === "string" ? centavos.replace(/n$/, "").trim() : centavos;
  const n = Number(clean);
  if (isNaN(n)) return "₱0.00";
  const c = BigInt(Math.round(n));
  const neg = c < 0n;
  const abs = neg ? -c : c;
  const whole = (abs / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const frac = (abs % 100n).toString().padStart(2, "0");
  return `${neg ? "-" : ""}₱${whole}.${frac}`;
}

/** Peso decimal number -> "₱1,234.56" */
export function pesoAmount(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function num(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("en-PH");
}

export function date(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function dateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relative(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return "just now";
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (Math.abs(hrs) < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (Math.abs(days) < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export function age(birthDate: string | Date | null | undefined): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

export function fullName(p: {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  suffix?: string | null;
} | null | undefined): string {
  if (!p) return "—";
  return [p.firstName, p.middleName ? `${p.middleName.charAt(0)}.` : null, p.lastName, p.suffix]
    .filter(Boolean)
    .join(" ");
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.charAt(0) ?? "") + (parts[parts.length - 1]?.charAt(0) ?? "")).toUpperCase();
}

/** Human label for an enum-ish value: "under_construction" -> "Under construction" */
export function titleize(s: string | null | undefined): string {
  if (!s) return "—";
  const t = s.replace(/[_-]+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
