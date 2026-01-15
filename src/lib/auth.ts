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
