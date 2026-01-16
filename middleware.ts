// ===========================================
// FILE: middleware.ts
// PURPOSE: Next.js middleware for route protection and authentication
// PRD REFERENCE: PRD Section 4 - Authentication System
// ===========================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Middleware for protecting routes and handling authentication
 *
 * WHY: Ensure users are authenticated before accessing protected routes.
 * Redirect unauthenticated users to login page.
 *
 * BUSINESS LOGIC:
 * - Public routes: /, /login, /register, /forgot-password
 * - Protected routes: /dashboard, /api/* (except auth endpoints)
 * - Authenticated users accessing /login or /register → redirect to /dashboard
 *
 * SECURITY:
 * - Session validation on every request
 * - Prevents unauthorized access to protected resources
 * - Stateless (JWT-based) for scalability
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session from NextAuth
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Define public paths (accessible without authentication)
  const publicPaths = ['/login', '/register', '/forgot-password', '/api/auth'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Define protected paths (require authentication)
  const protectedPaths = ['/dashboard', '/api'];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  /**
   * BUSINESS RULE 1: Redirect unauthenticated users to login
   * WHY: Protect sensitive data and features
   */
  if (!isAuthenticated && isProtectedPath && !pathname.startsWith('/api/auth')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  /**
   * BUSINESS RULE 2: Redirect authenticated users from auth pages
   * WHY: Users already logged in don't need login/register pages
   */
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  /**
   * BUSINESS RULE 3: Redirect root path based on auth status
   * WHY: Provide appropriate landing page for users
   */
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow request to proceed
  return NextResponse.next();
}

/**
 * Middleware configuration
 * WHY: Define which routes should run through middleware
 *
 * NOTE: Exclude static files and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
