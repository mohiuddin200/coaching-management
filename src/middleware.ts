import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canAccessPage } from '@/lib/permissions/utils';
import { SystemRole } from '@/lib/permissions/config';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow access to signin page (public)
  if (pathname === '/signin') {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // Allow access to forgot password and reset password pages (public)
  if (pathname === '/auth/forgot-password' || pathname === '/auth/reset-password') {
    return response;
  }

  // Allow access to auth callback and verification endpoints (needed for auth flow)
  if (pathname.startsWith('/api/auth/callback') || 
      pathname.startsWith('/api/auth/verify')) {
    return response;
  }

  // All other routes require authentication
  if (!user) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Get user's organization and role from metadata
  const metadata = user.user_metadata || {};
  const organizationId = metadata.organizationId;
  const systemRole = metadata.systemRole as SystemRole;
  const legacyRole = metadata.role as string; // For super admins created via script
  const onboarded = metadata.onboarded;

  // Check if user is a super admin (from metadata "role" field)
  const userIsSuperAdmin = legacyRole === "SuperAdmin";

  // Check if user needs to complete onboarding
  if (!onboarded && !pathname.startsWith('/auth/onboarding')) {
    return NextResponse.redirect(new URL('/auth/onboarding', request.url));
  }

  // Allow access to onboarding page for unonboarded users
  if (pathname.startsWith('/auth/onboarding')) {
    return response;
  }

  // If user is onboarded but doesn't have organization context, require re-onboarding
  // This handles users created before multi-tenant implementation
  // Exception: Super admins don't need organization context
  if (onboarded && !userIsSuperAdmin && (!organizationId || !systemRole) && !pathname.startsWith('/auth/onboarding')) {
    return NextResponse.redirect(new URL('/auth/onboarding', request.url));
  }

  // Check role-based page access
  // Use metadata "role" for super admins, "systemRole" for others
  const effectiveRole = userIsSuperAdmin ? ("SuperAdmin" as SystemRole) : systemRole;
  if (effectiveRole && !canAccessPage(effectiveRole, pathname)) {
    // Redirect to dashboard with error message
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('error', 'insufficient_permissions');
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};