// ===========================================
// FILE: src/app/api/equipment/tips/route.ts
// PURPOSE: API endpoint for fetching tip types
// PRD REFERENCE: Reference data for chemical applications
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/equipment/tips
 *
 * Fetch all available tip types
 *
 * WHY: Sites need to select tips when assigning chemicals to tanks.
 * This provides the reference data for tip selection with dilution ratios.
 *
 * RETURNS: Array of TipType records
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tips = await prisma.tipType.findMany({
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });

    return NextResponse.json(tips);
  } catch (error) {
    console.error('Error fetching tips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
