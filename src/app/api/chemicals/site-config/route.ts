// ===========================================
// FILE: src/app/api/chemicals/site-config/route.ts
// PURPOSE: API endpoints for ChemicalSiteConfig (Site-level chemical configuration)
// PRD REFERENCE: PRD Section 3.3 - Site Chemical Configuration
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Validation schema for chemical site config
 */
const chemicalSiteConfigSchema = z.object({
  chemicalOrgConfigId: z.string(),
  siteId: z.string(),
  alertThresholdGallons: z.number().min(0).optional().nullable(),
});

/**
 * GET /api/chemicals/site-config
 *
 * Fetch chemical configurations for a site
 *
 * WHY: Sites need to see which chemicals are configured with
 * alert thresholds and available for tank assignment.
 *
 * QUERY PARAMS:
 * - siteId: Required
 *
 * RETURNS: Array of ChemicalSiteConfig records with full chemical details
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json(
        { error: 'siteId is required' },
        { status: 400 }
      );
    }

    /**
     * Permission check
     * WHY: Verify user has access to this site
     */
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check access based on role
    if (session.user.role === 'ORG_ADMIN') {
      if (site.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (
      session.user.role === 'SITE_MANAGER' ||
      session.user.role === 'SITE_USER'
    ) {
      // Verify site assignment
      const siteUser = await prisma.userSiteAccess.findFirst({
        where: {
          userId: session.user.id,
          siteId: siteId,
        },
      });

      if (!siteUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Fetch site configs with full chemical details
    const siteConfigs = await prisma.chemicalSiteConfig.findMany({
      where: { siteId },
      include: {
        chemicalOrgConfig: {
          include: {
            chemicalMaster: true,
          },
        },
        site: { select: { id: true, name: true } },
        applications: {
          include: {
            injectorType: true,
            tipType: true,
          },
        },
      },
      orderBy: [
        { chemicalOrgConfig: { chemicalMaster: { type: 'asc' } } },
        { chemicalOrgConfig: { chemicalMaster: { name: 'asc' } } },
      ],
    });

    return NextResponse.json(siteConfigs);
  } catch (error) {
    console.error('Error fetching site configs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chemicals/site-config
 *
 * Create site-level chemical configuration
 *
 * WHY: Sites need to configure which org-level chemicals they use
 * and set custom alert thresholds for inventory management.
 *
 * BUSINESS LOGIC:
 * - Unique constraint: (chemicalOrgConfigId, siteId)
 * - Site can only configure chemicals from their org's catalog
 * - Alert threshold determines when LOW_STOCK/CRITICAL status triggers
 *
 * BODY: ChemicalSiteConfig data
 * RETURNS: Created ChemicalSiteConfig record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only org admins and site managers can create site configs
     */
    if (
      session.user.role !== 'ORG_ADMIN' &&
      session.user.role !== 'SITE_MANAGER'
    ) {
      return NextResponse.json(
        {
          error:
            'Forbidden: Only organization admins and site managers can configure site chemicals',
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = chemicalSiteConfigSchema.parse(body);

    /**
     * Verify org config exists and belongs to site's organization
     * WHY: Can't configure chemicals not available to this org
     */
    const orgConfig = await prisma.chemicalOrgConfig.findUnique({
      where: { id: validatedData.chemicalOrgConfigId },
      include: {
        organization: true,
      },
    });

    if (!orgConfig) {
      return NextResponse.json(
        { error: 'Organization chemical configuration not found' },
        { status: 404 }
      );
    }

    /**
     * Verify site belongs to same organization
     * WHY: Can't configure site with chemicals from different org
     */
    const site = await prisma.site.findUnique({
      where: { id: validatedData.siteId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (site.organizationId !== orgConfig.organizationId) {
      return NextResponse.json(
        {
          error:
            'Forbidden: Site and chemical configuration must be in same organization',
        },
        { status: 403 }
      );
    }

    /**
     * Verify user has access to this site
     * WHY: Can't configure sites user doesn't have access to
     */
    if (session.user.role === 'ORG_ADMIN') {
      if (site.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (session.user.role === 'SITE_MANAGER') {
      const siteUser = await prisma.userSiteAccess.findFirst({
        where: {
          userId: session.user.id,
          siteId: validatedData.siteId,
        },
      });

      if (!siteUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Create site config
    const siteConfig = await prisma.chemicalSiteConfig.create({
      data: validatedData,
      include: {
        chemicalOrgConfig: {
          include: {
            chemicalMaster: true,
          },
        },
        site: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(siteConfig, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle unique constraint violation
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        {
          error:
            'Configuration already exists for this chemical and site',
        },
        { status: 409 }
      );
    }

    console.error('Error creating site config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
