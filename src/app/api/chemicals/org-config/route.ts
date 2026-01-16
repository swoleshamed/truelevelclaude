// ===========================================
// FILE: src/app/api/chemicals/org-config/route.ts
// PURPOSE: API endpoints for ChemicalOrgConfig (Organization-level chemical configuration)
// PRD REFERENCE: PRD Section 3.2 - Organization Chemical Configuration
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Validation schema for chemical org config
 * PRD REFERENCE: Technical Spec - ChemicalOrgConfig schema
 */
const chemicalOrgConfigSchema = z.object({
  chemicalMasterId: z.string(),
  organizationId: z.string(),
  containerType: z.enum([
    'HOLDING_TANK_10GAL',
    'HOLDING_TANK_15GAL',
    'HOLDING_TANK_20GAL',
    'HOLDING_TANK_CUSTOM',
    'JUG_1GAL',
    'JUG_2_5GAL',
    'PAIL_5GAL',
    'DRUM_15GAL',
    'DRUM_30GAL',
    'DRUM_55GAL',
  ]),
  containerCost: z.number().min(0, 'Cost must be positive'),
});

/**
 * GET /api/chemicals/org-config
 *
 * Fetch chemical configurations for an organization
 *
 * WHY: Organizations need to see which chemicals are available
 * with pricing and container options configured by their distributor.
 *
 * QUERY PARAMS:
 * - organizationId: Required
 *
 * RETURNS: Array of ChemicalOrgConfig records with chemical master details
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    /**
     * Permission check
     * WHY: Users can only view configs for their own organization
     */
    if (
      session.user.role === 'ORG_ADMIN' ||
      session.user.role === 'SITE_MANAGER' ||
      session.user.role === 'SITE_USER'
    ) {
      if (organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Fetch org configs
    const orgConfigs = await prisma.chemicalOrgConfig.findMany({
      where: { organizationId },
      include: {
        chemicalMaster: true,
        organization: { select: { id: true, name: true } },
      },
      orderBy: [
        { chemicalMaster: { type: 'asc' } },
        { chemicalMaster: { name: 'asc' } },
      ],
    });

    return NextResponse.json(orgConfigs);
  } catch (error) {
    console.error('Error fetching org configs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chemicals/org-config
 *
 * Create organization-level chemical configuration
 *
 * WHY: Distributors configure pricing and container types for each
 * organization. This determines what options are available to sites.
 *
 * BUSINESS LOGIC:
 * - Unique constraint: (chemicalMasterId, organizationId, containerType)
 * - Multiple container types allowed per chemical
 * - Each container type has its own pricing
 *
 * BODY: ChemicalOrgConfig data
 * RETURNS: Created ChemicalOrgConfig record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only distributor admins can create org configs
     */
    if (session.user.role !== 'DISTRIBUTOR_ADMIN') {
      return NextResponse.json(
        {
          error:
            'Forbidden: Only distributor admins can create organization chemical configurations',
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = chemicalOrgConfigSchema.parse(body);

    /**
     * Verify chemical master belongs to user's distributor
     * WHY: Can't configure chemicals from other distributors
     */
    const chemicalMaster = await prisma.chemicalMaster.findUnique({
      where: { id: validatedData.chemicalMasterId },
    });

    if (!chemicalMaster) {
      return NextResponse.json(
        { error: 'Chemical master not found' },
        { status: 404 }
      );
    }

    if (chemicalMaster.distributorId !== session.user.distributorId) {
      return NextResponse.json(
        {
          error:
            'Forbidden: Cannot configure chemicals from other distributors',
        },
        { status: 403 }
      );
    }

    /**
     * Verify organization belongs to user's distributor
     * WHY: Can't configure for organizations not serviced by this distributor
     */
    const organization = await prisma.organization.findUnique({
      where: { id: validatedData.organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    if (organization.distributorId !== session.user.distributorId) {
      return NextResponse.json(
        {
          error: 'Forbidden: Organization not serviced by your distributor',
        },
        { status: 403 }
      );
    }

    // Create org config
    const orgConfig = await prisma.chemicalOrgConfig.create({
      data: validatedData,
      include: {
        chemicalMaster: true,
        organization: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(orgConfig, { status: 201 });
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
            'Configuration already exists for this chemical, organization, and container type',
        },
        { status: 409 }
      );
    }

    console.error('Error creating org config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
