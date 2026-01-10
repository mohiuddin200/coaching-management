/**
 * Permission Configuration
 * Defines page-to-role mappings for the multi-tenant RBAC system
 */

export type SystemRole = 
  | "SuperAdmin" 
  | "OrganizationAdmin" 
  | "FinanceManager" 
  | "AcademicCoordinator";

export interface PagePermission {
  path: string;
  allowedRoles: SystemRole[];
}

/**
 * Page permission mappings
 * Each page path is mapped to the roles that can access it
 */
export const PAGE_PERMISSIONS: PagePermission[] = [
  // Dashboard - All authenticated users
  { path: "/dashboard", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager", "AcademicCoordinator"] },

  // Academic pages - Only academic staff and admins
  { path: "/students", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
  { path: "/teachers", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
  { path: "/levels", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
  { path: "/classes", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
  { path: "/attendance", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
  { path: "/exams", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },

  // Finance pages - Only finance staff and admins
  { path: "/finance", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager"] },
  { path: "/finance/fees", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager"] },
  { path: "/finance/payments", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager"] },
  { path: "/finance/salaries", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager"] },
  { path: "/finance/expenses", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager"] },

  // Admin pages - Super Admin only
  { path: "/admin", allowedRoles: ["SuperAdmin"] },
  { path: "/admin/organizations", allowedRoles: ["SuperAdmin"] },

  // Settings - All authenticated users
  { path: "/settings", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager", "AcademicCoordinator"] },

  // Sessions/Schedules - Academic staff only
  { path: "/sessions", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
];

/**
 * Role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS: Record<SystemRole, string> = {
  SuperAdmin: "Platform administrator with access to all organizations and features",
  OrganizationAdmin: "Full access within their organization, can invite users",
  FinanceManager: "Access to finance features only (fees, payments, salaries, expenses)",
  AcademicCoordinator: "Access to students, teachers, classes, attendance, and exams (no finance)",
};

/**
 * Role display names
 */
export const ROLE_NAMES: Record<SystemRole, string> = {
  SuperAdmin: "Super Admin",
  OrganizationAdmin: "Organization Admin",
  FinanceManager: "Finance Manager",
  AcademicCoordinator: "Academic Coordinator",
};

/**
 * Feature categories accessible by each role
 */
export const ROLE_FEATURES: Record<SystemRole, string[]> = {
  SuperAdmin: ["All Features", "Organization Management"],
  OrganizationAdmin: ["Students", "Teachers", "Classes", "Attendance", "Exams", "Finance", "Settings"],
  FinanceManager: ["Finance", "Fees", "Payments", "Salaries", "Expenses", "Settings"],
  AcademicCoordinator: ["Students", "Teachers", "Classes", "Attendance", "Exams", "Settings"],
};
