// ===========================================
// FILE: src/components/forms/ScheduleForm.tsx
// PURPOSE: Form for creating/editing scheduled visits
// PRD REFERENCE: PRD Section 8 - Visit Scheduling
// USED BY: Schedule page, site detail pages
// ===========================================

'use client';

import React, { useState } from 'react';
import { Button, Input, Select } from '@/components/ui';

interface Site {
  id: string;
  name: string;
  organizationName?: string;
}

interface ScheduleFormProps {
  sites: Site[];
  defaultSiteId?: string;
  defaultDate?: string;
  defaultNotes?: string;
  scheduleId?: string;
  mode?: 'single' | 'recurring';
  onSubmit: (data: ScheduleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ScheduleFormData {
  siteId: string;
  scheduledDate: string;
  notes?: string;
  // For recurring mode
  endDate?: string;
  intervalDays?: number;
}

/**
 * ScheduleForm Component
 *
 * WHY: Create or edit scheduled visits with site selection
 * and date/notes configuration. Supports single and recurring modes.
 *
 * FEATURES:
 * - Site selection dropdown
 * - Date picker for scheduled date
 * - Notes textarea
 * - Recurring mode with end date and interval
 * - Form validation
 *
 * @param sites - Available sites for selection
 * @param defaultSiteId - Pre-selected site ID
 * @param defaultDate - Pre-filled date
 * @param defaultNotes - Pre-filled notes
 * @param scheduleId - If editing, the schedule ID
 * @param mode - Single or recurring mode
 * @param onSubmit - Submit handler
 * @param onCancel - Cancel handler
 */
export function ScheduleForm({
  sites,
  defaultSiteId = '',
  defaultDate = '',
  defaultNotes = '',
  scheduleId,
  mode = 'single',
  onSubmit,
  onCancel,
  isLoading = false,
}: ScheduleFormProps) {
  const [siteId, setSiteId] = useState(defaultSiteId);
  const [scheduledDate, setScheduledDate] = useState(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(defaultNotes);
  const [endDate, setEndDate] = useState('');
  const [intervalDays, setIntervalDays] = useState(14);
  const [scheduleMode, setScheduleMode] = useState<'single' | 'recurring'>(mode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!scheduleId;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!siteId) {
      newErrors.siteId = 'Please select a site';
    }

    if (!scheduledDate) {
      newErrors.scheduledDate = 'Please select a date';
    }

    if (scheduleMode === 'recurring') {
      if (!endDate) {
        newErrors.endDate = 'Please select an end date';
      } else if (new Date(endDate) <= new Date(scheduledDate)) {
        newErrors.endDate = 'End date must be after start date';
      }

      if (intervalDays < 1 || intervalDays > 90) {
        newErrors.intervalDays = 'Interval must be between 1 and 90 days';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData: ScheduleFormData = {
      siteId,
      scheduledDate,
      notes: notes || undefined,
    };

    if (scheduleMode === 'recurring') {
      formData.endDate = endDate;
      formData.intervalDays = intervalDays;
    }

    await onSubmit(formData);
  };

  // Calculate number of visits for recurring
  const calculateRecurringCount = (): number => {
    if (!endDate || !scheduledDate) return 0;

    const start = new Date(scheduledDate);
    const end = new Date(endDate);
    let count = 0;
    let current = new Date(start);

    while (current <= end) {
      count++;
      current.setDate(current.getDate() + intervalDays);
    }

    return count;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Site Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Site *
        </label>
        <Select
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          disabled={isEditing}
          className={errors.siteId ? 'border-error' : ''}
        >
          <option value="">Select a site...</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
              {site.organizationName ? ` (${site.organizationName})` : ''}
            </option>
          ))}
        </Select>
        {errors.siteId && (
          <p className="mt-1 text-sm text-error">{errors.siteId}</p>
        )}
      </div>

      {/* Mode Toggle (only for new schedules) */}
      {!isEditing && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Schedule Type
          </label>
          <div className="inline-flex bg-bg-tertiary rounded-lg p-1 gap-1">
            <button
              type="button"
              onClick={() => setScheduleMode('single')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                scheduleMode === 'single'
                  ? 'bg-primary text-text-inverse'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Single Visit
            </button>
            <button
              type="button"
              onClick={() => setScheduleMode('recurring')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                scheduleMode === 'recurring'
                  ? 'bg-primary text-text-inverse'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Recurring
            </button>
          </div>
        </div>
      )}

      {/* Date Selection */}
      <div className={scheduleMode === 'recurring' ? 'grid grid-cols-2 gap-4' : ''}>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            {scheduleMode === 'recurring' ? 'Start Date *' : 'Scheduled Date *'}
          </label>
          <Input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={errors.scheduledDate ? 'border-error' : ''}
          />
          {errors.scheduledDate && (
            <p className="mt-1 text-sm text-error">{errors.scheduledDate}</p>
          )}
        </div>

        {scheduleMode === 'recurring' && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              End Date *
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={scheduledDate || new Date().toISOString().split('T')[0]}
              className={errors.endDate ? 'border-error' : ''}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-error">{errors.endDate}</p>
            )}
          </div>
        )}
      </div>

      {/* Interval (recurring only) */}
      {scheduleMode === 'recurring' && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Repeat Every (days) *
          </label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={intervalDays}
              onChange={(e) => setIntervalDays(parseInt(e.target.value) || 14)}
              min={1}
              max={90}
              className={`w-24 ${errors.intervalDays ? 'border-error' : ''}`}
            />
            <span className="text-sm text-text-secondary">
              {endDate && scheduledDate && (
                <>
                  This will create{' '}
                  <span className="font-semibold text-text-primary">
                    {calculateRecurringCount()}
                  </span>{' '}
                  scheduled visits
                </>
              )}
            </span>
          </div>
          {errors.intervalDays && (
            <p className="mt-1 text-sm text-error">{errors.intervalDays}</p>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Optional notes for this visit..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : isEditing
            ? 'Update Schedule'
            : scheduleMode === 'recurring'
            ? `Create ${calculateRecurringCount()} Visits`
            : 'Create Schedule'}
        </Button>
      </div>
    </form>
  );
}
