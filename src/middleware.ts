import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// import { PrismaClient } from '@/generated/prisma'; // Temporarily removed

// const prisma = new PrismaClient(); // Temporarily removed

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Temporarily removed admin route protection to resolve Edge Runtime incompatibility
  // if (request.nextUrl.pathname.startsWith('/admin')) {
  //   if (user) {
  //     const dbUser = await prisma.user.findUnique({
  //       where: { id: user.id },
  //       select: { role: true },
  //     });

  //     if (dbUser?.role !== 'Admin') {
  //       return NextResponse.redirect(new URL('/', request.url));
  //     }
  //   } else {
  //     return NextResponse.redirect(new URL('/signin', request.url));
  //   }
  // }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (next-auth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};