// ===========================================
// FILE: src/lib/auth.ts
// PURPOSE: Authentication utilities and NextAuth configuration
// PRD REFERENCE: PRD Section 4 - Authentication System
// USED BY: API routes, server components, middleware
// ===========================================

import { compare, hash } from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * WHY: Passwords must never be stored in plain text
 *
 * @param password - Plain text password
 * @returns Hashed password suitable for database storage
 *
 * SECURITY: Uses 12 rounds of salting (recommended for production)
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

/**
 * Verify a password against its hash
 * WHY: Authenticate users during login
 *
 * @param password - Plain text password from login form
 * @param hashedPassword - Hashed password from database
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}

/**
 * Hash a PIN for tablet mode authentication
 * WHY: PINs are a secondary authentication method for shared devices
 * PRD REFERENCE: PRD Section 4.2 - Secondary Authentication (PIN)
 *
 * @param pin - 4-6 digit PIN
 * @returns Hashed PIN suitable for database storage
 */
export async function hashPin(pin: string): Promise<string> {
  // Validate PIN format
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN must be 4-6 digits');
  }
  return await hash(pin, 10); // Slightly fewer rounds for PINs
}

/**
 * Verify a PIN against its hash
 * WHY: Authenticate tablet mode users with PIN
 *
 * @param pin - Plain text PIN from tablet login
 * @param hashedPin - Hashed PIN from database
 * @returns true if PIN matches, false otherwise
 */
export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  return await compare(pin, hashedPin);
}

/**
 * Check if a user has permission to access a resource
 * WHY: Implement role-based access control (RBAC)
 * PRD REFERENCE: PRD Section 3 - User Roles & Permissions
 *
 * @param userRole - User's role
 * @param requiredRoles - Roles that can access the resource
 * @returns true if user has required role
 */
export function hasRequiredRole(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if a user role is a distributor role
 * WHY: Many features differentiate between distributors and operators
 * PRD REFERENCE: PRD Section 3 - User Roles & Permissions
 */
export function isDistributorRole(role: string): boolean {
  return role === 'DISTRIBUTOR_ADMIN' || role === 'DISTRIBUTOR_USER';
}

/**
 * Check if a user role is an organization role
 * WHY: Determine access scope for organization-level features
 */
export function isOrganizationRole(role: string): boolean {
  return role === 'ORG_ADMIN' || role === 'SITE_MANAGER' || role === 'SITE_USER';
}

/**
 * Check if a user can see private notes
 * WHY: Private notes are only visible to distributor users
 * PRD REFERENCE: Implementation Guide - Section "Private Notes Filtering"
 */
export function canSeePrivateNotes(role: string): boolean {
  return isDistributorRole(role);
}

// ===========================================
// NEXTAUTH.JS CONFIGURATION
// ===========================================

import NextAuth, { type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

// Define UserRole type locally since Prisma may not export it
type UserRole = 'DISTRIBUTOR_ADMIN' | 'DISTRIBUTOR_USER' | 'ORG_ADMIN' | 'SITE_MANAGER' | 'SITE_USER';

/**
 * Extend NextAuth types to include custom fields
 * WHY: Add TrueLevel-specific user data to session
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string | null;
      role: UserRole;
      firstName: string;
      lastName: string;
      distributorId: string | null;
      organizationId: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string | null;
    role: UserRole;
    firstName: string;
    lastName: string;
    distributorId: string | null;
    organizationId: string | null;
  }
}

/**
 * NextAuth.js configuration
 * WHY: Handle authentication for email/password login
 * PRD REFERENCE: PRD Section 4 - Authentication System
 *
 * FEATURES:
 * - Email/password authentication
 * - JWT sessions (7 days with remember me)
 * - Custom user data in session
 * - Secure password verification
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days (PRD Section 4.4)
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            distributor: true,
            organization: true,
          },
        });

        // Check if user exists and is active
        if (!user || !user.isActive) {
          throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Return user data for session
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          distributorId: user.distributorId,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback - Add custom fields to token
     * WHY: Store user data in JWT for fast session checks
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.distributorId = user.distributorId;
        token.organizationId = user.organizationId;
      }
      return token;
    },

    /**
     * Session callback - Add custom fields to session
     * WHY: Make user data available in client components
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.distributorId = token.distributorId as string | null;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
});
