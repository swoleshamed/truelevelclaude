// ===========================================
// FILE: src/app/(dashboard)/packages/SitePackageCatalog.tsx
// PURPOSE: Wash package management for individual sites
// PRD REFERENCE: PRD Section 5.2 - Site Packages
// USED BY: Packages page (site role)
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Button, Card, Modal, ConfirmModal } from '@/components/ui';
import { useFABAction } from '@/components/layout/FAB';
import { WashPackageForm } from '@/components/forms/WashPackageForm';

interface ChemicalInfo {
  id: string;
  applicationOrder: number;
  chemicalSiteApplication: {
    id: string;
    applicationNumber: number;
    applicationName: string | null;
    chemicalSiteConfig: {
      chemicalOrgConfig: {
        chemicalMaster: {
          name: string;
          type: string;
        };
      };
    };
    injectorType: {
      name: string;
      gpm: string;
    };
    tipType: {
      name: string;
    };
  };
}

interface WashPackage {
  id: string;
  name: string;
  displayOrder: number;
  singleWashPrice: number | null;
  membershipPrice: number | null;
  description: string | null;
  isFromTemplate: boolean;
  isActive: boolean;
  siteId: string;
  templateItem?: {
    id: string;
    name: string;
    template: {
      id: string;
      name: string;
    };
  } | null;
  chemicals: ChemicalInfo[];
}

interface WashPackageTemplate {
  id: string;
  name: string;
  isDefault: boolean;
}

interface SitePackageCatalogProps {
  siteId: string;
  siteName: string;
  organizationId: string;
  canEdit: boolean;
}

/**
 * SitePackageCatalog Component
 *
 * WHY: Sites need to manage their specific wash packages.
 * They can create packages manually or apply org templates.
 *
 * FEATURES (PRD Section 5.2):
 * - View all site packages
 * - Create custom packages
 * - Apply templates from organization
 * - Edit package details and chemicals
 * - Reorder packages
 */
export function SitePackageCatalog({
  siteId,
  siteName,
  organizationId,
  canEdit,
}: SitePackageCatalogProps) {
  const [packages, setPackages] = useState<WashPackage[]>([]);
  const [templates, setTemplates] = useState<WashPackageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<WashPackage | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  /**
   * Configure FAB for adding packages
   * WHY: Quick access to create new package
   */
  useFABAction(
    canEdit
      ? {
          label: 'Add Package',
          icon: 'plus',
          onClick: () => setShowCreateModal(true),
        }
      : null
  );

  /**
   * Fetch packages and templates on mount
   */
  useEffect(() => {
    fetchData();
  }, [siteId, organizationId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [packagesRes, templatesRes] = await Promise.all([
        fetch(`/api/packages?siteId=${siteId}&includeChemicals=true`),
        fetch(`/api/packages/templates?organizationId=${organizationId}`),
      ]);

      if (!packagesRes.ok) {
        throw new Error('Failed to fetch packages');
      }

      const packagesData = await packagesRes.json();
      setPackages(packagesData);

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle package deletion
   */
  const handleDeletePackage = async () => {
    if (!selectedPackage) return;

    try {
      const response = await fetch(`/api/packages/${selectedPackage.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete package');
      }

      await fetchData();
      setShowDeleteConfirm(false);
      setSelectedPackage(null);
    } catch (error: any) {
      console.error('Error deleting package:', error);
      alert(error.message || 'Failed to delete package. Please try again.');
    }
  };

  /**
   * Handle applying a template
   */
  const handleApplyTemplate = async (templateId: string) => {
    try {
      setApplyingTemplate(true);
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, siteId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply template');
      }

      await fetchData();
      setShowTemplateModal(false);
    } catch (error: any) {
      console.error('Error applying template:', error);
      alert(error.message || 'Failed to apply template. Please try again.');
    } finally {
      setApplyingTemplate(false);
    }
  };

  /**
   * Format price for display
   */
  const formatPrice = (price: number | null): string => {
    if (price === null) return '-';
    return `$${price.toFixed(2)}`;
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
        <PageHeader
          title="Wash Packages"
          subtitle={`Loading packages for ${siteName}...`}
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
        title="Wash Packages"
        subtitle={`${siteName} - ${packages.length} packages`}
        action={
          canEdit ? (
            <div className="flex gap-2">
              {templates.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setShowTemplateModal(true)}
                >
                  Apply Template
                </Button>
              )}
              <Button onClick={() => setShowCreateModal(true)}>
                Add Package
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Packages list */}
      {packages.length === 0 ? (
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No packages yet
            </h3>
            <p className="text-text-secondary mb-4">
              {templates.length > 0
                ? 'Apply a template or create custom packages'
                : 'Create your first wash package'}
            </p>
            {canEdit && (
              <div className="flex gap-2 justify-center">
                {templates.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowTemplateModal(true)}
                  >
                    Apply Template
                  </Button>
                )}
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Package
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedPackage(pkg)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-text-tertiary font-medium">
                        #{pkg.displayOrder}
                      </span>
                      <h3 className="text-lg font-semibold text-text-primary">
                        {pkg.name}
                      </h3>
                      {pkg.isFromTemplate && pkg.templateItem && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                          From: {pkg.templateItem.template.name}
                        </span>
                      )}
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-text-secondary mb-2">
                        {pkg.description}
                      </p>
                    )}
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-text-tertiary">Single: </span>
                        <span className="font-medium text-text-primary">
                          {formatPrice(pkg.singleWashPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-tertiary">Member: </span>
                        <span className="font-medium text-text-primary">
                          {formatPrice(pkg.membershipPrice)}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-text-secondary">
                    {pkg.chemicals.length} chemicals
                  </div>
                </div>

                {/* Chemicals preview */}
                {pkg.chemicals.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {pkg.chemicals.map((chem) => (
                        <div
                          key={chem.id}
                          className="flex items-center gap-1 px-2 py-1 bg-bg-tertiary rounded text-xs"
                        >
                          <span className="text-text-tertiary">
                            {chem.applicationOrder}.
                          </span>
                          <span className="text-text-primary">
                            {chem.chemicalSiteApplication.applicationName ||
                              chem.chemicalSiteApplication.chemicalSiteConfig
                                .chemicalOrgConfig.chemicalMaster.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Package Modal */}
      <WashPackageForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchData}
        siteId={siteId}
      />

      {/* Edit Package Modal */}
      {selectedPackage && (
        <WashPackageForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPackage(null);
          }}
          onSuccess={() => {
            fetchData();
            setSelectedPackage(null);
          }}
          siteId={siteId}
          package={{
            ...selectedPackage,
            chemicals: selectedPackage.chemicals.map((c) => ({
              chemicalSiteApplicationId: c.chemicalSiteApplication.id,
              applicationOrder: c.applicationOrder,
            })),
          }}
        />
      )}

      {/* Package Detail Modal */}
      {selectedPackage && !showEditModal && (
        <Modal
          isOpen={!!selectedPackage && !showEditModal}
          onClose={() => setSelectedPackage(null)}
          title={selectedPackage.name}
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Single Wash</p>
                <p className="text-lg font-semibold text-text-primary">
                  {formatPrice(selectedPackage.singleWashPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Membership</p>
                <p className="text-lg font-semibold text-text-primary">
                  {formatPrice(selectedPackage.membershipPrice)}/mo
                </p>
              </div>
            </div>

            {selectedPackage.description && (
              <div>
                <p className="text-sm text-text-secondary">Description</p>
                <p className="text-text-primary">{selectedPackage.description}</p>
              </div>
            )}

            {selectedPackage.isFromTemplate && selectedPackage.templateItem && (
              <div>
                <p className="text-sm text-text-secondary">Template</p>
                <p className="text-text-primary">
                  {selectedPackage.templateItem.template.name} /{' '}
                  {selectedPackage.templateItem.name}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-text-secondary mb-2">
                Chemicals ({selectedPackage.chemicals.length})
              </p>
              {selectedPackage.chemicals.length === 0 ? (
                <p className="text-text-tertiary">No chemicals assigned</p>
              ) : (
                <div className="space-y-2">
                  {selectedPackage.chemicals.map((chem) => (
                    <div
                      key={chem.id}
                      className="flex items-center gap-3 p-2 bg-bg-secondary rounded"
                    >
                      <span className="text-sm font-medium text-text-tertiary w-6">
                        {chem.applicationOrder}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">
                          {chem.chemicalSiteApplication.applicationName ||
                            chem.chemicalSiteApplication.chemicalSiteConfig
                              .chemicalOrgConfig.chemicalMaster.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatChemicalType(
                            chem.chemicalSiteApplication.chemicalSiteConfig
                              .chemicalOrgConfig.chemicalMaster.type
                          )}{' '}
                          | {chem.chemicalSiteApplication.injectorType.name} @{' '}
                          {chem.chemicalSiteApplication.injectorType.gpm} GPM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canEdit && (
              <div className="flex gap-2 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                  }}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedPackage && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
          }}
          onConfirm={handleDeletePackage}
          title="Delete Package"
          message={`Are you sure you want to delete "${selectedPackage.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="destructive"
        />
      )}

      {/* Apply Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Apply Template"
      >
        <div className="p-6">
          <p className="text-text-secondary mb-4">
            Select a template to apply its packages to this site. This will create
            new packages based on the template.
          </p>
          {templates.length === 0 ? (
            <p className="text-text-tertiary text-center py-4">
              No templates available
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleApplyTemplate(template.id)}
                  disabled={applyingTemplate}
                  className="w-full p-4 text-left border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text-primary">
                      {template.name}
                    </span>
                    {template.isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                        Default
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="secondary"
              onClick={() => setShowTemplateModal(false)}
              disabled={applyingTemplate}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
