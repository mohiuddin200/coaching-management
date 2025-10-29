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

  // Allow access to auth callback, verification, and onboarding pages
  if (pathname.startsWith('/api/auth/callback') || 
      pathname.startsWith('/api/auth/verify') || 
      pathname.startsWith('/auth/onboarding')) {
    return response;
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (user) {
      const userRole = user.user_metadata.role;
      if (userRole !== 'Admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  // Check if user needs to complete onboarding
  if (user && !user.user_metadata.onboarded && !pathname.startsWith('/auth/onboarding')) {
    return NextResponse.redirect(new URL('/auth/onboarding', request.url));
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/signin', request.url));
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
     * - api/auth (auth callback routes)
     * - signin (signin page)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|signin|public).*)',
  ],
};