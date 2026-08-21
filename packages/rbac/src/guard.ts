import {
  ROLE_PERMISSIONS,
  ROLE_SCOPE,
  type Action,
  type ModuleKey,
  type PermissionKey,
} from "./permissions.js";

export interface Principal {
  userId: string;
  roles: string[];
  barangayId?: string;
  cityId?: string;
  inhabitantId?: string;
  mfaPassed: boolean;
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Flatten a principal's roles into the set of permissions they hold. */
export function permissionsFor(roles: string[]): Set<PermissionKey> {
  const out = new Set<PermissionKey>();
  for (const role of roles) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) out.add(p);
  }
  return out;
}

export function can(
  principal: Principal,
  module: ModuleKey,
  action: Action,
): boolean {
  return permissionsFor(principal.roles).has(`${module}:${action}` as PermissionKey);
}

/** Throwing variant for use in route handlers. */
export function assertCan(
  principal: Principal,
  module: ModuleKey,
  action: Action,
): void {
  if (!can(principal, module, action)) {
    throw new ForbiddenError(
      `Missing permission '${module}:${action}' for roles [${principal.roles.join(", ")}].`,
    );
  }
}

/** The broadest scope among a principal's roles. */
export function effectiveScope(roles: string[]): string {
  const order = ["self", "barangay", "city", "province", "region", "platform"];
  let best = "self";
  for (const r of roles) {
    const s = ROLE_SCOPE[r] ?? "self";
    if (order.indexOf(s) > order.indexOf(best)) best = s;
  }
  return best;
}

/**
 * VAWC/VAC confidentiality: only the VAW Desk Officer and the Punong Barangay
 * may read confidential KP/blotter records (A3).
 */
export function canSeeConfidentialCase(principal: Principal): boolean {
  return (
    principal.roles.includes("VAW_DESK_OFFICER") ||
    principal.roles.includes("PUNONG_BARANGAY") ||
    principal.roles.includes("SYSTEM_ADMIN")
  );
}

/** DILG viewers are restricted to aggregate reads. */
export function isAggregatesOnly(roles: string[]): boolean {
  return roles.includes("DILG_VIEWER") && !roles.includes("SYSTEM_ADMIN");
}

/**
 * Maker–checker for disbursement batches: preparer and approver must differ.
 * (B1 — public funds, LGC §375 accountability.)
 */
export function assertDifferentApprover(
  preparedById: string | null | undefined,
  approverId: string,
): void {
  if (preparedById && preparedById === approverId) {
    throw new ForbiddenError(
      "Maker–checker violation: the preparer of a disbursement batch cannot approve it.",
    );
  }
}
