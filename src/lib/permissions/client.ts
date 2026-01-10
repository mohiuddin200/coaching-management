/**
 * Client-Side Permission Hooks
 * React hooks for accessing user context and checking permissions on the client
 */

"use client";

import { useEffect, useState } from "react";
import { SystemRole } from "./config";
import { canAccessPage } from "./utils";

/**
 * Client user context interface
 */
export interface ClientUserContext {
  userId: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: SystemRole;
  canInvite: boolean;
  isActive: boolean;
  isLoading: boolean;
}

/**
 * Hook to get current user's context
 * Fetches from the API endpoint
 */
export function useUserContext(): ClientUserContext {
  const [context, setContext] = useState<ClientUserContext>({
    userId: "",
    email: "",
    organizationId: "",
    organizationName: "",
    role: "AcademicCoordinator",
    canInvite: false,
    isActive: false,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchContext() {
      try {
        const response = await fetch("/api/auth/context");
        if (response.ok) {
          const data = await response.json();
          setContext({
            ...data,
            isLoading: false,
          });
        } else {
          setContext((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error fetching user context:", error);
        setContext((prev) => ({ ...prev, isLoading: false }));
      }
    }

    fetchContext();
  }, []);

  return context;
}

/**
 * Hook to check if current user can access a specific page
 */
export function useCanAccessPage(path: string): boolean {
  const { role, isLoading } = useUserContext();

  if (isLoading) {
    return false;
  }

  return canAccessPage(role, path);
}

/**
 * Hook to check if current user can invite other users
 */
export function useCanInvite(): boolean {
  const { role, canInvite, isLoading } = useUserContext();

  if (isLoading) {
    return false;
  }

  // Super Admin can always invite
  if (role === "SuperAdmin") {
    return true;
  }

  // Organization Admin can invite if flag is set
  if (role === "OrganizationAdmin" && canInvite) {
    return true;
  }

  return false;
}

/**
 * Hook to check if current user has finance access
 */
export function useHasFinanceAccess(): boolean {
  const { role, isLoading } = useUserContext();

  if (isLoading) {
    return false;
  }

  return ["SuperAdmin", "OrganizationAdmin", "FinanceManager"].includes(role);
}

/**
 * Hook to check if current user has academic access
 */
export function useHasAcademicAccess(): boolean {
  const { role, isLoading } = useUserContext();

  if (isLoading) {
    return false;
  }

  return ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"].includes(
    role
  );
}

/**
 * Hook to check if current user is an admin
 */
export function useIsAdmin(): boolean {
  const { role, isLoading } = useUserContext();

  if (isLoading) {
    return false;
  }

  return ["SuperAdmin", "OrganizationAdmin"].includes(role);
}

/**
 * Hook to check if current user is Super Admin
 */
export function useIsSuperAdmin(): boolean {
  const { role, isLoading } = useUserContext();

  if (isLoading) {
    return false;
  }

  return role === "SuperAdmin";
}
