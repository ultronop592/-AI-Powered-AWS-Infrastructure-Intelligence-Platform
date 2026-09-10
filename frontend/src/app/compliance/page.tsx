'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ComplianceScoreCard from '../../components/ComplianceScoreCard';
import PillarDetails from '../../components/PillarDetails';
import {
  fetchDashboardData,
  checkBackendHealth,
  DashboardResponse,
  MOCK_DASHBOARD,
} from '../../lib/api';

export default function CompliancePage() {
  const [data, setData] = useState<DashboardResponse>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [selectedPillar, setSelectedPillar] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    const health = await checkBackendHealth();
    setIsBackendOnline(health.is_online);
    const res = await fetchDashboardData();
    setData(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const compliance = data.compliance || MOCK_DASHBOARD.compliance!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f2f3f3' }}>
      <Navbar
        isBackendOnline={isBackendOnline}
        isMockData={data.is_mock}
        onRefresh={loadData}
        isLoading={loading}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px' }}>
          {/* Breadcrumb & Title */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eaeded' }}>
            <div style={{ fontSize: '12px', color: '#545b64', marginBottom: '4px' }}>
              AWS Management Console &gt; Well-Architected Tool &gt; <strong>Compliance Scorecard</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#16191f', margin: 0 }}>
                  AWS Well-Architected Compliance Scorecard
                </h1>
                <p style={{ fontSize: '13px', color: '#545b64', margin: '4px 0 0 0' }}>
                  Automated architectural assessment evaluating connected infrastructure against the 5 official AWS Well-Architected Framework pillars.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '12px',
                  color: '#545b64',
                  backgroundColor: '#ffffff',
                  border: '1px solid #eaeded',
                  padding: '5px 10px',
                  borderRadius: '2px',
                }}>
                  Region: <strong>{compliance.region || 'us-east-1'}</strong>
                </span>

                <button
                  onClick={loadData}
                  disabled={loading}
                  style={{
                    backgroundColor: '#ec7211',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {loading ? 'Scanning AWS...' : '🔄 Re-evaluate Compliance'}
                </button>
              </div>
            </div>
          </div>

          {/* Compliance Scorecard (Overview Gauge + Spider Radar Chart + 5 Pillar Cards) */}
          <ComplianceScoreCard
            compliance={compliance}
            selectedPillar={selectedPillar}
            onSelectPillar={setSelectedPillar}
          />

          {/* Pillar Details (Filterable Checks, Remediations & Findings) */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#16191f', margin: 0 }}>
                  Well-Architected Pillar Findings & Guardrails
                </h2>
                <span style={{ fontSize: '12px', color: '#545b64' }}>
                  Review specific check items, failure criteria, and production remediation guidance.
                </span>
              </div>
            </div>

            <PillarDetails
              compliance={compliance}
              activePillar={selectedPillar}
              onSelectPillar={setSelectedPillar}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
