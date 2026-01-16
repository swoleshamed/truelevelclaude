// ===========================================
// FILE: src/app/api/equipment/injectors/route.ts
// PURPOSE: API endpoint for fetching injector types
// PRD REFERENCE: Reference data for chemical applications
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/equipment/injectors
 *
 * Fetch all available injector types
 *
 * WHY: Sites need to select injectors when assigning chemicals to tanks.
 * This provides the reference data for injector selection.
 *
 * RETURNS: Array of InjectorType records
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const injectors = await prisma.injectorType.findMany({
      orderBy: [{ system: 'asc' }, { gpm: 'asc' }],
    });

    return NextResponse.json(injectors);
  } catch (error) {
    console.error('Error fetching injectors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
