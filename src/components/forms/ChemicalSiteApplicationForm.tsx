// ===========================================
// FILE: src/components/forms/ChemicalSiteApplicationForm.tsx
// PURPOSE: Form for assigning chemicals to tanks with equipment selection
// PRD REFERENCE: PRD Section 3.3 - Chemical Site Applications
// USED BY: SiteChemicalCatalog
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui';

interface InjectorType {
  id: string;
  system: string;
  name: string;
  gpm: number;
}

interface TipType {
  id: string;
  system: string;
  name: string;
  dilutionRatio: number;
}

interface ChemicalSiteApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  chemicalSiteConfigId: string;
  chemicalName: string;
}

/**
 * ChemicalSiteApplicationForm Component
 *
 * WHY: Sites need to assign configured chemicals to specific tanks
 * with injector and tip equipment for accurate GPM-weighted calculations.
 *
 * BUSINESS RULES:
 * - One chemical per tank (unique constraint)
 * - Requires both injector and tip selection
 * - Tank IDs typically "1", "2", "3", etc.
 *
 * FEATURES:
 * - Tank ID input
 * - Injector type selection (Hydroflex/Hydrominder)
 * - Tip type selection (matching system)
 * - Real-time validation
 * - GPM and dilution ratio display
 */
export function ChemicalSiteApplicationForm({
  isOpen,
  onClose,
  onSuccess,
  chemicalSiteConfigId,
  chemicalName,
}: ChemicalSiteApplicationFormProps) {
  const [tankId, setTankId] = useState('');
  const [selectedInjectorId, setSelectedInjectorId] = useState('');
  const [selectedTipId, setSelectedTipId] = useState('');
  const [injectorTypes, setInjectorTypes] = useState<InjectorType[]>([]);
  const [tipTypes, setTipTypes] = useState<TipType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch injector and tip types on mount
  useEffect(() => {
    if (isOpen) {
      fetchEquipmentTypes();
    }
  }, [isOpen]);

  const fetchEquipmentTypes = async () => {
    try {
      const [injectorsRes, tipsRes] = await Promise.all([
        fetch('/api/equipment/injectors'),
        fetch('/api/equipment/tips'),
      ]);

      if (injectorsRes.ok) {
        const injectors = await injectorsRes.json();
        setInjectorTypes(injectors);
      }

      if (tipsRes.ok) {
        const tips = await tipsRes.json();
        setTipTypes(tips);
      }
    } catch (err) {
      console.error('Error fetching equipment types:', err);
      // Continue with empty arrays if fetch fails
      setInjectorTypes([]);
      setTipTypes([]);
    }
  };

  const handleClose = () => {
    setTankId('');
    setSelectedInjectorId('');
    setSelectedTipId('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!tankId.trim()) {
      setError('Tank ID is required');
      return;
    }

    if (!selectedInjectorId) {
      setError('Please select an injector type');
      return;
    }

    if (!selectedTipId) {
      setError('Please select a tip type');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        chemicalSiteConfigId,
        tankId: tankId.trim(),
        injectorTypeId: selectedInjectorId,
        tipTypeId: selectedTipId,
      };

      const response = await fetch('/api/chemicals/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create application');
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get selected equipment details for display
  const selectedInjector = injectorTypes.find(
    (i) => i.id === selectedInjectorId
  );
  const selectedTip = tipTypes.find((t) => t.id === selectedTipId);

  // Filter tips based on selected injector system
  const availableTips = selectedInjector
    ? tipTypes.filter((tip) => tip.system === selectedInjector.system)
    : tipTypes;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Chemical to Tank"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chemical Name Display */}
        <div className="bg-surface-secondary rounded-lg p-3">
          <p className="text-sm text-text-tertiary">Chemical</p>
          <p className="text-base font-semibold text-text-primary">
            {chemicalName}
          </p>
        </div>

        {/* Tank ID Input */}
        <div>
          <label
            htmlFor="tankId"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Tank ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="tankId"
            value={tankId}
            onChange={(e) => setTankId(e.target.value)}
            placeholder="e.g., 1, 2, 3..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-text-tertiary mt-1">
            Enter the tank number or identifier
          </p>
        </div>

        {/* Injector Type Selection */}
        <div>
          <label
            htmlFor="injectorType"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Injector Type <span className="text-red-500">*</span>
          </label>
          <select
            id="injectorType"
            value={selectedInjectorId}
            onChange={(e) => {
              setSelectedInjectorId(e.target.value);
              // Reset tip selection when injector changes
              setSelectedTipId('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading || injectorTypes.length === 0}
          >
            <option value="">Select Injector</option>
            {injectorTypes.map((injector) => (
              <option key={injector.id} value={injector.id}>
                {injector.system} - {injector.name} ({injector.gpm} GPM)
              </option>
            ))}
          </select>
          {selectedInjector && (
            <p className="text-xs text-text-tertiary mt-1">
              GPM: {selectedInjector.gpm}
            </p>
          )}
        </div>

        {/* Tip Type Selection */}
        <div>
          <label
            htmlFor="tipType"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Tip Type <span className="text-red-500">*</span>
          </label>
          <select
            id="tipType"
            value={selectedTipId}
            onChange={(e) => setSelectedTipId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading || !selectedInjectorId || availableTips.length === 0}
          >
            <option value="">
              {selectedInjectorId
                ? 'Select Tip'
                : 'Select Injector First'}
            </option>
            {availableTips.map((tip) => (
              <option key={tip.id} value={tip.id}>
                {tip.name} (1:{tip.dilutionRatio})
              </option>
            ))}
          </select>
          {selectedTip && (
            <p className="text-xs text-text-tertiary mt-1">
              Dilution Ratio: 1:{selectedTip.dilutionRatio}
            </p>
          )}
        </div>

        {/* Equipment Summary */}
        {selectedInjector && selectedTip && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Equipment Summary
            </p>
            <div className="text-xs text-blue-800 space-y-1">
              <p>
                <span className="font-medium">System:</span>{' '}
                {selectedInjector.system}
              </p>
              <p>
                <span className="font-medium">Flow Rate:</span>{' '}
                {selectedInjector.gpm} GPM
              </p>
              <p>
                <span className="font-medium">Dilution:</span> 1:
                {selectedTip.dilutionRatio}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Assigning...' : 'Assign to Tank'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
