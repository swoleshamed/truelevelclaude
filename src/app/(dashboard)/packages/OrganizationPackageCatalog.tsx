// ===========================================
// FILE: src/app/(dashboard)/packages/OrganizationPackageCatalog.tsx
// PURPOSE: Wash package template management for organizations
// PRD REFERENCE: PRD Section 5.1 - Package Templates
// USED BY: Packages page (org admin role)
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Button, Card, Modal, Input, ConfirmModal } from '@/components/ui';
import { useFABAction } from '@/components/layout/FAB';
import { WashPackageTemplateForm } from '@/components/forms/WashPackageTemplateForm';

interface TemplateItem {
  id: string;
  name: string;
  displayOrder: number;
  singleWashPrice: number | null;
  membershipPrice: number | null;
  description: string | null;
  chemicals: Array<{
    id: string;
    applicationOrder: number;
    chemicalOrgConfig: {
      chemicalMaster: {
        name: string;
        type: string;
      };
    };
  }>;
}

interface WashPackageTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  items: TemplateItem[];
}

interface OrganizationPackageCatalogProps {
  organizationId: string;
  canEdit: boolean;
}

/**
 * OrganizationPackageCatalog Component
 *
 * WHY: Organizations create templates that define standard wash packages.
 * These templates can be applied to sites to quickly set up their menu.
 *
 * FEATURES (PRD Section 5.1):
 * - View all package templates
 * - Create new templates
 * - Add/edit/remove items from templates
 * - Set default template
 * - Assign chemicals to template items
 */
export function OrganizationPackageCatalog({
  organizationId,
  canEdit,
}: OrganizationPackageCatalogProps) {
  const [templates, setTemplates] = useState<WashPackageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WashPackageTemplate | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TemplateItem | null>(null);

  /**
   * Configure FAB for adding templates
   * WHY: Quick access to create new template (admins only)
   */
  useFABAction(
    canEdit
      ? {
          label: 'Add Template',
          icon: 'plus',
          onClick: () => setShowCreateModal(true),
        }
      : null
  );

  /**
   * Fetch templates on mount
   * WHY: Load organization's package templates
   */
  useEffect(() => {
    fetchTemplates();
  }, [organizationId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/packages/templates?organizationId=${organizationId}&includeItems=true`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      alert('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle template deletion
   */
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch(`/api/packages/templates/${selectedTemplate.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete template');
      }

      await fetchTemplates();
      setShowDeleteConfirm(false);
      setSelectedTemplate(null);
    } catch (error: any) {
      console.error('Error deleting template:', error);
      alert(error.message || 'Failed to delete template. Please try again.');
    }
  };

  /**
   * Handle adding a new item to template
   */
  const handleAddItem = async (templateId: string, itemData: any) => {
    try {
      const response = await fetch(`/api/packages/templates/${templateId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add item');
      }

      await fetchTemplates();
      setShowItemModal(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Error adding item:', error);
      alert(error.message || 'Failed to add item. Please try again.');
    }
  };

  /**
   * Handle updating an item
   */
  const handleUpdateItem = async (templateId: string, itemData: any) => {
    try {
      const response = await fetch(`/api/packages/templates/${templateId}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update item');
      }

      await fetchTemplates();
      setShowItemModal(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Error updating item:', error);
      alert(error.message || 'Failed to update item. Please try again.');
    }
  };

  /**
   * Handle deleting an item
   */
  const handleDeleteItem = async (templateId: string, itemId: string) => {
    try {
      const response = await fetch(
        `/api/packages/templates/${templateId}/items?itemId=${itemId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete item');
      }

      await fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      alert(error.message || 'Failed to delete item. Please try again.');
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
          title="Package Templates"
          subtitle="Loading templates..."
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
        title="Package Templates"
        subtitle={`Managing ${templates.length} templates`}
        action={
          canEdit ? (
            <Button onClick={() => setShowCreateModal(true)}>
              Add Template
            </Button>
          ) : undefined
        }
      />

      {/* Templates list */}
      {templates.length === 0 ? (
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
              No templates yet
            </h3>
            <p className="text-text-secondary mb-4">
              Create a template to define standard wash packages for your sites
            </p>
            {canEdit && (
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Template
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {templates.map((template) => (
            <Card key={template.id}>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-text-primary">
                      {template.name}
                    </h2>
                    {template.isDefault && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setEditingItem(null);
                          setShowItemModal(true);
                        }}
                      >
                        Add Package
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  {template.items.length} packages
                </p>
              </div>

              {/* Template items */}
              {template.items.length === 0 ? (
                <div className="p-6 text-center text-text-secondary">
                  No packages in this template yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {template.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-bg-secondary transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text-tertiary">
                              #{item.displayOrder}
                            </span>
                            <h3 className="font-medium text-text-primary">
                              {item.name}
                            </h3>
                          </div>
                          {item.description && (
                            <p className="text-sm text-text-secondary mt-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-text-secondary">
                              Single: {formatPrice(item.singleWashPrice)}
                            </span>
                            <span className="text-text-secondary">
                              Member: {formatPrice(item.membershipPrice)}/mo
                            </span>
                          </div>
                          {item.chemicals.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {item.chemicals.map((chem) => (
                                <span
                                  key={chem.id}
                                  className="px-2 py-0.5 text-xs bg-bg-tertiary rounded text-text-secondary"
                                >
                                  {chem.chemicalOrgConfig.chemicalMaster.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setEditingItem(item);
                                setShowItemModal(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(template.id, item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      <WashPackageTemplateForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchTemplates}
        organizationId={organizationId}
      />

      {/* Edit Template Modal */}
      {selectedTemplate && (
        <WashPackageTemplateForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTemplate(null);
          }}
          onSuccess={fetchTemplates}
          organizationId={organizationId}
          template={selectedTemplate}
        />
      )}

      {/* Delete Template Confirmation */}
      {selectedTemplate && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedTemplate(null);
          }}
          onConfirm={handleDeleteTemplate}
          title="Delete Template"
          message={`Are you sure you want to delete "${selectedTemplate.name}"? This will remove all packages in this template.`}
          confirmText="Delete"
          confirmVariant="destructive"
        />
      )}

      {/* Add/Edit Item Modal */}
      {selectedTemplate && (
        <TemplateItemModal
          isOpen={showItemModal}
          onClose={() => {
            setShowItemModal(false);
            setEditingItem(null);
          }}
          templateId={selectedTemplate.id}
          organizationId={organizationId}
          item={editingItem}
          onSave={editingItem ? handleUpdateItem : handleAddItem}
        />
      )}
    </PageContainer>
  );
}

/**
 * Template Item Modal for adding/editing packages within a template
 */
interface TemplateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  organizationId: string;
  item: TemplateItem | null;
  onSave: (templateId: string, data: any) => void;
}

function TemplateItemModal({
  isOpen,
  onClose,
  templateId,
  organizationId,
  item,
  onSave,
}: TemplateItemModalProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    displayOrder: item?.displayOrder?.toString() || '',
    singleWashPrice: item?.singleWashPrice?.toString() || '',
    membershipPrice: item?.membershipPrice?.toString() || '',
    description: item?.description || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when item changes
  useEffect(() => {
    setFormData({
      name: item?.name || '',
      displayOrder: item?.displayOrder?.toString() || '',
      singleWashPrice: item?.singleWashPrice?.toString() || '',
      membershipPrice: item?.membershipPrice?.toString() || '',
      description: item?.description || '',
    });
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        ...(item ? { id: item.id } : {}),
        name: formData.name,
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : undefined,
        singleWashPrice: formData.singleWashPrice
          ? parseFloat(formData.singleWashPrice)
          : null,
        membershipPrice: formData.membershipPrice
          ? parseFloat(formData.membershipPrice)
          : null,
        description: formData.description || null,
      };

      await onSave(templateId, data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Package' : 'Add Package'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label="Package Name"
          placeholder="e.g., Basic, Premium, Ultimate"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
        />

        <Input
          label="Display Order"
          type="number"
          min={1}
          placeholder="1"
          value={formData.displayOrder}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, displayOrder: e.target.value }))
          }
          helperText="Position in the menu (leave empty for auto)"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Single Wash Price"
            type="number"
            step="0.01"
            min={0}
            placeholder="0.00"
            value={formData.singleWashPrice}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, singleWashPrice: e.target.value }))
            }
          />
          <Input
            label="Membership Price"
            type="number"
            step="0.01"
            min={0}
            placeholder="0.00"
            value={formData.membershipPrice}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, membershipPrice: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-secondary text-text-primary"
            rows={2}
            placeholder="Optional description..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="flex-1"
          >
            {item ? 'Update' : 'Add'} Package
          </Button>
        </div>
      </form>
    </Modal>
  );
}
