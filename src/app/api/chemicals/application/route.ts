// ===========================================
// FILE: src/app/api/chemicals/application/route.ts
// PURPOSE: API endpoints for ChemicalSiteApplication (tank assignments with injector/tip)
// PRD REFERENCE: PRD Section 3.3 - Chemical Site Applications
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Validation schema for chemical site application
 */
const chemicalApplicationSchema = z.object({
  chemicalSiteConfigId: z.string(),
  tankId: z.string().min(1, 'Tank ID is required'),
  injectorTypeId: z.string(),
  tipTypeId: z.string(),
});

/**
 * GET /api/chemicals/application
 *
 * Fetch chemical applications for a site
 *
 * WHY: Sites need to see all tank assignments with equipment details
 *
 * QUERY PARAMS:
 * - siteId: Required
 *
 * RETURNS: Array of ChemicalSiteApplication records
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

    // Fetch applications with full details
    const applications = await prisma.chemicalSiteApplication.findMany({
      where: {
        chemicalSiteConfig: {
          siteId: siteId,
        },
      },
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
      orderBy: { applicationNumber: 'asc' },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chemicals/application
 *
 * Create chemical application (assign to tank with equipment)
 *
 * WHY: Sites need to assign chemicals to specific tanks with
 * injector and tip configurations for accurate GPM-weighted calculations.
 *
 * BUSINESS LOGIC:
 * - Unique constraint: (chemicalSiteConfigId, tankId)
 * - One chemical per tank
 * - Requires injector and tip selection
 * - Equipment can be changed via visit logs
 *
 * BODY: ChemicalSiteApplication data
 * RETURNS: Created ChemicalSiteApplication record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only site managers can create applications
     */
    if (session.user.role !== 'SITE_MANAGER') {
      return NextResponse.json(
        {
          error: 'Forbidden: Only site managers can create tank applications',
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = chemicalApplicationSchema.parse(body);

    /**
     * Verify site config exists and user has access
     */
    const siteConfig = await prisma.chemicalSiteConfig.findUnique({
      where: { id: validatedData.chemicalSiteConfigId },
      include: { site: true },
    });

    if (!siteConfig) {
      return NextResponse.json(
        { error: 'Site chemical configuration not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this site
    const siteUser = await prisma.siteUser.findFirst({
      where: {
        userId: session.user.id,
        siteId: siteConfig.siteId,
      },
    });

    if (!siteUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    /**
     * Verify injector and tip types exist
     */
    const [injectorType, tipType] = await Promise.all([
      prisma.injectorType.findUnique({
        where: { id: validatedData.injectorTypeId },
      }),
      prisma.tipType.findUnique({
        where: { id: validatedData.tipTypeId },
      }),
    ]);

    if (!injectorType) {
      return NextResponse.json(
        { error: 'Injector type not found' },
        { status: 404 }
      );
    }

    if (!tipType) {
      return NextResponse.json(
        { error: 'Tip type not found' },
        { status: 404 }
      );
    }

    // Create application
    const application = await prisma.chemicalSiteApplication.create({
      data: validatedData,
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
    });

    return NextResponse.json(application, { status: 201 });
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
          error: 'This tank already has a chemical assigned',
        },
        { status: 409 }
      );
    }

    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
