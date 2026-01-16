// ===========================================
// FILE: src/app/api/packages/[id]/route.ts
// PURPOSE: API endpoints for single WashPackage operations
// PRD REFERENCE: PRD Section 5.2 - Site Packages
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma, PrismaTransactionClient } from '@/lib/prisma';
import { updateWashPackageSchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Schema for updating package chemicals
 */
const updatePackageChemicalsSchema = z.object({
  chemicals: z.array(z.object({
    chemicalSiteApplicationId: z.string().uuid('Invalid application ID'),
    applicationOrder: z.number().int().min(1),
  })),
});

/**
 * GET /api/packages/[id]
 *
 * Fetch a single wash package with chemicals
 *
 * WHY: View package details including all chemical assignments
 *
 * RETURNS: WashPackage with chemicals and related data
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch package with all related data
    const pkg = await prisma.washPackage.findUnique({
      where: { id },
      include: {
        site: {
          include: {
            organization: {
              select: { id: true, distributorId: true },
            },
          },
        },
        chemicals: {
          include: {
            chemicalSiteApplication: {
              include: {
                chemicalSiteConfig: {
                  include: {
                    chemicalOrgConfig: {
                      include: {
                        chemicalMaster: true,
                      },
                    },
                  },
                },
                injectorType: true,
                tipType: true,
              },
            },
          },
          orderBy: { applicationOrder: 'asc' },
        },
        templateItem: {
          select: {
            id: true,
            name: true,
            template: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    /**
     * Permission check
     * WHY: Only authorized users can view package details
     */
    const hasAccess =
      // Distributor users
      ((session.user.role === 'DISTRIBUTOR_ADMIN' ||
        session.user.role === 'DISTRIBUTOR_USER') &&
        pkg.site.organization.distributorId === session.user.distributorId) ||
      // Org admin
      (session.user.role === 'ORG_ADMIN' &&
        pkg.site.organizationId === session.user.organizationId);

    // For site roles, check explicit access
    if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
      const siteAccess = await prisma.userSiteAccess.findFirst({
        where: {
          userId: session.user.id,
          siteId: pkg.siteId,
        },
      });

      if (!siteAccess && !hasAccess) {
        return NextResponse.json(
          { error: 'Forbidden: Access denied' },
          { status: 403 }
        );
      }
    } else if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/packages/[id]
 *
 * Update a wash package
 *
 * WHY: Modify package details or chemical assignments
 *
 * BODY: UpdateWashPackageInput (optionally with chemicals array)
 * RETURNS: Updated WashPackage
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only org admins and site managers can update packages
     */
    const allowedRoles = ['ORG_ADMIN', 'SITE_MANAGER'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check package exists and user has access
    const existingPkg = await prisma.washPackage.findUnique({
      where: { id },
      include: {
        site: true,
      },
    });

    if (!existingPkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Verify access
    if (session.user.role === 'ORG_ADMIN') {
      if (existingPkg.site.organizationId !== session.user.organizationId) {
        return NextResponse.json(
          { error: 'Forbidden: Package not in your organization' },
          { status: 403 }
        );
      }
    }

    if (session.user.role === 'SITE_MANAGER') {
      const siteAccess = await prisma.userSiteAccess.findFirst({
        where: {
          userId: session.user.id,
          siteId: existingPkg.siteId,
        },
      });

      if (!siteAccess) {
        return NextResponse.json(
          { error: 'Forbidden: No access to this site' },
          { status: 403 }
        );
      }
    }

    // Parse request body
    const body = await request.json();

    // Extract chemicals if present (handle separately)
    const { chemicals, ...packageData } = body;

    // Validate package data
    const validatedData = updateWashPackageSchema.parse(packageData);

    // Update package and chemicals in a transaction
    const pkg = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Update the package
      await tx.washPackage.update({
        where: { id },
        data: validatedData,
      });

      // Update chemicals if provided (replace all)
      if (chemicals !== undefined) {
        const validatedChemicals = updatePackageChemicalsSchema.parse({ chemicals });

        // Delete existing chemicals
        await tx.washPackageChemical.deleteMany({
          where: { washPackageId: id },
        });

        // Create new chemicals
        if (validatedChemicals.chemicals.length > 0) {
          await tx.washPackageChemical.createMany({
            data: validatedChemicals.chemicals.map((chem) => ({
              washPackageId: id,
              chemicalSiteApplicationId: chem.chemicalSiteApplicationId,
              applicationOrder: chem.applicationOrder,
            })),
          });
        }
      }

      // Fetch complete package with chemicals
      return tx.washPackage.findUnique({
        where: { id },
        include: {
          chemicals: {
            include: {
              chemicalSiteApplication: {
                include: {
                  chemicalSiteConfig: {
                    include: {
                      chemicalOrgConfig: {
                        include: {
                          chemicalMaster: true,
                        },
                      },
                    },
                  },
                  injectorType: true,
                  tipType: true,
                },
              },
            },
            orderBy: { applicationOrder: 'asc' },
          },
        },
      });
    });

    return NextResponse.json(pkg);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/packages/[id]
 *
 * Delete (deactivate) a wash package
 *
 * WHY: Remove packages that are no longer offered
 *
 * BUSINESS LOGIC:
 * - Soft delete by setting isActive = false
 * - Preserves historical data for reporting
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only org admins and site managers can delete packages
     */
    const allowedRoles = ['ORG_ADMIN', 'SITE_MANAGER'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check package exists and user has access
    const existingPkg = await prisma.washPackage.findUnique({
      where: { id },
      include: {
        site: true,
      },
    });

    if (!existingPkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Verify access
    if (session.user.role === 'ORG_ADMIN') {
      if (existingPkg.site.organizationId !== session.user.organizationId) {
        return NextResponse.json(
          { error: 'Forbidden: Package not in your organization' },
          { status: 403 }
        );
      }
    }

    if (session.user.role === 'SITE_MANAGER') {
      const siteAccess = await prisma.userSiteAccess.findFirst({
        where: {
          userId: session.user.id,
          siteId: existingPkg.siteId,
        },
      });

      if (!siteAccess) {
        return NextResponse.json(
          { error: 'Forbidden: No access to this site' },
          { status: 403 }
        );
      }
    }

    // Check for hard delete query param
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      // Hard delete - remove from database
      await prisma.washPackage.delete({
        where: { id },
      });
    } else {
      // Soft delete - set isActive = false
      await prisma.washPackage.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
