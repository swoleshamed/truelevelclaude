// ===========================================
// FILE: src/app/api/chemicals/route.ts
// PURPOSE: API endpoints for ChemicalMaster (Distributor catalog)
// PRD REFERENCE: PRD Section 3.1 - Chemical Catalog
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/chemicals
 *
 * Fetch chemical master catalog for a distributor
 *
 * WHY: Distributors need to view their entire chemical catalog.
 * Only accessible to distributor users.
 *
 * QUERY PARAMS:
 * - distributorId (optional): Filter by specific distributor
 *
 * RETURNS: Array of ChemicalMaster records
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
    const distributorId = searchParams.get('distributorId');

    /**
     * Permission check
     * WHY: Only distributors can view chemical master catalog
     */
    if (
      session.user.role !== 'DISTRIBUTOR_ADMIN' &&
      session.user.role !== 'DISTRIBUTOR_USER'
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Only distributors can access chemical catalog' },
        { status: 403 }
      );
    }

    /**
     * Determine which distributor to query
     * WHY: Admin can view any distributor, users see their own
     */
    let queryDistributorId = distributorId;
    if (!queryDistributorId) {
      queryDistributorId = session.user.distributorId;
    }

    if (!queryDistributorId) {
      return NextResponse.json(
        { error: 'No distributor ID provided' },
        { status: 400 }
      );
    }

    // Fetch chemicals
    const chemicals = await prisma.chemicalMaster.findMany({
      where: {
        distributorId: queryDistributorId,
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(chemicals);
  } catch (error) {
    console.error('Error fetching chemicals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * ChemicalType enum values matching Prisma schema
 */
const chemicalTypeValues = [
  'PREP_SOAP',
  'HIGH_PH_PRESOAK',
  'LOW_PH_PRESOAK',
  'WHEEL_TIRE_CLEANER',
  'FOAM_DETERGENT',
  'FRAGRANCE',
  'TRI_COLOR',
  'PROTECTANT',
  'DRY_AGENT',
  'TIRE_SHINE',
  'OTHER',
] as const;

/**
 * Validation schema for creating/updating chemical master
 * PRD REFERENCE: Technical Spec - ChemicalMaster schema
 */
const chemicalMasterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(chemicalTypeValues),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
  distributorId: z.string(),
});

/**
 * POST /api/chemicals
 *
 * Create a new chemical in distributor catalog
 *
 * WHY: Distributors need to add new chemicals to their catalog.
 * This creates the master template that organizations will configure.
 *
 * BODY: ChemicalMaster data
 * RETURNS: Created ChemicalMaster record
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
     * WHY: Only distributor admins can create chemicals
     */
    if (session.user.role !== 'DISTRIBUTOR_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only distributor admins can create chemicals' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = chemicalMasterSchema.parse(body);

    /**
     * Verify user owns the distributor
     * WHY: Prevent creating chemicals for other distributors
     */
    if (validatedData.distributorId !== session.user.distributorId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot create chemicals for other distributors' },
        { status: 403 }
      );
    }

    // Create chemical
    const chemical = await prisma.chemicalMaster.create({
      data: validatedData,
    });

    return NextResponse.json(chemical, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating chemical:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
