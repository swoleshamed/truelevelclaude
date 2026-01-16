// ===========================================
// FILE: src/components/forms/ChemicalForm.tsx
// PURPOSE: Form for creating/editing chemical master records
// PRD REFERENCE: PRD Section 3.1 - Chemical Master Catalog
// USED BY: DistributorChemicalCatalog
// ===========================================

'use client';

import React, { useState } from 'react';
import { Button, Input, Select, Modal } from '@/components/ui';

interface ChemicalFormData {
  name: string;
  type: string;
  manufacturer: string;
  description: string;
}

interface ChemicalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  distributorId: string;
  chemical?: {
    id: string;
    name: string;
    type: string;
    manufacturer: string | null;
    description: string | null;
  };
}

/**
 * ChemicalForm Component
 *
 * WHY: Distributors need to create and edit chemicals in their catalog.
 * This form handles both creation and editing with proper validation.
 *
 * FEATURES:
 * - Create new chemical (if no chemical prop)
 * - Edit existing chemical (if chemical prop provided)
 * - Form validation before submission
 * - Error handling and user feedback
 * - Reset form on cancel
 *
 * FIELDS (PRD Section 3.1):
 * - Name: Required, unique per distributor
 * - Type: Required, from predefined enum
 * - Manufacturer: Optional, brand/supplier name
 * - Description: Optional, notes about chemical
 */
export function ChemicalForm({
  isOpen,
  onClose,
  onSuccess,
  distributorId,
  chemical,
}: ChemicalFormProps) {
  const isEdit = !!chemical;

  const [formData, setFormData] = useState<ChemicalFormData>({
    name: chemical?.name || '',
    type: chemical?.type || '',
    manufacturer: chemical?.manufacturer || '',
    description: chemical?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate form data
   * WHY: Client-side validation for better UX
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Chemical name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Chemical type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * WHY: Create or update chemical via API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEdit ? `/api/chemicals/${chemical.id}` : '/api/chemicals';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit
        ? formData // For edit, send only changed fields
        : { ...formData, distributorId }; // For create, include distributorId

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save chemical');
      }

      // Success!
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving chemical:', error);
      alert(error.message || 'Failed to save chemical. Please try again.');
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
      name: chemical?.name || '',
      type: chemical?.type || '',
      manufacturer: chemical?.manufacturer || '',
      description: chemical?.description || '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Chemical' : 'Add Chemical'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Name */}
        <Input
          label="Chemical Name"
          placeholder="e.g., Super Soap Pro"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          error={errors.name}
          required
        />

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Chemical Type <span className="text-error">*</span>
          </label>
          <Select
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
          >
            <option value="">Select type...</option>
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
          {errors.type && (
            <p className="text-sm text-error mt-1">{errors.type}</p>
          )}
        </div>

        {/* Manufacturer */}
        <Input
          label="Manufacturer"
          placeholder="e.g., ChemTech Industries"
          value={formData.manufacturer}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))
          }
          helperText="Optional: Brand or supplier name"
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-secondary text-text-primary"
            rows={3}
            placeholder="Optional notes about this chemical..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <p className="text-xs text-text-tertiary mt-1">
            Optional: Usage notes, warnings, or special instructions
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
            {isEdit ? 'Update' : 'Create'} Chemical
          </Button>
        </div>
      </form>
    </Modal>
  );
}
