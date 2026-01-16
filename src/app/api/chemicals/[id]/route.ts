// ===========================================
// FILE: src/app/api/chemicals/[id]/route.ts
// PURPOSE: API endpoints for individual ChemicalMaster operations
// PRD REFERENCE: PRD Section 3.1 - Chemical Catalog
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Validation schema for updating chemical master
 */
const chemicalMasterUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z
    .enum([
      'PREP_SOAP',
      'HIGH_PH_PRESOAK',
      'LOW_PH_PRESOAK',
      'TIRE_CLEANER',
      'WHEEL_CLEANER',
      'TRIPLE_FOAM',
      'TRIPLE_FOAM_POLISH',
      'CLEARCOAT_PROTECTANT',
      'CERAMIC_SEALANT',
      'TIRE_SHINE',
      'SPOT_FREE_RINSE',
      'DRYER_AGENT',
      'BUG_PREP',
      'WHEEL_MAGIC',
      'RAIN_X',
      'OTHER',
    ])
    .optional(),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
});

/**
 * GET /api/chemicals/[id]
 *
 * Fetch a single chemical master record
 *
 * WHY: View details of a specific chemical
 *
 * RETURNS: ChemicalMaster record with related configurations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const chemical = await prisma.chemicalMaster.findUnique({
      where: { id },
      include: {
        orgConfigs: {
          include: {
            organization: { select: { id: true, name: true } },
            siteConfigs: {
              include: {
                site: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!chemical) {
      return NextResponse.json(
        { error: 'Chemical not found' },
        { status: 404 }
      );
    }

    /**
     * Permission check
     * WHY: Verify user has access to this distributor's chemicals
     */
    if (
      session.user.role === 'DISTRIBUTOR_ADMIN' ||
      session.user.role === 'DISTRIBUTOR_USER'
    ) {
      if (chemical.distributorId !== session.user.distributorId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(chemical);
  } catch (error) {
    console.error('Error fetching chemical:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/chemicals/[id]
 *
 * Update a chemical master record
 *
 * WHY: Distributors need to update chemical details
 * (name, type, manufacturer, description)
 *
 * BODY: Partial ChemicalMaster data
 * RETURNS: Updated ChemicalMaster record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only distributor admins can update chemicals
     */
    if (session.user.role !== 'DISTRIBUTOR_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only distributor admins can update chemicals' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify chemical exists and belongs to user's distributor
    const existingChemical = await prisma.chemicalMaster.findUnique({
      where: { id: id },
    });

    if (!existingChemical) {
      return NextResponse.json(
        { error: 'Chemical not found' },
        { status: 404 }
      );
    }

    if (existingChemical.distributorId !== session.user.distributorId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot update chemicals from other distributors' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = chemicalMasterUpdateSchema.parse(body);

    // Update chemical
    const updatedChemical = await prisma.chemicalMaster.update({
      where: { id: id },
      data: validatedData,
    });

    return NextResponse.json(updatedChemical);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating chemical:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chemicals/[id]
 *
 * Delete a chemical master record
 *
 * WHY: Distributors need to remove discontinued chemicals
 *
 * BUSINESS LOGIC:
 * - Cascade deletes all org configs, site configs, and applications
 * - This is intentional (defined in Prisma schema)
 * - Cannot delete if used in visit logs (referential integrity)
 *
 * RETURNS: Success message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only distributor admins can delete chemicals
     */
    if (session.user.role !== 'DISTRIBUTOR_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only distributor admins can delete chemicals' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify chemical exists and belongs to user's distributor
    const existingChemical = await prisma.chemicalMaster.findUnique({
      where: { id },
    });

    if (!existingChemical) {
      return NextResponse.json(
        { error: 'Chemical not found' },
        { status: 404 }
      );
    }

    if (existingChemical.distributorId !== session.user.distributorId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete chemicals from other distributors' },
        { status: 403 }
      );
    }

    /**
     * Delete chemical
     * WHY: Cascade delete will remove all related configs and applications
     * If chemical is referenced in visit logs, this will fail (database constraint)
     */
    try {
      await prisma.chemicalMaster.delete({
        where: { id: id },
      });

      return NextResponse.json({ message: 'Chemical deleted successfully' });
    } catch (error: any) {
      // Check if deletion failed due to foreign key constraint
      if (error.code === 'P2003') {
        return NextResponse.json(
          {
            error:
              'Cannot delete chemical: It is referenced in visit logs. Archive it instead.',
          },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting chemical:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
