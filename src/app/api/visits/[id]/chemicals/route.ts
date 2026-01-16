// ===========================================
// FILE: src/app/api/visits/[id]/chemicals/route.ts
// PURPOSE: API endpoints for VisitLogChemicalEntry management
// PRD REFERENCE: PRD Section 6.2 - Chemical Entries
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { chemicalEntrySchema, bulkChemicalEntriesSchema, updateChemicalEntrySchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/visits/[id]/chemicals
 *
 * Fetch all chemical entries for a visit
 *
 * WHY: View inventory measurements for a specific visit
 *
 * RETURNS: Array of VisitLogChemicalEntry records
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: visitId } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify visit exists and user has access
    const visit = await prisma.visitLog.findUnique({
      where: { id: visitId },
      include: {
        site: {
          include: {
            organization: {
              select: { distributorId: true },
            },
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    const hasAccess = await verifyVisitAccess(session, visit);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    // Fetch chemical entries
    const entries = await prisma.visitLogChemicalEntry.findMany({
      where: { visitLogId: visitId },
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
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching chemical entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visits/[id]/chemicals
 *
 * Add chemical entries to a visit
 *
 * WHY: Record inventory measurements during visits
 *
 * BODY: ChemicalEntryInput or BulkChemicalEntriesInput
 * RETURNS: Created entries
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: visitId } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify visit exists and user has access
    const visit = await prisma.visitLog.findUnique({
      where: { id: visitId },
      include: {
        site: {
          include: {
            organization: {
              select: { distributorId: true },
            },
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    const hasAccess = await verifyVisitAccess(session, visit);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    /**
     * Check edit permissions
     * WHY: Only the creator or admins can add entries
     */
    const canEdit =
      session.user.id === visit.userId ||
      session.user.role === 'DISTRIBUTOR_ADMIN' ||
      session.user.role === 'ORG_ADMIN';

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Forbidden: Only the visit creator or admins can add entries' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check if this is a bulk request
    if (body.entries) {
      const validatedData = bulkChemicalEntriesSchema.parse(body);

      const entries = await prisma.visitLogChemicalEntry.createManyAndReturn({
        data: validatedData.entries.map((entry) => ({
          visitLogId: visitId,
          chemicalSiteConfigId: entry.chemicalSiteConfigId,
          entryMethod: entry.entryMethod,
          levelGallons: entry.levelGallons,
          levelInches: entry.levelInches,
          backstockCount: entry.backstockCount,
          backstockGallons: entry.backstockGallons,
          deliveryReceived: entry.deliveryReceived,
          deliveryCount: entry.deliveryCount,
          deliveryGallons: entry.deliveryGallons,
          totalOnHandGallons: entry.totalOnHandGallons,
          calculatedUsageGallons: entry.calculatedUsageGallons,
          notes: entry.notes,
        })),
      });

      return NextResponse.json(entries, { status: 201 });
    }

    // Single entry
    const validatedData = chemicalEntrySchema.parse(body);

    const entry = await prisma.visitLogChemicalEntry.create({
      data: {
        visitLogId: visitId,
        chemicalSiteConfigId: validatedData.chemicalSiteConfigId,
        entryMethod: validatedData.entryMethod,
        levelGallons: validatedData.levelGallons,
        levelInches: validatedData.levelInches,
        backstockCount: validatedData.backstockCount,
        backstockGallons: validatedData.backstockGallons,
        deliveryReceived: validatedData.deliveryReceived,
        deliveryCount: validatedData.deliveryCount,
        deliveryGallons: validatedData.deliveryGallons,
        totalOnHandGallons: validatedData.totalOnHandGallons,
        calculatedUsageGallons: validatedData.calculatedUsageGallons,
        notes: validatedData.notes,
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
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating chemical entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/visits/[id]/chemicals
 *
 * Update a chemical entry
 *
 * WHY: Correct inventory measurements
 *
 * BODY: UpdateChemicalEntryInput (must include entry id)
 * RETURNS: Updated entry
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: visitId } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify visit exists
    const visit = await prisma.visitLog.findUnique({
      where: { id: visitId },
      include: {
        site: {
          include: {
            organization: {
              select: { distributorId: true },
            },
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    const hasAccess = await verifyVisitAccess(session, visit);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    const canEdit =
      session.user.id === visit.userId ||
      session.user.role === 'DISTRIBUTOR_ADMIN' ||
      session.user.role === 'ORG_ADMIN';

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Forbidden: Only the visit creator or admins can edit entries' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateChemicalEntrySchema.parse(body);

    // Verify entry belongs to this visit
    const existingEntry = await prisma.visitLogChemicalEntry.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingEntry || existingEntry.visitLogId !== visitId) {
      return NextResponse.json(
        { error: 'Entry not found in this visit' },
        { status: 404 }
      );
    }

    // Update entry
    const entry = await prisma.visitLogChemicalEntry.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.entryMethod !== undefined && {
          entryMethod: validatedData.entryMethod,
        }),
        ...(validatedData.levelGallons !== undefined && {
          levelGallons: validatedData.levelGallons,
        }),
        ...(validatedData.levelInches !== undefined && {
          levelInches: validatedData.levelInches,
        }),
        ...(validatedData.backstockCount !== undefined && {
          backstockCount: validatedData.backstockCount,
        }),
        ...(validatedData.backstockGallons !== undefined && {
          backstockGallons: validatedData.backstockGallons,
        }),
        ...(validatedData.deliveryReceived !== undefined && {
          deliveryReceived: validatedData.deliveryReceived,
        }),
        ...(validatedData.deliveryCount !== undefined && {
          deliveryCount: validatedData.deliveryCount,
        }),
        ...(validatedData.deliveryGallons !== undefined && {
          deliveryGallons: validatedData.deliveryGallons,
        }),
        ...(validatedData.totalOnHandGallons !== undefined && {
          totalOnHandGallons: validatedData.totalOnHandGallons,
        }),
        ...(validatedData.calculatedUsageGallons !== undefined && {
          calculatedUsageGallons: validatedData.calculatedUsageGallons,
        }),
        ...(validatedData.notes !== undefined && {
          notes: validatedData.notes,
        }),
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
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating chemical entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/visits/[id]/chemicals
 *
 * Delete a chemical entry
 *
 * WHY: Remove incorrect entries
 *
 * QUERY: entryId - the entry to delete
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: visitId } = await context.params;
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json(
        { error: 'entryId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify visit exists
    const visit = await prisma.visitLog.findUnique({
      where: { id: visitId },
      include: {
        site: {
          include: {
            organization: {
              select: { distributorId: true },
            },
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    const hasAccess = await verifyVisitAccess(session, visit);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    const canEdit =
      session.user.id === visit.userId ||
      session.user.role === 'DISTRIBUTOR_ADMIN' ||
      session.user.role === 'ORG_ADMIN';

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Forbidden: Only the visit creator or admins can delete entries' },
        { status: 403 }
      );
    }

    // Verify entry belongs to this visit
    const existingEntry = await prisma.visitLogChemicalEntry.findUnique({
      where: { id: entryId },
    });

    if (!existingEntry || existingEntry.visitLogId !== visitId) {
      return NextResponse.json(
        { error: 'Entry not found in this visit' },
        { status: 404 }
      );
    }

    // Delete entry
    await prisma.visitLogChemicalEntry.delete({
      where: { id: entryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chemical entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify user has permission to access a visit
 */
async function verifyVisitAccess(session: any, visit: any): Promise<boolean> {
  if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
    return visit.site.organization.distributorId === session.user.distributorId;
  }

  if (session.user.role === 'ORG_ADMIN') {
    return visit.site.organizationId === session.user.organizationId;
  }

  if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
    const siteAccess = await prisma.userSiteAccess.findFirst({
      where: {
        userId: session.user.id,
        siteId: visit.siteId,
      },
    });
    return !!siteAccess;
  }

  return false;
}
