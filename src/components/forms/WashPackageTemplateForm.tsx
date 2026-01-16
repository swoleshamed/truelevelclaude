// ===========================================
// FILE: src/components/forms/WashPackageTemplateForm.tsx
// PURPOSE: Form for creating/editing wash package templates
// PRD REFERENCE: PRD Section 5.1 - Package Templates
// USED BY: OrganizationPackageCatalog
// ===========================================

'use client';

import React, { useState } from 'react';
import { Button, Input, Checkbox, Modal } from '@/components/ui';

interface WashPackageTemplateFormData {
  name: string;
  isDefault: boolean;
}

interface WashPackageTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  template?: {
    id: string;
    name: string;
    isDefault: boolean;
  };
}

/**
 * WashPackageTemplateForm Component
 *
 * WHY: Organizations need to create and manage wash package templates.
 * Templates define standard packages that can be applied across all sites.
 *
 * FEATURES:
 * - Create new template (if no template prop)
 * - Edit existing template (if template prop provided)
 * - Set as default template option
 * - Form validation before submission
 *
 * FIELDS (PRD Section 5.1):
 * - Name: Required, template identifier
 * - Is Default: Optional, marks as the org's default template
 */
export function WashPackageTemplateForm({
  isOpen,
  onClose,
  onSuccess,
  organizationId,
  template,
}: WashPackageTemplateFormProps) {
  const isEdit = !!template;

  const [formData, setFormData] = useState<WashPackageTemplateFormData>({
    name: template?.name || '',
    isDefault: template?.isDefault || false,
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
      newErrors.name = 'Template name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * WHY: Create or update template via API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEdit
        ? `/api/packages/templates/${template.id}`
        : '/api/packages/templates';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit
        ? formData
        : { ...formData, organizationId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save template');
      }

      // Success!
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert(error.message || 'Failed to save template. Please try again.');
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
      name: template?.name || '',
      isDefault: template?.isDefault || false,
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Template' : 'Create Template'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Name */}
        <Input
          label="Template Name"
          placeholder="e.g., Standard Packages, Premium Menu"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          error={errors.name}
          required
        />

        {/* Is Default */}
        <Checkbox
          label="Set as default template"
          description="New sites will use this template's packages by default"
          checked={formData.isDefault}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))
          }
        />

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
            {isEdit ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </form>
    </Modal>
  );
}
