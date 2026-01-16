// ===========================================
// FILE: src/app/api/packages/route.ts
// PURPOSE: API endpoints for WashPackage (Site-level packages)
// PRD REFERENCE: PRD Section 5.2 - Site Packages
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { washPackageSchema, applyTemplateSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/packages
 *
 * Fetch wash packages for a site
 *
 * WHY: Sites need to view and manage their wash packages.
 * Packages determine which chemicals are used in each wash tier.
 *
 * QUERY PARAMS:
 * - siteId (required): Filter by specific site
 * - includeChemicals (optional): Include chemical assignments
 *
 * RETURNS: Array of WashPackage records
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
    const siteId = searchParams.get('siteId');
    const includeChemicals = searchParams.get('includeChemicals') === 'true';

    if (!siteId) {
      return NextResponse.json(
        { error: 'siteId is required' },
        { status: 400 }
      );
    }

    /**
     * Verify user has access to this site
     * WHY: Only authorized users can view site packages
     */
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        organization: {
          select: { id: true, distributorId: true },
        },
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Check access based on role
    const hasAccess =
      // Distributor users can view client sites
      ((session.user.role === 'DISTRIBUTOR_ADMIN' ||
        session.user.role === 'DISTRIBUTOR_USER') &&
        site.organization.distributorId === session.user.distributorId) ||
      // Org users can view their sites
      (session.user.role === 'ORG_ADMIN' &&
        site.organizationId === session.user.organizationId) ||
      // Site users need explicit access (checked via UserSiteAccess)
      (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER');

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    // For site roles, verify they have access to this specific site
    if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
      const siteAccess = await prisma.userSiteAccess.findFirst({
        where: {
          userId: session.user.id,
          siteId,
        },
      });

      if (!siteAccess) {
        return NextResponse.json(
          { error: 'Forbidden: No access to this site' },
          { status: 403 }
        );
      }
    }

    // Fetch packages
    const packages = await prisma.washPackage.findMany({
      where: {
        siteId,
        isActive: true,
      },
      include: includeChemicals
        ? {
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
          }
        : undefined,
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/packages
 *
 * Create a new wash package or apply template
 *
 * WHY: Sites need to create packages either manually or from templates
 *
 * BODY: WashPackageInput OR ApplyTemplateInput
 * RETURNS: Created WashPackage(s)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if this is a template application request
    if (body.templateId) {
      return applyTemplate(session, body);
    }

    // Otherwise, create a single package
    return createPackage(session, body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a single wash package
 */
async function createPackage(session: any, body: any) {
  const validatedData = washPackageSchema.parse(body);

  /**
   * Permission check
   * WHY: Only org admins and site managers can create packages
   */
  const allowedRoles = ['ORG_ADMIN', 'SITE_MANAGER'];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: 'Forbidden: Insufficient permissions to create packages' },
      { status: 403 }
    );
  }

  // Verify user has access to this site
  const site = await prisma.site.findUnique({
    where: { id: validatedData.siteId },
  });

  if (!site) {
    return NextResponse.json(
      { error: 'Site not found' },
      { status: 404 }
    );
  }

  if (session.user.role === 'ORG_ADMIN') {
    if (site.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: 'Forbidden: Site not in your organization' },
        { status: 403 }
      );
    }
  }

  if (session.user.role === 'SITE_MANAGER') {
    const siteAccess = await prisma.userSiteAccess.findFirst({
      where: {
        userId: session.user.id,
        siteId: validatedData.siteId,
      },
    });

    if (!siteAccess) {
      return NextResponse.json(
        { error: 'Forbidden: No access to this site' },
        { status: 403 }
      );
    }
  }

  // Create package
  const pkg = await prisma.washPackage.create({
    data: validatedData,
  });

  return NextResponse.json(pkg, { status: 201 });
}

/**
 * Apply a template to a site
 * Creates packages from all template items
 */
async function applyTemplate(session: any, body: any) {
  const validatedData = applyTemplateSchema.parse(body);

  /**
   * Permission check
   * WHY: Only org admins can apply templates
   */
  if (session.user.role !== 'ORG_ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Only organization admins can apply templates' },
      { status: 403 }
    );
  }

  // Verify template exists and user has access
  const template = await prisma.washPackageTemplate.findUnique({
    where: { id: validatedData.templateId },
    include: {
      items: {
        orderBy: { displayOrder: 'asc' },
        include: {
          chemicals: {
            orderBy: { applicationOrder: 'asc' },
          },
        },
      },
    },
  });

  if (!template) {
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    );
  }

  if (template.organizationId !== session.user.organizationId) {
    return NextResponse.json(
      { error: 'Forbidden: Template not in your organization' },
      { status: 403 }
    );
  }

  // Verify site exists and user has access
  const site = await prisma.site.findUnique({
    where: { id: validatedData.siteId },
  });

  if (!site) {
    return NextResponse.json(
      { error: 'Site not found' },
      { status: 404 }
    );
  }

  if (site.organizationId !== session.user.organizationId) {
    return NextResponse.json(
      { error: 'Forbidden: Site not in your organization' },
      { status: 403 }
    );
  }

  // Get site's chemical applications for mapping
  const siteApplications = await prisma.chemicalSiteApplication.findMany({
    where: {
      chemicalSiteConfig: {
        siteId: validatedData.siteId,
      },
    },
    include: {
      chemicalSiteConfig: true,
    },
  });

  // Create mapping from org config to site application
  const configToApplication = new Map<string, string>();
  for (const app of siteApplications) {
    configToApplication.set(
      app.chemicalSiteConfig.chemicalOrgConfigId,
      app.id
    );
  }

  // Create packages from template in a transaction
  const packages = await prisma.$transaction(async (tx) => {
    const createdPackages = [];

    for (const item of template.items) {
      // Create the package
      const pkg = await tx.washPackage.create({
        data: {
          siteId: validatedData.siteId,
          templateItemId: item.id,
          name: item.name,
          displayOrder: item.displayOrder,
          singleWashPrice: item.singleWashPrice,
          membershipPrice: item.membershipPrice,
          description: item.description,
          isFromTemplate: true,
        },
      });

      // Map template chemicals to site applications
      const chemicalAssignments = [];
      for (const chem of item.chemicals) {
        const applicationId = configToApplication.get(chem.chemicalOrgConfigId);
        if (applicationId) {
          chemicalAssignments.push({
            washPackageId: pkg.id,
            chemicalSiteApplicationId: applicationId,
            applicationOrder: chem.applicationOrder,
          });
        }
      }

      // Create chemical assignments
      if (chemicalAssignments.length > 0) {
        await tx.washPackageChemical.createMany({
          data: chemicalAssignments,
        });
      }

      createdPackages.push(pkg);
    }

    return createdPackages;
  });

  return NextResponse.json(packages, { status: 201 });
}
