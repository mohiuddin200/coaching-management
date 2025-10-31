import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  // Check if user needs to complete onboarding
  if (!user.user_metadata.onboarded && !pathname.startsWith('/auth/onboarding')) {
    return NextResponse.redirect(new URL('/auth/onboarding', request.url));
  }

  // Allow access to onboarding page for unonboarded users
  if (pathname.startsWith('/auth/onboarding')) {
    return response;
  }

  // Protect admin routes - require Admin role
  if (pathname.startsWith('/admin')) {
    const userRole = user.user_metadata.role;
    if (userRole !== 'Admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
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