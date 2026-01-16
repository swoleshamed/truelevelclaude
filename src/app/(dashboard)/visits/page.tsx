// ===========================================
// FILE: src/app/(dashboard)/visits/page.tsx
// PURPOSE: Visit logging page - role-specific views
// PRD REFERENCE: PRD Section 6 - Visit Logging
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { VisitLogList } from './VisitLogList';
import { VisitLogDetail } from './VisitLogDetail';

interface Site {
  id: string;
  name: string;
}

/**
 * Visits Page
 *
 * WHY: Visit logging is central to chemical management workflow.
 * Users record inventory levels and service changes during site visits.
 *
 * FEATURES:
 * - View visit history
 * - Create new visits
 * - Add chemical entries
 * - Add service entries
 * - Role-based permissions
 *
 * ROUTING:
 * - List view: Shows all visits with filtering
 * - Detail view: Shows single visit with entries
 */
export default function VisitsPage() {
  const { data: session, status } = useSession();
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);

  /**
   * Fetch sites for filtering (distributors and org admins)
   */
  useEffect(() => {
    if (session?.user) {
      fetchSites();
    }
  }, [session]);

  const fetchSites = async () => {
    try {
      setLoadingSites(true);
      // TODO: Implement sites API endpoint
      // For now, we'll use an empty list
      setSites([]);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoadingSites(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-yellow-700">
            Please sign in to access visit logs.
          </p>
        </div>
      </div>
    );
  }

  const { role } = session.user;

  /**
   * Determine permissions based on role
   */
  const canCreate = [
    'DISTRIBUTOR_ADMIN',
    'DISTRIBUTOR_USER',
    'ORG_ADMIN',
    'SITE_MANAGER',
  ].includes(role);

  const canEdit = [
    'DISTRIBUTOR_ADMIN',
    'DISTRIBUTOR_USER',
    'ORG_ADMIN',
    'SITE_MANAGER',
  ].includes(role);

  const showPrivateFields = ['DISTRIBUTOR_ADMIN', 'DISTRIBUTOR_USER'].includes(
    role
  );

  /**
   * Handle visit selection
   */
  const handleSelectVisit = (visitId: string) => {
    setSelectedVisitId(visitId);
  };

  /**
   * Handle back from detail view
   */
  const handleBack = () => {
    setSelectedVisitId(null);
  };

  /**
   * Handle visit deletion
   */
  const handleDeleted = () => {
    setSelectedVisitId(null);
  };

  // Show detail view if a visit is selected
  if (selectedVisitId) {
    return (
      <VisitLogDetail
        visitId={selectedVisitId}
        canEdit={canEdit}
        showPrivateFields={showPrivateFields}
        onBack={handleBack}
        onDeleted={handleDeleted}
      />
    );
  }

  // Show list view
  return (
    <VisitLogList
      sites={sites}
      canCreate={canCreate}
      showPrivateFields={showPrivateFields}
      onSelectVisit={handleSelectVisit}
    />
  );
}
