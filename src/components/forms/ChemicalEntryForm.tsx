// ===========================================
// FILE: src/components/forms/ChemicalEntryForm.tsx
// PURPOSE: Form for recording chemical inventory entries
// PRD REFERENCE: PRD Section 6.2 - Chemical Entries
// USED BY: VisitLogDetail
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Checkbox, Modal } from '@/components/ui';

interface ChemicalConfig {
  id: string;
  chemicalOrgConfig: {
    id: string;
    primaryContainer: string;
    backstockContainer: string;
    costPerGallon: string;
    chemicalMaster: {
      id: string;
      name: string;
      type: string;
    };
  };
}

interface ChemicalEntryFormData {
  chemicalSiteConfigId: string;
  entryMethod: 'GALLONS' | 'INCHES' | 'ESTIMATED';
  levelGallons: string;
  levelInches: string;
  backstockCount: string;
  backstockGallons: string;
  deliveryReceived: boolean;
  deliveryCount: string;
  deliveryGallons: string;
  totalOnHandGallons: string;
  notes: string;
}

interface ChemicalEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  visitId: string;
  siteId: string;
  entry?: {
    id: string;
    chemicalSiteConfigId: string;
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
  };
}

/**
 * ChemicalEntryForm Component
 *
 * WHY: Record inventory measurements during site visits.
 * Supports multiple entry methods (gallons, inches, estimated).
 *
 * FEATURES:
 * - Select chemical from site's configured chemicals
 * - Entry method selection (gallons/inches/estimated)
 * - Primary container level
 * - Backstock count and gallons
 * - Delivery recording
 * - Auto-calculate total on hand
 *
 * FIELDS (PRD Section 6.2):
 * - Chemical: Required, which chemical to record
 * - Entry Method: How measurement was taken
 * - Level: Tank level in gallons or inches
 * - Backstock: Count and total gallons of backup containers
 * - Delivery: If delivery was received during visit
 */
export function ChemicalEntryForm({
  isOpen,
  onClose,
  onSuccess,
  visitId,
  siteId,
  entry,
}: ChemicalEntryFormProps) {
  const isEdit = !!entry;

  const [formData, setFormData] = useState<ChemicalEntryFormData>({
    chemicalSiteConfigId: entry?.chemicalSiteConfigId || '',
    entryMethod: (entry?.entryMethod as 'GALLONS' | 'INCHES' | 'ESTIMATED') || 'GALLONS',
    levelGallons: entry?.levelGallons?.toString() || '',
    levelInches: entry?.levelInches?.toString() || '',
    backstockCount: entry?.backstockCount?.toString() || '0',
    backstockGallons: entry?.backstockGallons?.toString() || '0',
    deliveryReceived: entry?.deliveryReceived || false,
    deliveryCount: entry?.deliveryCount?.toString() || '',
    deliveryGallons: entry?.deliveryGallons?.toString() || '',
    totalOnHandGallons: entry?.totalOnHandGallons?.toString() || '0',
    notes: entry?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chemicals, setChemicals] = useState<ChemicalConfig[]>([]);
  const [loadingChemicals, setLoadingChemicals] = useState(true);

  /**
   * Fetch available chemicals for this site
   */
  useEffect(() => {
    if (isOpen) {
      fetchChemicals();
    }
  }, [isOpen, siteId]);

  const fetchChemicals = async () => {
    try {
      setLoadingChemicals(true);
      const response = await fetch(`/api/chemicals/site-config?siteId=${siteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chemicals');
      }
      const data = await response.json();
      setChemicals(data);
    } catch (error) {
      console.error('Error fetching chemicals:', error);
    } finally {
      setLoadingChemicals(false);
    }
  };

  /**
   * Calculate total on hand when values change
   */
  useEffect(() => {
    const level = parseFloat(formData.levelGallons) || 0;
    const backstock = parseFloat(formData.backstockGallons) || 0;
    const delivery = formData.deliveryReceived
      ? parseFloat(formData.deliveryGallons) || 0
      : 0;

    const total = level + backstock + delivery;
    setFormData((prev) => ({
      ...prev,
      totalOnHandGallons: total.toFixed(2),
    }));
  }, [
    formData.levelGallons,
    formData.backstockGallons,
    formData.deliveryReceived,
    formData.deliveryGallons,
  ]);

  /**
   * Validate form data
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.chemicalSiteConfigId) {
      newErrors.chemicalSiteConfigId = 'Please select a chemical';
    }

    if (formData.entryMethod === 'GALLONS' && !formData.levelGallons) {
      newErrors.levelGallons = 'Level is required';
    }

    if (formData.entryMethod === 'INCHES' && !formData.levelInches) {
      newErrors.levelInches = 'Level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = `/api/visits/${visitId}/chemicals`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...(isEdit && { id: entry.id }),
        chemicalSiteConfigId: formData.chemicalSiteConfigId,
        entryMethod: formData.entryMethod,
        levelGallons: formData.levelGallons ? parseFloat(formData.levelGallons) : null,
        levelInches: formData.levelInches ? parseFloat(formData.levelInches) : null,
        backstockCount: parseInt(formData.backstockCount) || 0,
        backstockGallons: parseFloat(formData.backstockGallons) || 0,
        deliveryReceived: formData.deliveryReceived,
        deliveryCount: formData.deliveryReceived && formData.deliveryCount
          ? parseInt(formData.deliveryCount)
          : null,
        deliveryGallons: formData.deliveryReceived && formData.deliveryGallons
          ? parseFloat(formData.deliveryGallons)
          : null,
        totalOnHandGallons: parseFloat(formData.totalOnHandGallons) || 0,
        notes: formData.notes || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save entry');
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving entry:', error);
      alert(error.message || 'Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setFormData({
      chemicalSiteConfigId: entry?.chemicalSiteConfigId || '',
      entryMethod: (entry?.entryMethod as 'GALLONS' | 'INCHES' | 'ESTIMATED') || 'GALLONS',
      levelGallons: entry?.levelGallons?.toString() || '',
      levelInches: entry?.levelInches?.toString() || '',
      backstockCount: entry?.backstockCount?.toString() || '0',
      backstockGallons: entry?.backstockGallons?.toString() || '0',
      deliveryReceived: entry?.deliveryReceived || false,
      deliveryCount: entry?.deliveryCount?.toString() || '',
      deliveryGallons: entry?.deliveryGallons?.toString() || '',
      totalOnHandGallons: entry?.totalOnHandGallons?.toString() || '0',
      notes: entry?.notes || '',
    });
    setErrors({});
    onClose();
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
      title={isEdit ? 'Edit Chemical Entry' : 'Add Chemical Entry'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Chemical Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Chemical <span className="text-error">*</span>
          </label>
          {loadingChemicals ? (
            <p className="text-text-secondary">Loading chemicals...</p>
          ) : (
            <Select
              value={formData.chemicalSiteConfigId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  chemicalSiteConfigId: e.target.value,
                }))
              }
              disabled={isEdit}
              options={[
                { value: '', label: 'Select chemical...' },
                ...chemicals.map((chem) => ({
                  value: chem.id,
                  label: `${chem.chemicalOrgConfig.chemicalMaster.name} (${formatChemicalType(chem.chemicalOrgConfig.chemicalMaster.type)})`,
                })),
              ]}
            />
          )}
          {errors.chemicalSiteConfigId && (
            <p className="text-sm text-error mt-1">{errors.chemicalSiteConfigId}</p>
          )}
        </div>

        {/* Entry Method */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Entry Method
          </label>
          <Select
            value={formData.entryMethod}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                entryMethod: e.target.value as 'GALLONS' | 'INCHES' | 'ESTIMATED',
              }))
            }
            options={[
              { value: 'GALLONS', label: 'Gallons' },
              { value: 'INCHES', label: 'Inches' },
              { value: 'ESTIMATED', label: 'Estimated' },
            ]}
          />
        </div>

        {/* Level Input */}
        {formData.entryMethod === 'GALLONS' && (
          <Input
            label="Tank Level (Gallons)"
            type="number"
            step="0.1"
            min={0}
            placeholder="0.0"
            value={formData.levelGallons}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, levelGallons: e.target.value }))
            }
            error={errors.levelGallons}
            required
          />
        )}

        {formData.entryMethod === 'INCHES' && (
          <Input
            label="Tank Level (Inches)"
            type="number"
            step="0.5"
            min={0}
            placeholder="0.0"
            value={formData.levelInches}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, levelInches: e.target.value }))
            }
            error={errors.levelInches}
            helperText="Will be converted to gallons based on container type"
            required
          />
        )}

        {formData.entryMethod === 'ESTIMATED' && (
          <Input
            label="Estimated Level (Gallons)"
            type="number"
            step="0.5"
            min={0}
            placeholder="0.0"
            value={formData.levelGallons}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, levelGallons: e.target.value }))
            }
            helperText="Best estimate of current level"
          />
        )}

        {/* Backstock */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Backstock Count"
            type="number"
            min={0}
            value={formData.backstockCount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, backstockCount: e.target.value }))
            }
            helperText="Number of backup containers"
          />
          <Input
            label="Backstock Gallons"
            type="number"
            step="0.1"
            min={0}
            value={formData.backstockGallons}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, backstockGallons: e.target.value }))
            }
            helperText="Total gallons in backstock"
          />
        </div>

        {/* Delivery */}
        <div className="border border-border rounded-md p-4">
          <Checkbox
            label="Delivery Received"
            description="Check if a delivery was made during this visit"
            checked={formData.deliveryReceived}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                deliveryReceived: e.target.checked,
              }))
            }
          />

          {formData.deliveryReceived && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Delivery Count"
                type="number"
                min={0}
                value={formData.deliveryCount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryCount: e.target.value,
                  }))
                }
              />
              <Input
                label="Delivery Gallons"
                type="number"
                step="0.1"
                min={0}
                value={formData.deliveryGallons}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryGallons: e.target.value,
                  }))
                }
              />
            </div>
          )}
        </div>

        {/* Total On Hand (calculated) */}
        <div className="bg-bg-tertiary rounded-md p-4">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Total On Hand
          </label>
          <p className="text-2xl font-bold text-text-primary">
            {formData.totalOnHandGallons} gallons
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            Auto-calculated: Tank + Backstock + Delivery
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-secondary text-text-primary"
            rows={2}
            placeholder="Optional notes about this entry..."
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
          />
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
            {isEdit ? 'Update' : 'Add'} Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
}
