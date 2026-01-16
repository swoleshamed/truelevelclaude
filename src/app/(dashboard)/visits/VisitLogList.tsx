// ===========================================
// FILE: src/app/(dashboard)/visits/VisitLogList.tsx
// PURPOSE: Display list of visit logs with filtering
// PRD REFERENCE: PRD Section 6 - Visit Logging
// USED BY: Visits page
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Button, Card, Input, Select } from '@/components/ui';
import { useFABAction } from '@/components/layout/FAB';
import { VisitLogForm } from '@/components/forms/VisitLogForm';

interface VisitLog {
  id: string;
  siteId: string;
  visitDate: string;
  visitTime: string;
  publicNotes: string | null;
  serviceNotes: string | null;
  site: {
    id: string;
    name: string;
    organization: {
      id: string;
      name: string;
    };
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    chemicalEntries: number;
    serviceEntries: number;
  };
}

interface Site {
  id: string;
  name: string;
}

interface VisitLogListProps {
  siteId?: string;
  siteName?: string;
  sites?: Site[];
  canCreate: boolean;
  showPrivateFields: boolean;
  onSelectVisit: (visitId: string) => void;
}

/**
 * VisitLogList Component
 *
 * WHY: Display and filter visit history for sites.
 * Supports filtering by site and date range.
 *
 * FEATURES:
 * - List visits with entry counts
 * - Filter by site (if multiple)
 * - Filter by date range
 * - Create new visit
 * - Navigate to visit details
 */
export function VisitLogList({
  siteId,
  siteName,
  sites = [],
  canCreate,
  showPrivateFields,
  onSelectVisit,
}: VisitLogListProps) {
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState(siteId || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  /**
   * Configure FAB for creating visits
   */
  useFABAction(
    canCreate
      ? {
          label: 'New Visit',
          icon: 'plus',
          onClick: () => setShowCreateModal(true),
        }
      : null
  );

  /**
   * Fetch visits on mount and filter changes
   */
  useEffect(() => {
    fetchVisits();
  }, [selectedSiteId, startDate, endDate]);

  const fetchVisits = async (offset = 0) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (selectedSiteId) params.append('siteId', selectedSiteId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', '20');
      params.append('offset', offset.toString());

      const response = await fetch(`/api/visits?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch visits');
      }

      const data = await response.json();
      setVisits(offset === 0 ? data.visits : [...visits, ...data.visits]);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching visits:', error);
      alert('Failed to load visits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Format time for display
   */
  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  /**
   * Handle load more
   */
  const handleLoadMore = () => {
    fetchVisits(pagination.offset + pagination.limit);
  };

  /**
   * Handle visit creation success
   */
  const handleVisitCreated = (visitId: string) => {
    fetchVisits();
    onSelectVisit(visitId);
  };

  /**
   * Get the effective site for new visit creation
   */
  const effectiveSiteId = selectedSiteId || siteId || (sites.length === 1 ? sites[0].id : '');
  const effectiveSiteName =
    siteName ||
    sites.find((s) => s.id === effectiveSiteId)?.name ||
    'Select a site';

  return (
    <PageContainer>
      <PageHeader
        title="Visit History"
        subtitle={siteName ? `${siteName}` : `${pagination.total} visits`}
        action={
          canCreate && effectiveSiteId ? (
            <Button onClick={() => setShowCreateModal(true)}>New Visit</Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Site filter (if multiple sites) */}
          {sites.length > 1 && (
            <Select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
            >
              <option value="">All Sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </Select>
          )}

          {/* Date range filters */}
          <Input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Visits list */}
      {loading && visits.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-text-secondary">Loading visits...</div>
        </div>
      ) : visits.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-tertiary rounded-full mb-4">
              <svg
                className="w-8 h-8 text-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No visits found
            </h3>
            <p className="text-text-secondary mb-4">
              {startDate || endDate
                ? 'Try adjusting your date filters'
                : 'Record your first site visit'}
            </p>
            {canCreate && effectiveSiteId && (
              <Button onClick={() => setShowCreateModal(true)}>
                Record First Visit
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <Card
              key={visit.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelectVisit(visit.id)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-text-primary">
                        {formatDate(visit.visitDate)}
                      </span>
                      <span className="text-text-tertiary">
                        {formatTime(visit.visitTime)}
                      </span>
                    </div>
                    {!siteName && (
                      <p className="text-sm text-text-secondary">
                        {visit.site.name}
                      </p>
                    )}
                    <p className="text-sm text-text-tertiary mt-1">
                      by {visit.user.firstName} {visit.user.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-3 text-sm">
                      <span className="text-text-secondary">
                        {visit._count.chemicalEntries} chemical
                        {visit._count.chemicalEntries !== 1 ? 's' : ''}
                      </span>
                      <span className="text-text-secondary">
                        {visit._count.serviceEntries} service
                        {visit._count.serviceEntries !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                {visit.publicNotes && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                    {visit.publicNotes}
                  </p>
                )}
              </div>
            </Card>
          ))}

          {/* Load more */}
          {pagination.hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Visit Modal */}
      {effectiveSiteId && (
        <VisitLogForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleVisitCreated}
          siteId={effectiveSiteId}
          siteName={effectiveSiteName}
          showPrivateFields={showPrivateFields}
        />
      )}
    </PageContainer>
  );
}
