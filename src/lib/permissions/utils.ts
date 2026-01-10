/**
 * Permission Utilities
 * Helper functions for checking permissions and filtering data based on roles
 */

import { PAGE_PERMISSIONS, SystemRole } from "./config";

/**
 * Check if a user with a given role can access a specific page
 */
export function canAccessPage(userRole: SystemRole, path: string): boolean {
  // Super Admin can access everything
  if (userRole === "SuperAdmin") {
    return true;
  }

  // Find the permission rule for the requested path
  // Check for exact match first, then check if the path starts with a permission path
  const permission = PAGE_PERMISSIONS.find(
    (p) => path === p.path || path.startsWith(p.path + "/")
  );

  // If no specific permission found, allow access (default allow)
  if (!permission) {
    return true;
  }

  // Check if user's role is in the allowed roles
  return permission.allowedRoles.includes(userRole);
}

/**
 * Filter menu items based on user's role
 * Returns only the menu items that the user has permission to access
 */
export function filterMenuByPermissions<T extends { path: string }>(
  items: T[],
  userRole: SystemRole
): T[] {
  return items.filter((item) => canAccessPage(userRole, item.path));
}

/**
 * Check if a user can invite other users
 * Only Organization Admins and Super Admins can invite users if they have the canInvite flag
 */
export function canInviteUsers(
  userRole: SystemRole,
  canInviteFlag: boolean
): boolean {
  // Super Admin can always invite
  if (userRole === "SuperAdmin") {
    return true;
  }

  // Organization Admin can invite if they have the flag set
  if (userRole === "OrganizationAdmin" && canInviteFlag) {
    return true;
  }

  // Finance Manager and Academic Coordinator cannot invite
  return false;
}

/**
 * Get all pages accessible by a role
 */
export function getAccessiblePages(userRole: SystemRole): string[] {
  if (userRole === "SuperAdmin") {
    return PAGE_PERMISSIONS.map((p) => p.path);
  }

  return PAGE_PERMISSIONS.filter((p) => p.allowedRoles.includes(userRole)).map(
    (p) => p.path
  );
}

/**
 * Check if a role has access to any finance features
 */
export function hasFinanceAccess(userRole: SystemRole): boolean {
  return ["SuperAdmin", "OrganizationAdmin", "FinanceManager"].includes(
    userRole
  );
}

/**
 * Check if a role has access to any academic features
 */
export function hasAcademicAccess(userRole: SystemRole): boolean {
  return ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"].includes(
    userRole
  );
}

/**
 * Check if a role is an admin role (can manage organization)
 */
export function isAdminRole(userRole: SystemRole): boolean {
  return ["SuperAdmin", "OrganizationAdmin"].includes(userRole);
}

/**
 * Check if a role is Super Admin
 */
export function isSuperAdmin(userRole: SystemRole): boolean {
  return userRole === "SuperAdmin";
}

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(userRole: SystemRole): number {
  const levels: Record<SystemRole, number> = {
    SuperAdmin: 4,
    OrganizationAdmin: 3,
    FinanceManager: 2,
    AcademicCoordinator: 2,
  };

  return levels[userRole] || 0;
}

/**
 * Check if user can manage another user based on role hierarchy
 */
export function canManageUser(
  managerRole: SystemRole,
  targetRole: SystemRole
): boolean {
  // Super Admin can manage everyone
  if (managerRole === "SuperAdmin") {
    return true;
  }

  // Organization Admin can manage Finance Manager and Academic Coordinator
  if (managerRole === "OrganizationAdmin") {
    return ["FinanceManager", "AcademicCoordinator"].includes(targetRole);
  }

  // Finance Manager and Academic Coordinator cannot manage others
  return false;
}
