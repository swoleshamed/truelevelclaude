// ===========================================
// FILE: src/app/(dashboard)/chemicals/SiteChemicalCatalog.tsx
// PURPOSE: Chemical catalog view for sites
// PRD REFERENCE: PRD Section 3.3 - Site Chemical Configuration
// USED BY: Chemicals page (site role)
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card, StatusBadge } from '@/components/ui';

interface SiteChemicalCatalogProps {
  siteId: string;
  siteName: string;
  canEdit: boolean;
}

/**
 * SiteChemicalCatalog Component
 *
 * WHY: Sites view chemicals configured for them and manage
 * tank applications (injector/tip assignments).
 *
 * FEATURES (PRD Section 3.3):
 * - View configured chemicals (from ChemicalSiteConfig)
 * - See alert thresholds
 * - View tank applications
 * - Manage injector/tip assignments
 *
 * DATA FLOW:
 * 1. Distributor creates ChemicalMaster
 * 2. Distributor creates ChemicalOrgConfig
 * 3. Organization/Site creates ChemicalSiteConfig (alert threshold)
 * 4. Site creates ChemicalSiteApplication (tank + injector + tip)
 */
export function SiteChemicalCatalog({
  siteId,
  siteName,
  canEdit,
}: SiteChemicalCatalogProps) {
  const [loading, setLoading] = useState(true);
  const [siteConfigs, setSiteConfigs] = useState<any[]>([]);

  useEffect(() => {
    fetchSiteConfigs();
  }, [siteId]);

  const fetchSiteConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/chemicals/site-config?siteId=${siteId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch site configs');
      }

      const data = await response.json();
      setSiteConfigs(data);
    } catch (error) {
      console.error('Error fetching site configs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title={`Chemicals - ${siteName}`}
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
        title={`Chemicals - ${siteName}`}
        subtitle={`${siteConfigs.length} chemicals configured`}
      />

      {siteConfigs.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Chemicals Configured
            </h3>
            <p className="text-text-secondary">
              No chemicals have been configured for this site yet. Contact your
              organization administrator to set up chemicals.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {siteConfigs.map((config) => {
            const chemical = config.chemicalOrgConfig.chemicalMaster;
            const hasApplications = config.applications && config.applications.length > 0;

            return (
              <Card key={config.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">
                        {chemical.name}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {chemical.type.replace(/_/g, ' ')}
                      </p>
                    </div>
                    {config.alertThresholdGallons && (
                      <StatusBadge status="NORMAL" label="Monitored" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {config.alertThresholdGallons && (
                      <div>
                        <p className="text-text-tertiary">Alert Threshold</p>
                        <p className="text-text-primary font-medium">
                          {config.alertThresholdGallons} gal
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-text-tertiary">Tank Applications</p>
                      <p className="text-text-primary font-medium">
                        {hasApplications
                          ? `${config.applications.length} tank${
                              config.applications.length > 1 ? 's' : ''
                            }`
                          : 'Not assigned'}
                      </p>
                    </div>
                  </div>

                  {hasApplications && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-text-tertiary mb-2">
                        Tank Assignments:
                      </p>
                      <div className="space-y-1">
                        {config.applications.map((app: any) => (
                          <div
                            key={app.id}
                            className="text-xs text-text-secondary"
                          >
                            {app.tankId} - {app.injectorType.name} (
                            {app.injectorType.gpm} GPM) + {app.tipType.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
