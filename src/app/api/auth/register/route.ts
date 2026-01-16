// ===========================================
// FILE: src/app/api/auth/register/route.ts
// PURPOSE: User registration API endpoint
// PRD REFERENCE: PRD Section 4 - Authentication System
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma, PrismaTransactionClient } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { registrationSchema } from '@/lib/validations/auth';

type UserRole = 'DISTRIBUTOR_ADMIN' | 'DISTRIBUTOR_USER' | 'ORG_ADMIN' | 'SITE_MANAGER' | 'SITE_USER';

/**
 * POST /api/auth/register
 *
 * Register a new user (distributor or organization)
 *
 * WHY: Self-service signup for both distributors and car wash operators.
 * Creates the user, company/org, and assigns appropriate admin role.
 *
 * BUSINESS LOGIC (PRD Section 4):
 * - Distributor signup creates: Distributor + User (DISTRIBUTOR_ADMIN role)
 * - Organization signup creates: Organization + User (ORG_ADMIN role)
 * - First user of new company gets admin privileges
 *
 * SECURITY:
 * - Password hashing with bcrypt (12 rounds)
 * - Email uniqueness check
 * - Input validation with Zod
 *
 * @param request - Registration data (accountType, companyName, userDetails)
 * @returns Created user data (without password) or error
 *
 * EXAMPLE REQUEST:
 * ```json
 * {
 *   "accountType": "DISTRIBUTOR",
 *   "companyName": "TrueLevel Chemical Supply",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "john@truelevel.com",
 *   "password": "SecurePass123"
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    console.log('Registration request body:', JSON.stringify(body, null, 2));

    const validatedData = registrationSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    const {
      accountType,
      companyName,
      firstName,
      lastName,
      email,
      phone,
      password,
    } = validatedData;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with appropriate role based on account type
    let user;
    let role: UserRole;

    if (accountType === 'DISTRIBUTOR') {
      // BUSINESS LOGIC: Create distributor company and admin user
      // PRD REFERENCE: PRD Section 3 - Role Definitions (Distributor Admin)

      role = 'DISTRIBUTOR_ADMIN';

      // Transaction: Create distributor and user atomically
      const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        // Create distributor company
        const distributor = await tx.distributor.create({
          data: {
            companyName,
            contactEmail: email,
            contactPhone: phone || null,
          },
        });

        // Create admin user
        const newUser = await tx.user.create({
          data: {
            email,
            phone: phone || null,
            passwordHash,
            role,
            firstName,
            lastName,
            distributorId: distributor.id,
            isActive: true,
          },
        });

        return { user: newUser, distributor };
      });

      user = result.user;
    } else {
      // BUSINESS LOGIC: Create organization and admin user
      // PRD REFERENCE: PRD Section 3 - Role Definitions (Org Admin)
      // Note: Org can optionally link to a distributor later

      role = 'ORG_ADMIN';

      // Transaction: Create organization and user atomically
      const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        // Create organization (no distributor initially - self-signup)
        const organization = await tx.organization.create({
          data: {
            name: companyName,
            contactEmail: email,
            contactPhone: phone || null,
            distributorId: null, // Self-signup orgs have no distributor initially
          },
        });

        // Create admin user
        const newUser = await tx.user.create({
          data: {
            email,
            phone: phone || null,
            passwordHash,
            role,
            firstName,
            lastName,
            organizationId: organization.id,
            isActive: true,
          },
        });

        return { user: newUser, organization };
      });

      user = result.user;
    }

    // Return success (exclude password hash)
    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error meta:', error.meta);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint violations
    if (error.code === 'P2002') {
      // Check which field caused the constraint violation
      const target = error.meta?.target;
      if (Array.isArray(target) && target.includes('phone')) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Handle Prisma connection errors
    if (error.code === 'P1001' || error.code === 'P1002') {
      console.error('Database connection error');
      return NextResponse.json(
        { error: 'Unable to connect to database. Please try again later.' },
        { status: 503 }
      );
    }

    // Generic error response - include error details for debugging
    return NextResponse.json(
      {
        error: `Registration failed: ${error.message || 'Unknown error'}`,
        code: error.code,
        name: error.name,
      },
      { status: 500 }
    );
  }
}
