import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Employee routes
    if (pathname.startsWith('/dashboard') && token?.role !== 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to auth pages without token
        if (pathname.startsWith('/auth/')) {
          return true;
        }

        // Allow access to register page without token
        if (pathname === '/register') {
          return true;
        }

        // Allow access to root page
        if (pathname === '/') {
          return true;
        }

        // Require token for protected routes
        if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/auth/:path*', '/register', '/'],
};