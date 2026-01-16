// ===========================================
// FILE: src/components/forms/SiteChemicalConfigForm.tsx
// PURPOSE: Form for configuring chemicals for sites (alert thresholds)
// PRD REFERENCE: PRD Section 3.3 - Site Chemical Configuration
// USED BY: OrganizationChemicalCatalog
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal } from '@/components/ui';

interface SiteChemicalConfigFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  chemicalOrgConfigId: string;
  chemicalName: string;
  organizationId: string;
}

interface Site {
  id: string;
  name: string;
}

/**
 * SiteChemicalConfigForm Component
 *
 * WHY: Organizations need to configure which chemicals are available
 * at each site and set alert thresholds for inventory monitoring.
 *
 * FEATURES:
 * - Select site from organization's sites
 * - Set alert threshold in gallons
 * - Validation before submission
 * - Error handling
 *
 * BUSINESS LOGIC:
 * - Creates ChemicalSiteConfig record
 * - Links ChemicalOrgConfig to Site
 * - Alert threshold determines LOW_STOCK/CRITICAL status
 */
export function SiteChemicalConfigForm({
  isOpen,
  onClose,
  onSuccess,
  chemicalOrgConfigId,
  chemicalName,
  organizationId,
}: SiteChemicalConfigFormProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);

  /**
   * Fetch organization's sites on mount
   * WHY: Need list of sites to configure
   */
  useEffect(() => {
    if (isOpen) {
      fetchSites();
    }
  }, [isOpen, organizationId]);

  const fetchSites = async () => {
    try {
      setLoadingSites(true);
      // TODO Phase 5: Create sites API endpoint
      // For now, use mock data
      setSites([
        { id: 'site-1', name: 'Main Street Location' },
        { id: 'site-2', name: 'Highway 101 Location' },
        { id: 'site-3', name: 'Downtown Location' },
      ]);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoadingSites(false);
    }
  };

  /**
   * Validate form data
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedSiteId) {
      newErrors.site = 'Please select a site';
    }

    if (alertThreshold && isNaN(parseFloat(alertThreshold))) {
      newErrors.threshold = 'Alert threshold must be a number';
    }

    if (alertThreshold && parseFloat(alertThreshold) < 0) {
      newErrors.threshold = 'Alert threshold must be positive';
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
      const payload = {
        chemicalOrgConfigId,
        siteId: selectedSiteId,
        alertThresholdGallons: alertThreshold
          ? parseFloat(alertThreshold)
          : null,
      };

      const response = await fetch('/api/chemicals/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to configure chemical for site');
      }

      // Success!
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error configuring site chemical:', error);
      alert(error.message || 'Failed to configure chemical. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setSelectedSiteId('');
    setAlertThreshold('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Configure ${chemicalName} for Site`}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Site Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Select Site <span className="text-error">*</span>
          </label>
          {loadingSites ? (
            <p className="text-sm text-text-secondary">Loading sites...</p>
          ) : (
            <Select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
            >
              <option value="">Choose a site...</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </Select>
          )}
          {errors.site && (
            <p className="text-sm text-error mt-1">{errors.site}</p>
          )}
        </div>

        {/* Alert Threshold */}
        <Input
          label="Alert Threshold (gallons)"
          type="number"
          step="0.1"
          min="0"
          placeholder="e.g., 15"
          value={alertThreshold}
          onChange={(e) => setAlertThreshold(e.target.value)}
          error={errors.threshold}
          helperText="Optional: Trigger LOW_STOCK alert when tank level drops below this amount"
        />

        {/* Info message */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This makes the chemical available for tank
            assignment at the selected site. The alert threshold helps monitor
            inventory levels.
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
            disabled={isSubmitting || loadingSites}
            loading={isSubmitting}
            className="flex-1"
          >
            Configure for Site
          </Button>
        </div>
      </form>
    </Modal>
  );
}
