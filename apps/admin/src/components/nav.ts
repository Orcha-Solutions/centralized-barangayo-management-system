/** Sidebar model for the Barangay Console. */

export type BadgeKey =
  | "actionQueueTotal"
  | "certificatesForApproval"
  | "openConcerns"
  | "activeSosAlerts";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** `module:action` permission required to see the item. */
  perm?: string;
  badge?: BadgeKey;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: "◎", badge: "actionQueueTotal" }],
  },
  {
    label: "Residents (BIPS)",
    items: [
      { href: "/inhabitants", label: "Inhabitants", icon: "👥", perm: "inhabitants:view" },
      { href: "/households", label: "Households", icon: "🏠", perm: "inhabitants:view" },
      { href: "/civil-registry", label: "Civil Registry", icon: "📝", perm: "inhabitants:view" },
    ],
  },
  {
    label: "Services",
    items: [
      {
        href: "/certificates",
        label: "Certificates",
        icon: "📄",
        perm: "issuance:view",
        badge: "certificatesForApproval",
      },
      { href: "/lgu-requests", label: "LGU requests", icon: "🏛️", perm: "issuance:view" },
      { href: "/appointments", label: "Appointments", icon: "📅", perm: "appointments:view" },
      {
        href: "/concerns",
        label: "Concerns 311",
        icon: "📣",
        perm: "concerns:view",
        badge: "openConcerns",
      },
    ],
  },
  {
    label: "Justice & Safety",
    items: [
      { href: "/blotter", label: "Blotter", icon: "📕", perm: "kp:view" },
      { href: "/kp", label: "KP Cases", icon: "⚖️", perm: "kp:view" },
      {
        href: "/sos",
        label: "SOS Dispatch",
        icon: "🚨",
        perm: "sos:view",
        badge: "activeSosAlerts",
      },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/finance", label: "Treasury & Ledger", icon: "🏦", perm: "finance:view" },
      { href: "/rpt", label: "Real Property Tax", icon: "🏷️", perm: "finance:view" },
      { href: "/wallet", label: "E-Wallet", icon: "📱", perm: "wallet:view" },
      { href: "/wallet/batches", label: "Disbursements", icon: "💸", perm: "wallet:view" },
    ],
  },
  {
    label: "Assets & DRRM",
    items: [
      { href: "/properties", label: "Properties", icon: "🏢", perm: "property:view" },
      { href: "/drrm-resources", label: "DRRM Resources", icon: "🚒", perm: "disaster:view" },
      { href: "/disaster", label: "Disaster", icon: "🌀", perm: "disaster:view" },
    ],
  },
  {
    label: "Governance",
    items: [
      { href: "/legislation", label: "Legislation", icon: "📜", perm: "legislation:view" },
      { href: "/devplan", label: "Dev Plan", icon: "🧭", perm: "devplan:view" },
      { href: "/gad", label: "GAD", icon: "⚖", perm: "gad:view" },
      { href: "/institutions", label: "Institutions", icon: "🏛️", perm: "institutions:view" },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/announcements", label: "Announcements", icon: "📢", perm: "announcements:view" },
      { href: "/cms", label: "Website CMS", icon: "🌐", perm: "website:view" },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/reports", label: "Reports", icon: "📊", perm: "reports:view" },
      { href: "/audit", label: "Audit Log", icon: "🧾", perm: "admin:view" },
      { href: "/tickets", label: "Tickets", icon: "🎫", perm: "admin:view" },
    ],
  },
];

/** Longest matching nav href for the current pathname. */
export function activeHref(pathname: string): string {
  let best = "";
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      const match = pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (match && item.href.length > best.length) best = item.href;
    }
  }
  return best;
}
