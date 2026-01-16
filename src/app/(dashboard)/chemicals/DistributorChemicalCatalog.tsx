// ===========================================
// FILE: src/app/(dashboard)/chemicals/DistributorChemicalCatalog.tsx
// PURPOSE: Chemical catalog management for distributors
// PRD REFERENCE: PRD Section 3.1 - Chemical Master Catalog
// USED BY: Chemicals page (distributor role)
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Button, Card, Modal, Input, Select, StatusBadge, ConfirmModal } from '@/components/ui';
import { useFABAction } from '@/components/layout/FAB';
import { ChemicalForm } from '@/components/forms/ChemicalForm';

interface ChemicalMaster {
  id: string;
  name: string;
  type: string;
  manufacturer: string | null;
  description: string | null;
  distributorId: string;
  createdAt: string;
  updatedAt: string;
}

interface DistributorChemicalCatalogProps {
  distributorId: string;
  canEdit: boolean;
}

/**
 * DistributorChemicalCatalog Component
 *
 * WHY: Distributors create and manage the master chemical catalog.
 * This is the foundation - chemicals must exist here before organizations
 * can configure pricing and sites can use them.
 *
 * FEATURES (PRD Section 3.1):
 * - View all chemicals in master catalog
 * - Create new chemicals (admins only)
 * - Edit chemical details (admins only)
 * - Delete chemicals (admins only, if not in use)
 * - Filter by chemical type
 * - Search by name or manufacturer
 *
 * BUSINESS LOGIC:
 * - ChemicalMaster is distributor-owned
 * - Once created, can be configured for multiple organizations
 * - Deletion only allowed if no org configs exist (cascade delete)
 */
export function DistributorChemicalCatalog({
  distributorId,
  canEdit,
}: DistributorChemicalCatalogProps) {
  const [chemicals, setChemicals] = useState<ChemicalMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState<ChemicalMaster | null>(null);

  /**
   * Configure FAB for adding chemicals
   * WHY: Quick access to create new chemical (admins only)
   */
  useFABAction(
    canEdit
      ? {
          label: 'Add Chemical',
          icon: 'plus',
          onClick: () => setShowCreateModal(true),
        }
      : null
  );

  /**
   * Fetch chemicals on mount
   * WHY: Load distributor's chemical catalog
   */
  useEffect(() => {
    fetchChemicals();
  }, [distributorId]);

  const fetchChemicals = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/chemicals?distributorId=${distributorId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chemicals');
      }

      const data = await response.json();
      setChemicals(data);
    } catch (error) {
      console.error('Error fetching chemicals:', error);
      alert('Failed to load chemicals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter chemicals by search query and type
   * WHY: Help users find specific chemicals quickly
   */
  const filteredChemicals = chemicals.filter((chemical) => {
    const matchesSearch =
      searchQuery === '' ||
      chemical.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chemical.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === 'ALL' || chemical.type === typeFilter;

    return matchesSearch && matchesType;
  });

  /**
   * Group chemicals by type for organized display
   * WHY: Makes it easier to browse by chemical category
   */
  const groupedChemicals = filteredChemicals.reduce((acc, chemical) => {
    if (!acc[chemical.type]) {
      acc[chemical.type] = [];
    }
    acc[chemical.type].push(chemical);
    return acc;
  }, {} as Record<string, ChemicalMaster[]>);

  /**
   * Format chemical type for display
   * WHY: Convert enum to readable text
   */
  const formatChemicalType = (type: string): string => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  /**
   * Get color for chemical type badge
   * WHY: Visual distinction between chemical categories
   */
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      PREP_SOAP: 'bg-blue-100 text-blue-800',
      HIGH_PH_PRESOAK: 'bg-red-100 text-red-800',
      LOW_PH_PRESOAK: 'bg-orange-100 text-orange-800',
      TRIPLE_FOAM: 'bg-purple-100 text-purple-800',
      TIRE_SHINE: 'bg-indigo-100 text-indigo-800',
      SPOT_FREE_RINSE: 'bg-cyan-100 text-cyan-800',
      CLEARCOAT_PROTECTANT: 'bg-green-100 text-green-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Handle chemical deletion
   * WHY: Allow admins to remove discontinued chemicals
   */
  const handleDelete = async () => {
    if (!selectedChemical) return;

    try {
      const response = await fetch(`/api/chemicals/${selectedChemical.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete chemical');
      }

      // Success! Refresh list and close modals
      await fetchChemicals();
      setShowDeleteConfirm(false);
      setSelectedChemical(null);
    } catch (error: any) {
      console.error('Error deleting chemical:', error);
      alert(error.message || 'Failed to delete chemical. Please try again.');
    }
  };

  /**
   * Handle edit button click
   * WHY: Open edit modal with selected chemical
   */
  const handleEditClick = () => {
    setShowEditModal(true);
  };

  /**
   * Handle delete button click
   * WHY: Show confirmation before deleting
   */
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="Chemical Catalog"
          subtitle="Loading your chemical catalog..."
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Chemical Catalog"
        subtitle={`Managing ${chemicals.length} chemicals`}
        action={
          canEdit ? (
            <Button onClick={() => setShowCreateModal(true)}>
              Add Chemical
            </Button>
          ) : undefined
        }
      />

      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Search chemicals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Types' },
              { value: 'PREP_SOAP', label: 'Prep Soap' },
              { value: 'HIGH_PH_PRESOAK', label: 'High pH Presoak' },
              { value: 'LOW_PH_PRESOAK', label: 'Low pH Presoak' },
              { value: 'TIRE_CLEANER', label: 'Tire Cleaner' },
              { value: 'WHEEL_CLEANER', label: 'Wheel Cleaner' },
              { value: 'TRIPLE_FOAM', label: 'Triple Foam' },
              { value: 'TRIPLE_FOAM_POLISH', label: 'Triple Foam Polish' },
              { value: 'CLEARCOAT_PROTECTANT', label: 'Clearcoat Protectant' },
              { value: 'CERAMIC_SEALANT', label: 'Ceramic Sealant' },
              { value: 'TIRE_SHINE', label: 'Tire Shine' },
              { value: 'SPOT_FREE_RINSE', label: 'Spot Free Rinse' },
              { value: 'DRYER_AGENT', label: 'Dryer Agent' },
              { value: 'BUG_PREP', label: 'Bug Prep' },
              { value: 'WHEEL_MAGIC', label: 'Wheel Magic' },
              { value: 'RAIN_X', label: 'Rain-X' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-text-secondary">
        Showing {filteredChemicals.length} of {chemicals.length} chemicals
      </div>

      {/* Chemicals list */}
      {filteredChemicals.length === 0 ? (
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
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No chemicals found
            </h3>
            <p className="text-text-secondary mb-4">
              {searchQuery || typeFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first chemical'}
            </p>
            {canEdit && !searchQuery && typeFilter === 'ALL' && (
              <Button onClick={() => setShowCreateModal(true)}>
                Add Your First Chemical
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedChemicals).map(([type, typeChemicals]) => (
            <div key={type}>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                {formatChemicalType(type)}
              </h2>
              <div className="space-y-3">
                {typeChemicals.map((chemical) => (
                  <Card
                    key={chemical.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedChemical(chemical)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-text-primary">
                            {chemical.name}
                          </h3>
                          {chemical.manufacturer && (
                            <p className="text-sm text-text-secondary mt-1">
                              {chemical.manufacturer}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(
                            chemical.type
                          )}`}
                        >
                          {formatChemicalType(chemical.type)}
                        </span>
                      </div>
                      {chemical.description && (
                        <p className="text-sm text-text-tertiary mt-2">
                          {chemical.description}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Chemical Modal */}
      <ChemicalForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchChemicals}
        distributorId={distributorId}
      />

      {/* Edit Chemical Modal */}
      {selectedChemical && (
        <ChemicalForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedChemical(null);
          }}
          onSuccess={() => {
            fetchChemicals();
            setSelectedChemical(null);
          }}
          distributorId={distributorId}
          chemical={selectedChemical}
        />
      )}

      {/* Chemical Detail Modal */}
      {selectedChemical && !showEditModal && (
        <Modal
          isOpen={!!selectedChemical && !showEditModal}
          onClose={() => setSelectedChemical(null)}
          title={selectedChemical.name}
        >
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm text-text-secondary">Type</p>
              <p className="text-text-primary font-medium">
                {formatChemicalType(selectedChemical.type)}
              </p>
            </div>
            {selectedChemical.manufacturer && (
              <div>
                <p className="text-sm text-text-secondary">Manufacturer</p>
                <p className="text-text-primary font-medium">
                  {selectedChemical.manufacturer}
                </p>
              </div>
            )}
            {selectedChemical.description && (
              <div>
                <p className="text-sm text-text-secondary">Description</p>
                <p className="text-text-primary">{selectedChemical.description}</p>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              {canEdit && (
                <>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleEditClick}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteClick}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedChemical && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Chemical"
          message={`Are you sure you want to delete "${selectedChemical.name}"? This action cannot be undone and will remove all related configurations.`}
          confirmText="Delete"
          confirmVariant="destructive"
        />
      )}
    </PageContainer>
  );
}
