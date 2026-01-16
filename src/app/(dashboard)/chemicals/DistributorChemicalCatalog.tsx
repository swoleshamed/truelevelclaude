// ===========================================
// FILE: src/app/(dashboard)/chemicals/DistributorChemicalCatalog.tsx
// PURPOSE: Chemical catalog management for distributors
// PRD REFERENCE: PRD Section 3.1 - Chemical Master Catalog
// USED BY: Chemicals page (distributor role)
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Button, Card, Modal, Input, Select, StatusBadge } from '@/components/ui';
import { useFABAction } from '@/components/layout/FAB';

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
          >
            <option value="ALL">All Types</option>
            <option value="PREP_SOAP">Prep Soap</option>
            <option value="HIGH_PH_PRESOAK">High pH Presoak</option>
            <option value="LOW_PH_PRESOAK">Low pH Presoak</option>
            <option value="TIRE_CLEANER">Tire Cleaner</option>
            <option value="WHEEL_CLEANER">Wheel Cleaner</option>
            <option value="TRIPLE_FOAM">Triple Foam</option>
            <option value="TRIPLE_FOAM_POLISH">Triple Foam Polish</option>
            <option value="CLEARCOAT_PROTECTANT">Clearcoat Protectant</option>
            <option value="CERAMIC_SEALANT">Ceramic Sealant</option>
            <option value="TIRE_SHINE">Tire Shine</option>
            <option value="SPOT_FREE_RINSE">Spot Free Rinse</option>
            <option value="DRYER_AGENT">Dryer Agent</option>
            <option value="BUG_PREP">Bug Prep</option>
            <option value="WHEEL_MAGIC">Wheel Magic</option>
            <option value="RAIN_X">Rain-X</option>
            <option value="OTHER">Other</option>
          </Select>
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

      {/* Create/Edit Modal - TODO: Implement ChemicalFormModal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Add Chemical"
        >
          <div className="p-6 text-center text-text-secondary">
            Chemical creation form will be implemented next.
          </div>
        </Modal>
      )}

      {/* Detail Modal - TODO: Implement ChemicalDetailModal */}
      {selectedChemical && (
        <Modal
          isOpen={!!selectedChemical}
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
                  <Button variant="secondary" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
