import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;

      // Public routes
      if (pathname === "/auth/signin" || pathname === "/auth/error") {
        return true;
      }

      // Role-based access control
      if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
        return false;
      }
      if (pathname.startsWith("/teacher") && token?.role !== "TEACHER" && token?.role !== "ADMIN") {
        return false;
      }
      if (pathname.startsWith("/student") && token?.role !== "STUDENT" && token?.role !== "ADMIN") {
        return false;
      }

      // Allow authenticated users to access dashboard
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/teacher/:path*", "/student/:path*"],
};