// ===========================================
// FILE: src/components/forms/ServiceEntryForm.tsx
// PURPOSE: Form for recording service/equipment entries
// PRD REFERENCE: PRD Section 6.3 - Service Entries
// USED BY: VisitLogDetail
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Select, Checkbox, Modal } from '@/components/ui';

interface ChemicalApplication {
  id: string;
  applicationNumber: number;
  applicationName: string | null;
  injectorTypeId: string;
  tipTypeId: string;
  chemicalSiteConfig: {
    chemicalOrgConfig: {
      chemicalMaster: {
        name: string;
        type: string;
      };
    };
  };
  injectorType: {
    id: string;
    name: string;
    gpm: string;
  };
  tipType: {
    id: string;
    name: string;
  };
}

interface InjectorType {
  id: string;
  system: string;
  name: string;
  gpm: string;
}

interface TipType {
  id: string;
  category: string;
  name: string;
}

interface ServiceEntryFormData {
  chemicalSiteApplicationId: string;
  equipmentChanged: boolean;
  previousInjectorTypeId: string;
  previousTipTypeId: string;
  newInjectorTypeId: string;
  newTipTypeId: string;
  notes: string;
}

interface ServiceEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  visitId: string;
  siteId: string;
  entry?: {
    id: string;
    chemicalSiteApplicationId: string;
    equipmentChanged: boolean;
    previousInjectorTypeId: string | null;
    previousTipTypeId: string | null;
    newInjectorTypeId: string | null;
    newTipTypeId: string | null;
    notes: string | null;
  };
}

/**
 * ServiceEntryForm Component
 *
 * WHY: Record equipment changes during site visits.
 * Tracks injector and tip replacements for service history.
 *
 * FEATURES:
 * - Select application (chemical/injector slot)
 * - Toggle equipment changed
 * - Record previous equipment (auto-filled from current)
 * - Select new equipment
 * - Service notes
 *
 * FIELDS (PRD Section 6.3):
 * - Application: Which injector slot was serviced
 * - Equipment Changed: Whether equipment was replaced
 * - Previous Injector/Tip: What was there before
 * - New Injector/Tip: What was installed
 */
export function ServiceEntryForm({
  isOpen,
  onClose,
  onSuccess,
  visitId,
  siteId,
  entry,
}: ServiceEntryFormProps) {
  const isEdit = !!entry;

  const [formData, setFormData] = useState<ServiceEntryFormData>({
    chemicalSiteApplicationId: entry?.chemicalSiteApplicationId || '',
    equipmentChanged: entry?.equipmentChanged || false,
    previousInjectorTypeId: entry?.previousInjectorTypeId || '',
    previousTipTypeId: entry?.previousTipTypeId || '',
    newInjectorTypeId: entry?.newInjectorTypeId || '',
    newTipTypeId: entry?.newTipTypeId || '',
    notes: entry?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<ChemicalApplication[]>([]);
  const [injectorTypes, setInjectorTypes] = useState<InjectorType[]>([]);
  const [tipTypes, setTipTypes] = useState<TipType[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch applications and equipment types
   */
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, siteId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, injectorsRes, tipsRes] = await Promise.all([
        fetch(`/api/chemicals/application?siteId=${siteId}`),
        fetch('/api/equipment/injectors'),
        fetch('/api/equipment/tips'),
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }

      if (injectorsRes.ok) {
        const injectorsData = await injectorsRes.json();
        setInjectorTypes(injectorsData);
      }

      if (tipsRes.ok) {
        const tipsData = await tipsRes.json();
        setTipTypes(tipsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Auto-fill previous equipment when application is selected
   */
  useEffect(() => {
    if (formData.chemicalSiteApplicationId && !isEdit) {
      const app = applications.find(
        (a) => a.id === formData.chemicalSiteApplicationId
      );
      if (app) {
        setFormData((prev) => ({
          ...prev,
          previousInjectorTypeId: app.injectorTypeId,
          previousTipTypeId: app.tipTypeId,
        }));
      }
    }
  }, [formData.chemicalSiteApplicationId, applications, isEdit]);

  /**
   * Validate form data
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.chemicalSiteApplicationId) {
      newErrors.chemicalSiteApplicationId = 'Please select an application';
    }

    if (formData.equipmentChanged) {
      if (!formData.newInjectorTypeId && !formData.newTipTypeId) {
        newErrors.equipment = 'Please select new equipment';
      }
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
      const url = `/api/visits/${visitId}/services`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...(isEdit && { id: entry.id }),
        chemicalSiteApplicationId: formData.chemicalSiteApplicationId,
        equipmentChanged: formData.equipmentChanged,
        previousInjectorTypeId: formData.previousInjectorTypeId || null,
        previousTipTypeId: formData.previousTipTypeId || null,
        newInjectorTypeId: formData.equipmentChanged
          ? formData.newInjectorTypeId || null
          : null,
        newTipTypeId: formData.equipmentChanged
          ? formData.newTipTypeId || null
          : null,
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
      chemicalSiteApplicationId: entry?.chemicalSiteApplicationId || '',
      equipmentChanged: entry?.equipmentChanged || false,
      previousInjectorTypeId: entry?.previousInjectorTypeId || '',
      previousTipTypeId: entry?.previousTipTypeId || '',
      newInjectorTypeId: entry?.newInjectorTypeId || '',
      newTipTypeId: entry?.newTipTypeId || '',
      notes: entry?.notes || '',
    });
    setErrors({});
    onClose();
  };

  /**
   * Get current application details
   */
  const selectedApp = applications.find(
    (a) => a.id === formData.chemicalSiteApplicationId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Service Entry' : 'Add Service Entry'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Application Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Application <span className="text-error">*</span>
          </label>
          {loading ? (
            <p className="text-text-secondary">Loading applications...</p>
          ) : (
            <Select
              value={formData.chemicalSiteApplicationId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  chemicalSiteApplicationId: e.target.value,
                }))
              }
              disabled={isEdit}
            >
              <option value="">Select application...</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  #{app.applicationNumber} -{' '}
                  {app.applicationName ||
                    app.chemicalSiteConfig.chemicalOrgConfig.chemicalMaster.name}
                </option>
              ))}
            </Select>
          )}
          {errors.chemicalSiteApplicationId && (
            <p className="text-sm text-error mt-1">
              {errors.chemicalSiteApplicationId}
            </p>
          )}
        </div>

        {/* Current Equipment Display */}
        {selectedApp && (
          <div className="bg-bg-tertiary rounded-md p-4">
            <p className="text-sm font-medium text-text-secondary mb-2">
              Current Equipment
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-tertiary">Injector</p>
                <p className="text-text-primary font-medium">
                  {selectedApp.injectorType.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {selectedApp.injectorType.gpm} GPM
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Tip</p>
                <p className="text-text-primary font-medium">
                  {selectedApp.tipType.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Equipment Changed Toggle */}
        <Checkbox
          label="Equipment Changed"
          description="Check if injector or tip was replaced during this visit"
          checked={formData.equipmentChanged}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              equipmentChanged: e.target.checked,
            }))
          }
        />

        {/* New Equipment Selection */}
        {formData.equipmentChanged && (
          <div className="border border-border rounded-md p-4 space-y-4">
            <p className="text-sm font-medium text-text-primary">
              New Equipment
            </p>

            {/* New Injector */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                New Injector
              </label>
              <Select
                value={formData.newInjectorTypeId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newInjectorTypeId: e.target.value,
                  }))
                }
              >
                <option value="">No change</option>
                {injectorTypes.map((inj) => (
                  <option key={inj.id} value={inj.id}>
                    {inj.name} ({inj.gpm} GPM) - {inj.system}
                  </option>
                ))}
              </Select>
            </div>

            {/* New Tip */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                New Tip
              </label>
              <Select
                value={formData.newTipTypeId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newTipTypeId: e.target.value,
                  }))
                }
              >
                <option value="">No change</option>
                {tipTypes.map((tip) => (
                  <option key={tip.id} value={tip.id}>
                    {tip.name} ({tip.category})
                  </option>
                ))}
              </Select>
            </div>

            {errors.equipment && (
              <p className="text-sm text-error">{errors.equipment}</p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Service Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-secondary text-text-primary"
            rows={3}
            placeholder="Notes about the service performed..."
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
