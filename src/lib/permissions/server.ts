/**
 * Server-Side Permission Helpers
 * Functions for checking permissions and getting user context on the server
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SystemRole } from "./config";
import { canAccessPage, canInviteUsers } from "./utils";

/**
 * User context interface
 */
export interface UserContext {
  userId: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: SystemRole;
  canInvite: boolean;
  isActive: boolean;
}

/**
 * Get the current user's context from the session
 * Returns null if user is not authenticated
 */
export async function getCurrentUserContext(): Promise<UserContext | null> {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Get user's organization and role from metadata
    const metadata = user.user_metadata || {};
    const organizationId = metadata.organizationId;
    const role = metadata.systemRole as SystemRole;
    const canInvite = metadata.canInvite || false;
    const organizationName = metadata.organizationName || "";

    // If no organization context, user needs onboarding
    if (!organizationId || !role) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email!,
      organizationId,
      organizationName,
      role,
      canInvite,
      isActive: true,
    };
  } catch (error) {
    console.error("Error getting user context:", error);
    return null;
  }
}

/**
 * Require authentication - throws if user is not authenticated
 * Use this in API routes and server components that require auth
 */
export async function requireAuth(): Promise<UserContext> {
  const context = await getCurrentUserContext();

  if (!context) {
    throw new Error("Unauthorized - User not authenticated");
  }

  return context;
}

/**
 * Require page access - throws if user doesn't have permission for the page
 * Use this in API routes that correspond to specific pages
 */
export async function requirePageAccess(path: string): Promise<UserContext> {
  const context = await requireAuth();

  if (!canAccessPage(context.role, path)) {
    throw new Error(
      `Forbidden - User role ${context.role} cannot access ${path}`
    );
  }

  return context;
}

/**
 * Require invite permission - throws if user cannot invite other users
 * Use this in invitation-related API routes
 */
export async function requireInvitePermission(): Promise<UserContext> {
  const context = await requireAuth();

  if (!canInviteUsers(context.role, context.canInvite)) {
    throw new Error(
      `Forbidden - User role ${context.role} cannot invite users`
    );
  }

  return context;
}

/**
 * Check if current user is Super Admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const context = await getCurrentUserContext();
  return context?.role === "SuperAdmin";
}

/**
 * Check if current user is Organization Admin or higher
 */
export async function isOrganizationAdmin(): Promise<boolean> {
  const context = await getCurrentUserContext();
  return (
    context?.role === "SuperAdmin" || context?.role === "OrganizationAdmin"
  );
}

/**
 * Require Super Admin access
 */
export async function requireSuperAdmin(): Promise<UserContext> {
  const context = await requireAuth();

  if (context.role !== "SuperAdmin") {
    throw new Error("Forbidden - Super Admin access required");
  }

  return context;
}

/**
 * Require Organization Admin or higher
 */
export async function requireOrganizationAdmin(): Promise<UserContext> {
  const context = await requireAuth();

  if (!["SuperAdmin", "OrganizationAdmin"].includes(context.role)) {
    throw new Error("Forbidden - Organization Admin access required");
  }

  return context;
}
