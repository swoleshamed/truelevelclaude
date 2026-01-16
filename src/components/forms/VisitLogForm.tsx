// ===========================================
// FILE: src/components/forms/VisitLogForm.tsx
// PURPOSE: Form for creating/editing visit logs
// PRD REFERENCE: PRD Section 6.1 - Visit Logs
// USED BY: VisitLogList, SiteVisitPage
// ===========================================

'use client';

import React, { useState } from 'react';
import { Button, Input, Modal } from '@/components/ui';

interface VisitLogFormData {
  visitDate: string;
  publicNotes: string;
  privateNotes: string;
  serviceNotes: string;
  privateServiceNotes: string;
}

interface VisitLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (visitId: string) => void;
  siteId: string;
  siteName: string;
  showPrivateFields?: boolean;
  visit?: {
    id: string;
    visitDate: string;
    publicNotes: string | null;
    privateNotes: string | null;
    serviceNotes: string | null;
    privateServiceNotes: string | null;
  };
}

/**
 * VisitLogForm Component
 *
 * WHY: Create or edit visit logs for recording site visits.
 * Visit logs are the umbrella for chemical and service entries.
 *
 * FEATURES:
 * - Create new visit (if no visit prop)
 * - Edit existing visit (if visit prop provided)
 * - Date picker for visit date
 * - Public notes (visible to everyone)
 * - Private notes (distributor only)
 * - Service notes for equipment-related comments
 *
 * FIELDS (PRD Section 6.1):
 * - Visit Date: Required, when the visit occurred
 * - Public Notes: Optional, visible to site operators
 * - Private Notes: Optional, distributor-only
 * - Service Notes: Optional, equipment-related notes
 * - Private Service Notes: Optional, distributor-only service notes
 */
export function VisitLogForm({
  isOpen,
  onClose,
  onSuccess,
  siteId,
  siteName,
  showPrivateFields = false,
  visit,
}: VisitLogFormProps) {
  const isEdit = !!visit;

  const [formData, setFormData] = useState<VisitLogFormData>({
    visitDate: visit?.visitDate
      ? new Date(visit.visitDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    publicNotes: visit?.publicNotes || '',
    privateNotes: visit?.privateNotes || '',
    serviceNotes: visit?.serviceNotes || '',
    privateServiceNotes: visit?.privateServiceNotes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate form data
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
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
      const url = isEdit ? `/api/visits/${visit.id}` : '/api/visits';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        visitDate: formData.visitDate,
        publicNotes: formData.publicNotes || null,
        privateNotes: formData.privateNotes || null,
        serviceNotes: formData.serviceNotes || null,
        privateServiceNotes: formData.privateServiceNotes || null,
        ...(isEdit ? {} : { siteId }),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save visit');
      }

      const result = await response.json();
      onSuccess(result.id);
      handleClose();
    } catch (error: any) {
      console.error('Error saving visit:', error);
      alert(error.message || 'Failed to save visit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setFormData({
      visitDate: visit?.visitDate
        ? new Date(visit.visitDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      publicNotes: visit?.publicNotes || '',
      privateNotes: visit?.privateNotes || '',
      serviceNotes: visit?.serviceNotes || '',
      privateServiceNotes: visit?.privateServiceNotes || '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Visit' : 'New Visit'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Site Name (display only) */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Site
          </label>
          <p className="text-text-primary font-medium">{siteName}</p>
        </div>

        {/* Visit Date */}
        <Input
          label="Visit Date"
          type="date"
          value={formData.visitDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, visitDate: e.target.value }))
          }
          error={errors.visitDate}
          required
        />

        {/* Public Notes */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-secondary text-text-primary"
            rows={3}
            placeholder="General visit notes (visible to site operators)..."
            value={formData.publicNotes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, publicNotes: e.target.value }))
            }
          />
          <p className="text-xs text-text-tertiary mt-1">
            These notes are visible to site operators
          </p>
        </div>

        {/* Private Notes (distributor only) */}
        {showPrivateFields && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Private Notes
              <span className="ml-2 text-xs text-warning">(Distributor only)</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-secondary text-text-primary"
              rows={2}
              placeholder="Internal notes (not visible to site operators)..."
              value={formData.privateNotes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, privateNotes: e.target.value }))
              }
            />
          </div>
        )}

        {/* Service Notes */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Service Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-secondary text-text-primary"
            rows={2}
            placeholder="Equipment-related notes..."
            value={formData.serviceNotes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, serviceNotes: e.target.value }))
            }
          />
        </div>

        {/* Private Service Notes (distributor only) */}
        {showPrivateFields && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Private Service Notes
              <span className="ml-2 text-xs text-warning">(Distributor only)</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-secondary text-text-primary"
              rows={2}
              placeholder="Internal service notes..."
              value={formData.privateServiceNotes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  privateServiceNotes: e.target.value,
                }))
              }
            />
          </div>
        )}

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
            {isEdit ? 'Update' : 'Create'} Visit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
