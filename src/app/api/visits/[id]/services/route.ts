// ===========================================
// FILE: src/app/api/visits/[id]/services/route.ts
// PURPOSE: API endpoints for VisitLogServiceEntry management
// PRD REFERENCE: PRD Section 6.3 - Service Entries
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma, PrismaTransactionClient } from '@/lib/prisma';
import { serviceEntrySchema, bulkServiceEntriesSchema, updateServiceEntrySchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/visits/[id]/services
 *
 * Fetch all service entries for a visit
 *
 * WHY: View equipment changes recorded during a visit
 *
 * RETURNS: Array of VisitLogServiceEntry records
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

    // Fetch service entries
    const entries = await prisma.visitLogServiceEntry.findMany({
      where: { visitLogId: visitId },
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
        previousInjectorType: true,
        previousTipType: true,
        newInjectorType: true,
        newTipType: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching service entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visits/[id]/services
 *
 * Add service entries to a visit
 *
 * WHY: Record equipment changes (injector/tip replacements)
 *
 * BODY: ServiceEntryInput or BulkServiceEntriesInput
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
      const validatedData = bulkServiceEntriesSchema.parse(body);

      if (validatedData.entries.length === 0) {
        return NextResponse.json([], { status: 201 });
      }

      const entries = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        const created = [];
        for (const entry of validatedData.entries) {
          const newEntry = await tx.visitLogServiceEntry.create({
            data: {
              visitLogId: visitId,
              chemicalSiteApplicationId: entry.chemicalSiteApplicationId,
              equipmentChanged: entry.equipmentChanged,
              previousInjectorTypeId: entry.previousInjectorTypeId,
              previousTipTypeId: entry.previousTipTypeId,
              newInjectorTypeId: entry.newInjectorTypeId,
              newTipTypeId: entry.newTipTypeId,
              notes: entry.notes,
            },
            include: {
              chemicalSiteApplication: true,
              previousInjectorType: true,
              previousTipType: true,
              newInjectorType: true,
              newTipType: true,
            },
          });

          /**
           * Update application equipment if changed
           * WHY: Keep application equipment current after service
           */
          if (entry.equipmentChanged) {
            const updateData: any = {};
            if (entry.newInjectorTypeId) {
              updateData.injectorTypeId = entry.newInjectorTypeId;
            }
            if (entry.newTipTypeId) {
              updateData.tipTypeId = entry.newTipTypeId;
            }
            if (Object.keys(updateData).length > 0) {
              await tx.chemicalSiteApplication.update({
                where: { id: entry.chemicalSiteApplicationId },
                data: updateData,
              });
            }
          }

          created.push(newEntry);
        }
        return created;
      });

      return NextResponse.json(entries, { status: 201 });
    }

    // Single entry
    const validatedData = serviceEntrySchema.parse(body);

    const entry = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      const newEntry = await tx.visitLogServiceEntry.create({
        data: {
          visitLogId: visitId,
          chemicalSiteApplicationId: validatedData.chemicalSiteApplicationId,
          equipmentChanged: validatedData.equipmentChanged,
          previousInjectorTypeId: validatedData.previousInjectorTypeId,
          previousTipTypeId: validatedData.previousTipTypeId,
          newInjectorTypeId: validatedData.newInjectorTypeId,
          newTipTypeId: validatedData.newTipTypeId,
          notes: validatedData.notes,
        },
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
            },
          },
          previousInjectorType: true,
          previousTipType: true,
          newInjectorType: true,
          newTipType: true,
        },
      });

      // Update application equipment if changed
      if (validatedData.equipmentChanged) {
        const updateData: any = {};
        if (validatedData.newInjectorTypeId) {
          updateData.injectorTypeId = validatedData.newInjectorTypeId;
        }
        if (validatedData.newTipTypeId) {
          updateData.tipTypeId = validatedData.newTipTypeId;
        }
        if (Object.keys(updateData).length > 0) {
          await tx.chemicalSiteApplication.update({
            where: { id: validatedData.chemicalSiteApplicationId },
            data: updateData,
          });
        }
      }

      return newEntry;
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating service entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/visits/[id]/services
 *
 * Update a service entry
 *
 * WHY: Correct service records
 *
 * BODY: UpdateServiceEntryInput (must include entry id)
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
    const validatedData = updateServiceEntrySchema.parse(body);

    // Verify entry belongs to this visit
    const existingEntry = await prisma.visitLogServiceEntry.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingEntry || existingEntry.visitLogId !== visitId) {
      return NextResponse.json(
        { error: 'Entry not found in this visit' },
        { status: 404 }
      );
    }

    // Update entry
    const entry = await prisma.visitLogServiceEntry.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.equipmentChanged !== undefined && {
          equipmentChanged: validatedData.equipmentChanged,
        }),
        ...(validatedData.previousInjectorTypeId !== undefined && {
          previousInjectorTypeId: validatedData.previousInjectorTypeId,
        }),
        ...(validatedData.previousTipTypeId !== undefined && {
          previousTipTypeId: validatedData.previousTipTypeId,
        }),
        ...(validatedData.newInjectorTypeId !== undefined && {
          newInjectorTypeId: validatedData.newInjectorTypeId,
        }),
        ...(validatedData.newTipTypeId !== undefined && {
          newTipTypeId: validatedData.newTipTypeId,
        }),
        ...(validatedData.notes !== undefined && {
          notes: validatedData.notes,
        }),
      },
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
          },
        },
        previousInjectorType: true,
        previousTipType: true,
        newInjectorType: true,
        newTipType: true,
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

    console.error('Error updating service entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/visits/[id]/services
 *
 * Delete a service entry
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
    const existingEntry = await prisma.visitLogServiceEntry.findUnique({
      where: { id: entryId },
    });

    if (!existingEntry || existingEntry.visitLogId !== visitId) {
      return NextResponse.json(
        { error: 'Entry not found in this visit' },
        { status: 404 }
      );
    }

    // Delete entry
    await prisma.visitLogServiceEntry.delete({
      where: { id: entryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service entry:', error);
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
