// ===========================================
// FILE: src/app/api/packages/templates/route.ts
// PURPOSE: API endpoints for WashPackageTemplate (Org-level templates)
// PRD REFERENCE: PRD Section 5.1 - Package Templates
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { washPackageTemplateSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/packages/templates
 *
 * Fetch wash package templates for an organization
 *
 * WHY: Organizations need to view and manage their package templates.
 * Templates define standard packages that can be applied across sites.
 *
 * QUERY PARAMS:
 * - organizationId (optional): Filter by specific organization
 * - includeItems (optional): Include template items in response
 *
 * RETURNS: Array of WashPackageTemplate records
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const includeItems = searchParams.get('includeItems') === 'true';

    /**
     * Permission check
     * WHY: Only org users and distributors can view templates
     */
    const allowedRoles = [
      'DISTRIBUTOR_ADMIN',
      'DISTRIBUTOR_USER',
      'ORG_ADMIN',
    ];

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    /**
     * Determine which organization to query
     * WHY: Users see templates for their organization or client orgs
     */
    let queryOrganizationId = organizationId;

    // Org users see their own org's templates
    if (
      session.user.role === 'ORG_ADMIN' &&
      !queryOrganizationId
    ) {
      queryOrganizationId = session.user.organizationId;
    }

    if (!queryOrganizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    /**
     * Distributors can only view templates for their client organizations
     * WHY: Prevent cross-distributor data access
     */
    if (
      session.user.role === 'DISTRIBUTOR_ADMIN' ||
      session.user.role === 'DISTRIBUTOR_USER'
    ) {
      const org = await prisma.organization.findFirst({
        where: {
          id: queryOrganizationId,
          distributorId: session.user.distributorId,
        },
      });

      if (!org) {
        return NextResponse.json(
          { error: 'Forbidden: Organization not in your client list' },
          { status: 403 }
        );
      }
    }

    // Fetch templates
    const templates = await prisma.washPackageTemplate.findMany({
      where: {
        organizationId: queryOrganizationId,
      },
      include: includeItems
        ? {
            items: {
              orderBy: { displayOrder: 'asc' },
              include: {
                chemicals: {
                  include: {
                    chemicalOrgConfig: {
                      include: {
                        chemicalMaster: true,
                      },
                    },
                  },
                  orderBy: { applicationOrder: 'asc' },
                },
              },
            },
          }
        : undefined,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/packages/templates
 *
 * Create a new wash package template
 *
 * WHY: Organizations need to create templates to standardize packages.
 *
 * BODY: WashPackageTemplate data
 * RETURNS: Created WashPackageTemplate record
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only org admins can create templates
     */
    if (session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only organization admins can create templates' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = washPackageTemplateSchema.parse(body);

    /**
     * Verify user owns the organization
     * WHY: Prevent creating templates for other organizations
     */
    if (validatedData.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot create templates for other organizations' },
        { status: 403 }
      );
    }

    /**
     * Handle isDefault logic
     * WHY: Only one template can be default per organization
     */
    if (validatedData.isDefault) {
      // Unset any existing default
      await prisma.washPackageTemplate.updateMany({
        where: {
          organizationId: validatedData.organizationId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create template
    const template = await prisma.washPackageTemplate.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
