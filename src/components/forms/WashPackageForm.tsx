// ===========================================
// FILE: src/components/forms/WashPackageForm.tsx
// PURPOSE: Form for creating/editing wash packages at site level
// PRD REFERENCE: PRD Section 5.2 - Site Packages
// USED BY: SitePackageCatalog
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Checkbox } from '@/components/ui';

interface ChemicalApplication {
  id: string;
  applicationNumber: number;
  applicationName: string | null;
  chemicalSiteConfig: {
    id: string;
    chemicalOrgConfig: {
      id: string;
      chemicalMaster: {
        id: string;
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
}

interface WashPackageFormData {
  name: string;
  displayOrder: number;
  singleWashPrice: string;
  membershipPrice: string;
  description: string;
  selectedChemicals: string[]; // Array of chemicalSiteApplicationIds
}

interface WashPackageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  siteId: string;
  package?: {
    id: string;
    name: string;
    displayOrder: number;
    singleWashPrice: number | null;
    membershipPrice: number | null;
    description: string | null;
    chemicals?: Array<{
      chemicalSiteApplicationId: string;
      applicationOrder: number;
    }>;
  };
}

/**
 * WashPackageForm Component
 *
 * WHY: Sites need to create and edit their wash packages.
 * Each package defines a tier of service (Basic, Premium, etc.)
 * with associated chemicals.
 *
 * FEATURES:
 * - Create new package (if no package prop)
 * - Edit existing package (if package prop provided)
 * - Select chemicals to include in the package
 * - Set pricing for single wash and membership
 *
 * FIELDS (PRD Section 5.2):
 * - Name: Required, package display name
 * - Display Order: Required, menu position
 * - Single Wash Price: Optional, one-time price
 * - Membership Price: Optional, monthly price
 * - Description: Optional, package description
 * - Chemicals: Multi-select from site's configured chemicals
 */
export function WashPackageForm({
  isOpen,
  onClose,
  onSuccess,
  siteId,
  package: pkg,
}: WashPackageFormProps) {
  const isEdit = !!pkg;

  const [formData, setFormData] = useState<WashPackageFormData>({
    name: pkg?.name || '',
    displayOrder: pkg?.displayOrder || 1,
    singleWashPrice: pkg?.singleWashPrice?.toString() || '',
    membershipPrice: pkg?.membershipPrice?.toString() || '',
    description: pkg?.description || '',
    selectedChemicals: pkg?.chemicals?.map((c) => c.chemicalSiteApplicationId) || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<ChemicalApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  /**
   * Fetch available chemical applications for this site
   * WHY: Users need to select which chemicals are included in this package
   */
  useEffect(() => {
    if (isOpen) {
      fetchApplications();
    }
  }, [isOpen, siteId]);

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      const response = await fetch(`/api/chemicals/application?siteId=${siteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  /**
   * Validate form data
   * WHY: Client-side validation for better UX
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Package name is required';
    }

    if (formData.displayOrder < 1) {
      newErrors.displayOrder = 'Display order must be at least 1';
    }

    if (formData.singleWashPrice && parseFloat(formData.singleWashPrice) < 0) {
      newErrors.singleWashPrice = 'Price cannot be negative';
    }

    if (formData.membershipPrice && parseFloat(formData.membershipPrice) < 0) {
      newErrors.membershipPrice = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * WHY: Create or update package via API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEdit ? `/api/packages/${pkg.id}` : '/api/packages';
      const method = isEdit ? 'PUT' : 'POST';

      // Build chemicals array with application order
      const chemicals = formData.selectedChemicals.map((id, index) => ({
        chemicalSiteApplicationId: id,
        applicationOrder: index + 1,
      }));

      const payload = {
        name: formData.name,
        displayOrder: formData.displayOrder,
        singleWashPrice: formData.singleWashPrice
          ? parseFloat(formData.singleWashPrice)
          : null,
        membershipPrice: formData.membershipPrice
          ? parseFloat(formData.membershipPrice)
          : null,
        description: formData.description || null,
        chemicals,
        ...(isEdit ? {} : { siteId }),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save package');
      }

      // Success!
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving package:', error);
      alert(error.message || 'Failed to save package. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle modal close
   * WHY: Reset form state when closing
   */
  const handleClose = () => {
    setFormData({
      name: pkg?.name || '',
      displayOrder: pkg?.displayOrder || 1,
      singleWashPrice: pkg?.singleWashPrice?.toString() || '',
      membershipPrice: pkg?.membershipPrice?.toString() || '',
      description: pkg?.description || '',
      selectedChemicals: pkg?.chemicals?.map((c) => c.chemicalSiteApplicationId) || [],
    });
    setErrors({});
    onClose();
  };

  /**
   * Toggle chemical selection
   */
  const toggleChemical = (applicationId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedChemicals.includes(applicationId);
      return {
        ...prev,
        selectedChemicals: isSelected
          ? prev.selectedChemicals.filter((id) => id !== applicationId)
          : [...prev.selectedChemicals, applicationId],
      };
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Package' : 'Create Package'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Name */}
        <Input
          label="Package Name"
          placeholder="e.g., Basic Wash, Premium, Ultimate"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          error={errors.name}
          required
        />

        {/* Display Order */}
        <Input
          label="Display Order"
          type="number"
          min={1}
          value={formData.displayOrder.toString()}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              displayOrder: parseInt(e.target.value) || 1,
            }))
          }
          error={errors.displayOrder}
          helperText="Position in the menu (1 = first)"
          required
        />

        {/* Pricing */}
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
            error={errors.singleWashPrice}
            helperText="One-time price"
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
            error={errors.membershipPrice}
            helperText="Monthly price"
          />
        </div>

        {/* Description */}
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

        {/* Chemical Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Included Chemicals
          </label>
          {loadingApplications ? (
            <div className="text-sm text-text-secondary py-4 text-center">
              Loading chemicals...
            </div>
          ) : applications.length === 0 ? (
            <div className="text-sm text-text-secondary py-4 text-center border border-border rounded-md">
              No chemicals configured for this site.
              <br />
              Add chemicals in the Chemicals section first.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                    formData.selectedChemicals.includes(app.id)
                      ? 'bg-primary/10 border border-primary'
                      : 'bg-bg-secondary hover:bg-bg-tertiary'
                  }`}
                  onClick={() => toggleChemical(app.id)}
                >
                  <Checkbox
                    checked={formData.selectedChemicals.includes(app.id)}
                    onChange={() => toggleChemical(app.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary truncate">
                      {app.applicationName || app.chemicalSiteConfig.chemicalOrgConfig.chemicalMaster.name}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {formatChemicalType(app.chemicalSiteConfig.chemicalOrgConfig.chemicalMaster.type)} |{' '}
                      {app.injectorType.name} @ {app.injectorType.gpm} GPM
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-text-tertiary mt-1">
            Select which chemicals are used in this package
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
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
            {isEdit ? 'Update' : 'Create'} Package
          </Button>
        </div>
      </form>
    </Modal>
  );
}
