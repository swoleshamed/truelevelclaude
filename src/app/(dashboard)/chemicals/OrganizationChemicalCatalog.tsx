// ===========================================
// FILE: src/app/(dashboard)/chemicals/OrganizationChemicalCatalog.tsx
// PURPOSE: Chemical catalog view for organizations
// PRD REFERENCE: PRD Section 3.2 - Organization Chemical Configuration
// USED BY: Chemicals page (organization role)
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';
import { SiteChemicalConfigForm } from '@/components/forms';

interface OrganizationChemicalCatalogProps {
  organizationId: string;
  canEdit: boolean;
}

/**
 * OrganizationChemicalCatalog Component
 *
 * WHY: Organizations view chemicals configured by their distributor
 * with pricing and container options. They can then configure these
 * for their sites.
 *
 * FEATURES (PRD Section 3.2):
 * - View available chemicals (from ChemicalOrgConfig)
 * - See pricing per container type
 * - Configure chemicals for sites
 * - View which sites use each chemical
 *
 * DATA FLOW:
 * 1. Distributor creates ChemicalMaster
 * 2. Distributor creates ChemicalOrgConfig (pricing + containers)
 * 3. Organization views ChemicalOrgConfig
 * 4. Organization configures for sites (ChemicalSiteConfig)
 */
export function OrganizationChemicalCatalog({
  organizationId,
  canEdit,
}: OrganizationChemicalCatalogProps) {
  const [loading, setLoading] = useState(true);
  const [orgConfigs, setOrgConfigs] = useState<any[]>([]);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);

  useEffect(() => {
    fetchOrgConfigs();
  }, [organizationId]);

  const fetchOrgConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/chemicals/org-config?organizationId=${organizationId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch org configs');
      }

      const data = await response.json();
      setOrgConfigs(data);
    } catch (error) {
      console.error('Error fetching org configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfigForm = (config: any) => {
    setSelectedConfig(config);
    setShowConfigForm(true);
  };

  const handleConfigSuccess = () => {
    fetchOrgConfigs();
    setShowConfigForm(false);
    setSelectedConfig(null);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="Available Chemicals"
          subtitle="Loading chemicals..."
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
        title="Available Chemicals"
        subtitle={`${orgConfigs.length} chemicals available from your distributor`}
      />

      {orgConfigs.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Chemicals Available
            </h3>
            <p className="text-text-secondary">
              Your distributor hasn't configured any chemicals for your
              organization yet. Contact your distributor to set up your chemical
              catalog.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {orgConfigs.map((config) => (
            <Card key={config.id}>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {config.chemicalMaster.name}
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-tertiary">Container Type</p>
                    <p className="text-text-primary font-medium">
                      {config.containerType.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-tertiary">Cost</p>
                    <p className="text-text-primary font-medium">
                      ${config.containerCost.toFixed(2)}
                    </p>
                  </div>
                </div>

                {canEdit && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => handleOpenConfigForm(config)}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Configure for Site
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Site Chemical Config Form */}
      {selectedConfig && (
        <SiteChemicalConfigForm
          isOpen={showConfigForm}
          onClose={() => {
            setShowConfigForm(false);
            setSelectedConfig(null);
          }}
          onSuccess={handleConfigSuccess}
          chemicalOrgConfigId={selectedConfig.id}
          chemicalName={selectedConfig.chemicalMaster.name}
          organizationId={organizationId}
        />
      )}
    </PageContainer>
  );
}
