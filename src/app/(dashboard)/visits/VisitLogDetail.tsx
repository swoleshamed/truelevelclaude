// ===========================================
// FILE: src/app/(dashboard)/visits/VisitLogDetail.tsx
// PURPOSE: Display and manage a single visit log
// PRD REFERENCE: PRD Section 6 - Visit Logging
// USED BY: Visits page
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Button, Card, Tabs, ConfirmModal } from '@/components/ui';
import { VisitLogForm } from '@/components/forms/VisitLogForm';
import { ChemicalEntryForm } from '@/components/forms/ChemicalEntryForm';
import { ServiceEntryForm } from '@/components/forms/ServiceEntryForm';

interface ChemicalEntry {
  id: string;
  entryMethod: string;
  levelGallons: number | null;
  levelInches: number | null;
  backstockCount: number;
  backstockGallons: number;
  deliveryReceived: boolean;
  deliveryCount: number | null;
  deliveryGallons: number | null;
  totalOnHandGallons: number;
  notes: string | null;
  chemicalSiteConfig: {
    id: string;
    chemicalOrgConfig: {
      chemicalMaster: {
        name: string;
        type: string;
      };
    };
  };
}

interface ServiceEntry {
  id: string;
  equipmentChanged: boolean;
  notes: string | null;
  chemicalSiteApplication: {
    id: string;
    applicationNumber: number;
    applicationName: string | null;
    chemicalSiteConfig: {
      chemicalOrgConfig: {
        chemicalMaster: {
          name: string;
        };
      };
    };
  };
  previousInjectorType: { name: string; gpm: string } | null;
  previousTipType: { name: string } | null;
  newInjectorType: { name: string; gpm: string } | null;
  newTipType: { name: string } | null;
}

interface VisitLog {
  id: string;
  siteId: string;
  visitDate: string;
  visitTime: string;
  publicNotes: string | null;
  privateNotes: string | null;
  serviceNotes: string | null;
  privateServiceNotes: string | null;
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
    email: string;
  };
  chemicalEntries: ChemicalEntry[];
  serviceEntries: ServiceEntry[];
}

interface VisitLogDetailProps {
  visitId: string;
  canEdit: boolean;
  showPrivateFields: boolean;
  onBack: () => void;
  onDeleted: () => void;
}

/**
 * VisitLogDetail Component
 *
 * WHY: View and manage all details of a visit log.
 * Includes chemical entries, service entries, and notes.
 *
 * FEATURES:
 * - View visit details
 * - Edit visit notes
 * - Add/edit/delete chemical entries
 * - Add/edit/delete service entries
 * - Delete visit
 */
export function VisitLogDetail({
  visitId,
  canEdit,
  showPrivateFields,
  onBack,
  onDeleted,
}: VisitLogDetailProps) {
  const [visit, setVisit] = useState<VisitLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chemicals');
  const [showEditVisitModal, setShowEditVisitModal] = useState(false);
  const [showChemicalModal, setShowChemicalModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingChemicalEntry, setEditingChemicalEntry] = useState<ChemicalEntry | null>(null);
  const [editingServiceEntry, setEditingServiceEntry] = useState<ServiceEntry | null>(null);

  /**
   * Fetch visit details
   */
  useEffect(() => {
    fetchVisit();
  }, [visitId]);

  const fetchVisit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/visits/${visitId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch visit');
      }
      const data = await response.json();
      setVisit(data);
    } catch (error) {
      console.error('Error fetching visit:', error);
      alert('Failed to load visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle visit deletion
   */
  const handleDeleteVisit = async () => {
    try {
      const response = await fetch(`/api/visits/${visitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete visit');
      }

      onDeleted();
    } catch (error: any) {
      console.error('Error deleting visit:', error);
      alert(error.message || 'Failed to delete visit. Please try again.');
    }
  };

  /**
   * Handle chemical entry deletion
   */
  const handleDeleteChemicalEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(
        `/api/visits/${visitId}/chemicals?entryId=${entryId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete entry');
      }

      fetchVisit();
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      alert(error.message || 'Failed to delete entry. Please try again.');
    }
  };

  /**
   * Handle service entry deletion
   */
  const handleDeleteServiceEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(
        `/api/visits/${visitId}/services?entryId=${entryId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete entry');
      }

      fetchVisit();
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      alert(error.message || 'Failed to delete entry. Please try again.');
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Format chemical type for display
   */
  const formatChemicalType = (type: string): string => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Visit Details" subtitle="Loading..." />
        <div className="flex justify-center items-center h-64">
          <div className="text-text-secondary">Loading visit...</div>
        </div>
      </PageContainer>
    );
  }

  if (!visit) {
    return (
      <PageContainer>
        <PageHeader title="Visit Not Found" />
        <Card>
          <div className="p-8 text-center">
            <p className="text-text-secondary mb-4">
              This visit could not be found or you don&apos;t have access.
            </p>
            <Button onClick={onBack}>Go Back</Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={formatDate(visit.visitDate)}
        subtitle={visit.site.name}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
            {canEdit && (
              <Button onClick={() => setShowEditVisitModal(true)}>
                Edit
              </Button>
            )}
          </div>
        }
      />

      {/* Visit Info */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Recorded by</p>
              <p className="font-medium text-text-primary">
                {visit.user.firstName} {visit.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Chemical Entries</p>
              <p className="font-medium text-text-primary">
                {visit.chemicalEntries.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Service Entries</p>
              <p className="font-medium text-text-primary">
                {visit.serviceEntries.length}
              </p>
            </div>
          </div>

          {/* Notes */}
          {(visit.publicNotes || visit.serviceNotes) && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {visit.publicNotes && (
                <div>
                  <p className="text-sm text-text-secondary">Notes</p>
                  <p className="text-text-primary">{visit.publicNotes}</p>
                </div>
              )}
              {visit.serviceNotes && (
                <div>
                  <p className="text-sm text-text-secondary">Service Notes</p>
                  <p className="text-text-primary">{visit.serviceNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Private notes (distributor only) */}
          {showPrivateFields && (visit.privateNotes || visit.privateServiceNotes) && (
            <div className="mt-4 pt-4 border-t border-warning/30 bg-warning/5 -mx-4 px-4 pb-4 rounded-b-lg space-y-3">
              <p className="text-xs text-warning font-medium">Private (Distributor Only)</p>
              {visit.privateNotes && (
                <div>
                  <p className="text-sm text-text-secondary">Private Notes</p>
                  <p className="text-text-primary">{visit.privateNotes}</p>
                </div>
              )}
              {visit.privateServiceNotes && (
                <div>
                  <p className="text-sm text-text-secondary">Private Service Notes</p>
                  <p className="text-text-primary">{visit.privateServiceNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Tabs for entries */}
      <Tabs
        tabs={[
          { id: 'chemicals', label: `Chemicals (${visit.chemicalEntries.length})` },
          { id: 'services', label: `Service (${visit.serviceEntries.length})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Chemical Entries Tab */}
      {activeTab === 'chemicals' && (
        <div className="mt-4">
          {canEdit && (
            <div className="mb-4">
              <Button
                onClick={() => {
                  setEditingChemicalEntry(null);
                  setShowChemicalModal(true);
                }}
              >
                Add Chemical Entry
              </Button>
            </div>
          )}

          {visit.chemicalEntries.length === 0 ? (
            <Card>
              <div className="p-8 text-center text-text-secondary">
                No chemical entries recorded
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {visit.chemicalEntries.map((entry) => (
                <Card key={entry.id}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-text-primary">
                          {entry.chemicalSiteConfig.chemicalOrgConfig.chemicalMaster.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {formatChemicalType(
                            entry.chemicalSiteConfig.chemicalOrgConfig.chemicalMaster.type
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-text-primary">
                          {entry.totalOnHandGallons} gal
                        </p>
                        <p className="text-xs text-text-tertiary">Total on hand</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-text-tertiary">Tank Level</p>
                        <p className="text-text-primary">
                          {entry.levelGallons
                            ? `${entry.levelGallons} gal`
                            : entry.levelInches
                            ? `${entry.levelInches} in`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-tertiary">Backstock</p>
                        <p className="text-text-primary">
                          {entry.backstockCount} ({entry.backstockGallons} gal)
                        </p>
                      </div>
                      <div>
                        <p className="text-text-tertiary">Delivery</p>
                        <p className="text-text-primary">
                          {entry.deliveryReceived
                            ? `${entry.deliveryCount || 0} (${entry.deliveryGallons || 0} gal)`
                            : 'None'}
                        </p>
                      </div>
                    </div>

                    {entry.notes && (
                      <p className="text-sm text-text-secondary mt-3 pt-3 border-t border-border">
                        {entry.notes}
                      </p>
                    )}

                    {canEdit && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingChemicalEntry(entry);
                            setShowChemicalModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChemicalEntry(entry.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Service Entries Tab */}
      {activeTab === 'services' && (
        <div className="mt-4">
          {canEdit && (
            <div className="mb-4">
              <Button
                onClick={() => {
                  setEditingServiceEntry(null);
                  setShowServiceModal(true);
                }}
              >
                Add Service Entry
              </Button>
            </div>
          )}

          {visit.serviceEntries.length === 0 ? (
            <Card>
              <div className="p-8 text-center text-text-secondary">
                No service entries recorded
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {visit.serviceEntries.map((entry) => (
                <Card key={entry.id}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-text-primary">
                          #{entry.chemicalSiteApplication.applicationNumber} -{' '}
                          {entry.chemicalSiteApplication.applicationName ||
                            entry.chemicalSiteApplication.chemicalSiteConfig.chemicalOrgConfig.chemicalMaster.name}
                        </h3>
                        {entry.equipmentChanged && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded mt-1">
                            Equipment Changed
                          </span>
                        )}
                      </div>
                    </div>

                    {entry.equipmentChanged && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-text-tertiary mb-1">Previous</p>
                          <p className="text-sm text-text-secondary">
                            {entry.previousInjectorType?.name || 'N/A'} /{' '}
                            {entry.previousTipType?.name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-tertiary mb-1">New</p>
                          <p className="text-sm text-text-primary font-medium">
                            {entry.newInjectorType?.name || 'Same'} /{' '}
                            {entry.newTipType?.name || 'Same'}
                          </p>
                        </div>
                      </div>
                    )}

                    {entry.notes && (
                      <p className="text-sm text-text-secondary mt-3 pt-3 border-t border-border">
                        {entry.notes}
                      </p>
                    )}

                    {canEdit && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingServiceEntry(entry);
                            setShowServiceModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteServiceEntry(entry.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Visit Button */}
      {canEdit && (
        <div className="mt-8 pt-8 border-t border-border">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Visit
          </Button>
        </div>
      )}

      {/* Edit Visit Modal */}
      <VisitLogForm
        isOpen={showEditVisitModal}
        onClose={() => setShowEditVisitModal(false)}
        onSuccess={() => fetchVisit()}
        siteId={visit.siteId}
        siteName={visit.site.name}
        showPrivateFields={showPrivateFields}
        visit={visit}
      />

      {/* Chemical Entry Modal */}
      <ChemicalEntryForm
        isOpen={showChemicalModal}
        onClose={() => {
          setShowChemicalModal(false);
          setEditingChemicalEntry(null);
        }}
        onSuccess={() => fetchVisit()}
        visitId={visitId}
        siteId={visit.siteId}
        entry={editingChemicalEntry || undefined}
      />

      {/* Service Entry Modal */}
      <ServiceEntryForm
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingServiceEntry(null);
        }}
        onSuccess={() => fetchVisit()}
        visitId={visitId}
        siteId={visit.siteId}
        entry={editingServiceEntry || undefined}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteVisit}
        title="Delete Visit"
        message="Are you sure you want to delete this visit? All chemical and service entries will be permanently removed."
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </PageContainer>
  );
}
