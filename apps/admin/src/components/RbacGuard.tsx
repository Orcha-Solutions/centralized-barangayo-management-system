"use client";

import * as React from "react";
import Link from "next/link";
import { Alert, Panel, Chip } from "@cbms/ui";
import { useRbacStore, type CrudAction } from "../lib/rbac-store";
import { roleLabel } from "../lib/labels";

export interface RbacGuardProps {
  /** Single permission key required (e.g. 'rbi:write' or 'inhabitants:create'). */
  perm?: string;
  /** Any of these permissions will grant access. */
  anyPerm?: string[];
  /** All of these permissions must be present. */
  allPerms?: string[];
  /** Allowed DILG MC 2025-104 role keys. */
  roles?: string[];
  /** Required granular CRUD flag ('create' | 'read' | 'update' | 'delete'). */
  crud?: CrudAction;
  /** Custom fallback element when unauthorized. Defaults to null for inline elements. */
  fallback?: React.ReactNode;
  /** When true, renders a full DILG MC 2025-104 Access Restricted (403) card instead of hiding. */
  showForbiddenCard?: boolean;
  children: React.ReactNode;
}

/**
 * Declarative RBAC Guard component powered by `useRbacStore`.
 * Can guard entire pages (`showForbiddenCard`) or individual buttons/actions (`crud="delete"`, `perm="rbi:write"`).
 */
export function RbacGuard({
  perm,
  anyPerm,
  allPerms,
  roles,
  crud,
  fallback = null,
  showForbiddenCard = false,
  children,
}: RbacGuardProps) {
  const user = useRbacStore((s) => s.user);
  const can = useRbacStore((s) => s.can);
  const canAny = useRbacStore((s) => s.canAny);
  const canAll = useRbacStore((s) => s.canAll);
  const hasRole = useRbacStore((s) => s.hasRole);
  const canCrud = useRbacStore((s) => s.canCrud);

  let authorized = true;
  let denialReason = "";

  if (!user) {
    authorized = false;
    denialReason = "You must be signed in to access this resource.";
  } else if (user.isActive === false) {
    authorized = false;
    denialReason = "Your account has been suspended by the Barangay IT Officer.";
  } else {
    if (roles && roles.length > 0 && !hasRole(...roles)) {
      authorized = false;
      denialReason = `Requires role: ${roles.join(" or ")}.`;
    }
    if (authorized && crud && !canCrud(crud)) {
      authorized = false;
      denialReason = `Your account's granular ${crud.toUpperCase()} privilege is currently disabled by IT Security Policy.`;
    }
    if (authorized && perm && !can(perm)) {
      authorized = false;
      denialReason = `Missing required permission: ${perm}.`;
    }
    if (authorized && anyPerm && anyPerm.length > 0 && !canAny(...anyPerm)) {
      authorized = false;
      denialReason = `Requires at least one of: ${anyPerm.join(", ")}.`;
    }
    if (authorized && allPerms && allPerms.length > 0 && !canAll(...allPerms)) {
      authorized = false;
      denialReason = `Requires all of: ${allPerms.join(", ")}.`;
    }
  }

  if (authorized) {
    return <>{children}</>;
  }

  if (!showForbiddenCard) {
    return <>{fallback}</>;
  }

  return (
    <Panel title="🛡️ DILG MC 2025-104 Role-Based Access Control (403 Restricted)">
      <Alert tone="danger">
        <strong>Access Restricted:</strong> {denialReason}
      </Alert>
      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontSize: 13,
          color: "var(--cbms-muted)",
        }}
      >
        <div>
          Signed in as: <strong style={{ color: "var(--cbms-navy)" }}>{user?.fullName}</strong> (
          <code>{user?.email}</code>)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span>Assigned Role:</span>
          <Chip tone="navy">{roleLabel(user?.roles)}</Chip>
          <span>Scope:</span>
          <Chip tone="blue">{user?.scope || "barangay"}</Chip>
        </div>
        <p style={{ margin: "6px 0" }}>
          Under <strong>DILG Memorandum Circular 2025-104</strong> and the{" "}
          <strong>Data Privacy Act of 2012 (RA 10173)</strong>, access to statutory barangay modules
          is strictly compartmentalized by official function.
        </p>
        <div style={{ marginTop: 6 }}>
          <Link href="/dashboard" className="cbms-btn cbms-btn--primary">
            ← Return to Authorized Dashboard
          </Link>
        </div>
      </div>
    </Panel>
  );
}
