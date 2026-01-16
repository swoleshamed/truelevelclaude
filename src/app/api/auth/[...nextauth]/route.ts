// ===========================================
// FILE: src/app/api/auth/[...nextauth]/route.ts
// PURPOSE: NextAuth.js API route handler
// PRD REFERENCE: PRD Section 4 - Authentication System
// ===========================================

import { handlers } from '@/lib/auth';

/**
 * NextAuth.js Route Handlers
 *
 * WHY: Handles all authentication endpoints:
 * - POST /api/auth/signin - User login
 * - POST /api/auth/signout - User logout
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/providers - List auth providers
 * - GET /api/auth/csrf - Get CSRF token
 *
 * SECURITY:
 * - CSRF protection enabled
 * - Secure HTTP-only cookies
 * - JWT token encryption
 *
 * PRD REFERENCE: PRD Section 4.4 - Session Management
 * - Session duration: 7 days with "remember me"
 * - JWT expiry: Handled by NextAuth
 * - Automatic session refresh
 */
export const { GET, POST } = handlers;
