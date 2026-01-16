// ===========================================
// FILE: src/app/api/visits/route.ts
// PURPOSE: API endpoints for VisitLog list/create operations
// PRD REFERENCE: PRD Section 6 - Visit Logging
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { visitLogSchema, completeVisitSchema, visitQuerySchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/visits
 *
 * Fetch visit logs with filtering and pagination
 *
 * WHY: Users need to view visit history for sites.
 * Supports filtering by site and date range.
 *
 * QUERY PARAMS:
 * - siteId: Filter by specific site
 * - startDate: Filter visits on or after this date
 * - endDate: Filter visits on or before this date
 * - limit: Number of records (default 20, max 100)
 * - offset: Pagination offset
 *
 * RETURNS: Array of VisitLog records with entries
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      siteId: searchParams.get('siteId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') || '20',
      offset: searchParams.get('offset') || '0',
    };

    const validatedQuery = visitQuerySchema.parse(queryParams);

    /**
     * Build where clause based on role and filters
     * WHY: Users can only see visits for sites they have access to
     */
    const whereClause: any = {};

    // Site filter
    if (validatedQuery.siteId) {
      whereClause.siteId = validatedQuery.siteId;
    }

    // Date filters
    if (validatedQuery.startDate || validatedQuery.endDate) {
      whereClause.visitDate = {};
      if (validatedQuery.startDate) {
        whereClause.visitDate.gte = new Date(validatedQuery.startDate);
      }
      if (validatedQuery.endDate) {
        whereClause.visitDate.lte = new Date(validatedQuery.endDate);
      }
    }

    /**
     * Role-based filtering
     * WHY: Restrict access based on user's role and assignments
     */
    if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
      // Distributors see visits for their client organizations' sites
      whereClause.site = {
        organization: {
          distributorId: session.user.distributorId,
        },
      };
    } else if (session.user.role === 'ORG_ADMIN') {
      // Org admins see all visits for their org's sites
      whereClause.site = {
        organizationId: session.user.organizationId,
      };
    } else if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
      // Site users see visits for sites they have access to
      const siteAccess = await prisma.userSiteAccess.findMany({
        where: { userId: session.user.id },
        select: { siteId: true },
      });
      const accessibleSiteIds = siteAccess.map((sa) => sa.siteId);

      if (validatedQuery.siteId && !accessibleSiteIds.includes(validatedQuery.siteId)) {
        return NextResponse.json(
          { error: 'Forbidden: No access to this site' },
          { status: 403 }
        );
      }

      whereClause.siteId = { in: accessibleSiteIds };
    }

    // Fetch visits with counts
    const [visits, total] = await Promise.all([
      prisma.visitLog.findMany({
        where: whereClause,
        include: {
          site: {
            select: {
              id: true,
              name: true,
              organization: {
                select: { id: true, name: true },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              chemicalEntries: true,
              serviceEntries: true,
            },
          },
        },
        orderBy: [{ visitDate: 'desc' }, { visitTime: 'desc' }],
        take: validatedQuery.limit,
        skip: validatedQuery.offset,
      }),
      prisma.visitLog.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      visits,
      pagination: {
        total,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: validatedQuery.offset + validatedQuery.limit < total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visits
 *
 * Create a new visit log (optionally with entries)
 *
 * WHY: Record site visits with inventory measurements and service notes.
 * Supports creating a complete visit with all entries in one request.
 *
 * BODY: VisitLogInput OR CompleteVisitInput
 * RETURNS: Created VisitLog record
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if this is a complete visit request
    if (body.visit) {
      return createCompleteVisit(session, body);
    }

    // Otherwise, create just the visit log
    return createVisitLog(session, body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating visit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a basic visit log without entries
 */
async function createVisitLog(session: any, body: any) {
  const validatedData = visitLogSchema.parse(body);

  // Verify user has access to this site
  const hasAccess = await verifyVisitAccess(session, validatedData.siteId);
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Forbidden: No access to create visits for this site' },
      { status: 403 }
    );
  }

  // Create visit log
  const visit = await prisma.visitLog.create({
    data: {
      siteId: validatedData.siteId,
      userId: session.user.id,
      visitDate: new Date(validatedData.visitDate),
      publicNotes: validatedData.publicNotes,
      privateNotes: validatedData.privateNotes,
      serviceNotes: validatedData.serviceNotes,
      privateServiceNotes: validatedData.privateServiceNotes,
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

  return NextResponse.json(visit, { status: 201 });
}

/**
 * Create a complete visit with chemical and service entries
 */
async function createCompleteVisit(session: any, body: any) {
  const validatedData = completeVisitSchema.parse(body);

  // Verify user has access to this site
  const hasAccess = await verifyVisitAccess(session, validatedData.visit.siteId);
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Forbidden: No access to create visits for this site' },
      { status: 403 }
    );
  }

  // Create everything in a transaction
  const visit = await prisma.$transaction(async (tx) => {
    // Create visit log
    const newVisit = await tx.visitLog.create({
      data: {
        siteId: validatedData.visit.siteId,
        userId: session.user.id,
        visitDate: new Date(validatedData.visit.visitDate),
        publicNotes: validatedData.visit.publicNotes,
        privateNotes: validatedData.visit.privateNotes,
        serviceNotes: validatedData.visit.serviceNotes,
        privateServiceNotes: validatedData.visit.privateServiceNotes,
      },
    });

    // Create chemical entries if provided
    if (validatedData.chemicalEntries && validatedData.chemicalEntries.length > 0) {
      await tx.visitLogChemicalEntry.createMany({
        data: validatedData.chemicalEntries.map((entry) => ({
          visitLogId: newVisit.id,
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
    }

    // Create service entries if provided
    if (validatedData.serviceEntries && validatedData.serviceEntries.length > 0) {
      await tx.visitLogServiceEntry.createMany({
        data: validatedData.serviceEntries.map((entry) => ({
          visitLogId: newVisit.id,
          chemicalSiteApplicationId: entry.chemicalSiteApplicationId,
          equipmentChanged: entry.equipmentChanged,
          previousInjectorTypeId: entry.previousInjectorTypeId,
          previousTipTypeId: entry.previousTipTypeId,
          newInjectorTypeId: entry.newInjectorTypeId,
          newTipTypeId: entry.newTipTypeId,
          notes: entry.notes,
        })),
      });
    }

    // Fetch complete visit with entries
    return tx.visitLog.findUnique({
      where: { id: newVisit.id },
      include: {
        site: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
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
        },
        serviceEntries: {
          include: {
            chemicalSiteApplication: true,
            previousInjectorType: true,
            previousTipType: true,
            newInjectorType: true,
            newTipType: true,
          },
        },
      },
    });
  });

  return NextResponse.json(visit, { status: 201 });
}

/**
 * Verify user has permission to create visits for a site
 */
async function verifyVisitAccess(session: any, siteId: string): Promise<boolean> {
  // Fetch site with organization
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      organization: {
        select: { distributorId: true },
      },
    },
  });

  if (!site) {
    return false;
  }

  // Check based on role
  if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
    return site.organization.distributorId === session.user.distributorId;
  }

  if (session.user.role === 'ORG_ADMIN') {
    return site.organizationId === session.user.organizationId;
  }

  if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
    const siteAccess = await prisma.userSiteAccess.findFirst({
      where: {
        userId: session.user.id,
        siteId,
      },
    });
    return !!siteAccess;
  }

  return false;
}
