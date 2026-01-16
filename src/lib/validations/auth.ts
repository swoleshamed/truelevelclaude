// ===========================================
// FILE: src/lib/validations/auth.ts
// PURPOSE: Zod validation schemas for authentication
// PRD REFERENCE: PRD Section 4 - Authentication System
// USED BY: Registration and login forms, API routes
// ===========================================

import { z } from 'zod';

/**
 * Password validation schema
 * WHY: Enforce strong password requirements for security
 * PRD REFERENCE: PRD Section 4.1 - Primary Authentication
 *
 * REQUIREMENTS:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Email validation schema
 * WHY: Ensure valid email format
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

/**
 * Phone validation schema
 * WHY: Validate phone number format (optional field)
 * FIXED: Handle empty strings from React Hook Form - transforms to undefined
 * Also accepts properly formatted phone numbers (E.164 format or just digits)
 */
export const phoneSchema = z
  .union([
    z.literal(''),
    z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  ])
  .optional()
  .transform((val) => (val === '' || val === undefined) ? undefined : val);

/**
 * PIN validation schema
 * WHY: Validate 4-6 digit PIN for tablet mode
 * PRD REFERENCE: PRD Section 4.2 - Secondary Authentication (PIN)
 */
export const pinSchema = z
  .string()
  .regex(/^\d{4,6}$/, 'PIN must be 4-6 digits');

/**
 * Login validation schema
 * WHY: Validate login form inputs
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration validation schema
 * WHY: Validate new user registration
 * PRD REFERENCE: PRD Section 4 - Authentication System
 *
 * BUSINESS LOGIC:
 * - Users select account type (DISTRIBUTOR or ORGANIZATION)
 * - First distributor user becomes DISTRIBUTOR_ADMIN
 * - First org user becomes ORG_ADMIN
 */
export const registrationSchema = z.object({
  // Account type selection (Step 1)
  accountType: z.enum(['DISTRIBUTOR', 'ORGANIZATION'], {
    required_error: 'Account type is required',
  }),

  // Company/organization name
  companyName: z.string().min(1, 'Company name is required'),

  // User details (Step 2)
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/**
 * PIN creation schema
 * WHY: Validate PIN when creating for tablet mode
 * PRD REFERENCE: PRD Section 4.2 - Secondary Authentication (PIN)
 */
export const pinCreationSchema = z.object({
  pin: pinSchema,
  confirmPin: pinSchema,
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs don't match",
  path: ['confirmPin'],
});

export type PinCreationInput = z.infer<typeof pinCreationSchema>;

/**
 * PIN login schema
 * WHY: Validate PIN login for tablet mode
 */
export const pinLoginSchema = z.object({
  pin: pinSchema,
  siteId: z.string().uuid('Invalid site ID'),
});

export type PinLoginInput = z.infer<typeof pinLoginSchema>;
