// ===========================================
// FILE: src/app/api/visits/[id]/route.ts
// PURPOSE: API endpoints for single VisitLog operations
// PRD REFERENCE: PRD Section 6 - Visit Logging
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateVisitLogSchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/visits/[id]
 *
 * Fetch a single visit log with all entries
 *
 * WHY: View complete visit details including chemical and service entries
 *
 * RETURNS: VisitLog with all related data
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch visit with all entries
    const visit = await prisma.visitLog.findUnique({
      where: { id },
      include: {
        site: {
          include: {
            organization: {
              select: { id: true, name: true, distributorId: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        chemicalEntries: {
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
        },
        serviceEntries: {
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
          orderBy: { createdAt: 'asc' },
        },
        scheduledVisit: {
          select: { id: true, scheduledDate: true, status: true },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    /**
     * Permission check
     * WHY: Only authorized users can view visit details
     */
    const hasAccess = await verifyVisitAccess(session, visit);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    /**
     * Filter private notes based on role
     * WHY: Private notes are only visible to distributors
     */
    const filteredVisit = {
      ...visit,
      privateNotes:
        session.user.role === 'DISTRIBUTOR_ADMIN' ||
        session.user.role === 'DISTRIBUTOR_USER'
          ? visit.privateNotes
          : null,
      privateServiceNotes:
        session.user.role === 'DISTRIBUTOR_ADMIN' ||
        session.user.role === 'DISTRIBUTOR_USER'
          ? visit.privateServiceNotes
          : null,
    };

    return NextResponse.json(filteredVisit);
  } catch (error) {
    console.error('Error fetching visit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/visits/[id]
 *
 * Update a visit log
 *
 * WHY: Update visit notes and date
 *
 * BODY: UpdateVisitLogInput
 * RETURNS: Updated VisitLog
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch existing visit
    const existingVisit = await prisma.visitLog.findUnique({
      where: { id },
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

    if (!existingVisit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    // Verify access
    const hasAccess = await verifyVisitAccess(session, existingVisit);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    /**
     * Check edit permissions
     * WHY: Only the creator or admins can edit visits
     */
    const canEdit =
      session.user.id === existingVisit.userId ||
      session.user.role === 'DISTRIBUTOR_ADMIN' ||
      session.user.role === 'ORG_ADMIN';

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Forbidden: Only the visit creator or admins can edit' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateVisitLogSchema.parse(body);

    // Update visit
    const visit = await prisma.visitLog.update({
      where: { id },
      data: {
        ...(validatedData.visitDate && {
          visitDate: new Date(validatedData.visitDate),
        }),
        ...(validatedData.publicNotes !== undefined && {
          publicNotes: validatedData.publicNotes,
        }),
        ...(validatedData.privateNotes !== undefined && {
          privateNotes: validatedData.privateNotes,
        }),
        ...(validatedData.serviceNotes !== undefined && {
          serviceNotes: validatedData.serviceNotes,
        }),
        ...(validatedData.privateServiceNotes !== undefined && {
          privateServiceNotes: validatedData.privateServiceNotes,
        }),
      },
      include: {
        site: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(visit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating visit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/visits/[id]
 *
 * Delete a visit log and all entries
 *
 * WHY: Allow removal of incorrect or test visits
 *
 * BUSINESS LOGIC:
 * - Hard delete - removes visit and all related entries
 * - Only creator or admins can delete
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch existing visit
    const existingVisit = await prisma.visitLog.findUnique({
      where: { id },
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

    if (!existingVisit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    // Verify access
    const hasAccess = await verifyVisitAccess(session, existingVisit);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    /**
     * Check delete permissions
     * WHY: Only the creator or admins can delete visits
     */
    const canDelete =
      session.user.id === existingVisit.userId ||
      session.user.role === 'DISTRIBUTOR_ADMIN' ||
      session.user.role === 'ORG_ADMIN';

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Forbidden: Only the visit creator or admins can delete' },
        { status: 403 }
      );
    }

    // Delete visit (cascades to entries)
    await prisma.visitLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting visit:', error);
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
  // Check based on role
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
