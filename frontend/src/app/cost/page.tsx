'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import CostChart from '../../components/CostChart';
import MetricCard from '../../components/MetricCard';
import WasteHeatmap from '../../components/WasteHeatmap';
import { fetchDashboardData, checkBackendHealth, DashboardResponse, MOCK_DASHBOARD } from '../../lib/api';

export default function CostPage() {
  const [data, setData] = useState<DashboardResponse>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'bars'>('heatmap');

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

  const isDemo = data.is_demo ?? data.is_mock ?? true;
  // In live mode, never fall back to mock data — show real resources or empty state
  const summary = isDemo ? (data.summary || MOCK_DASHBOARD.summary) : (data.summary || { monthly_cost: 0, currency: 'USD', ec2_count: 0, s3_bucket_count: 0 });
  const costItems = isDemo ? (data.cost_by_service || MOCK_DASHBOARD.cost_by_service) : (data.cost_by_service ?? []);
  const wasteData = isDemo ? (data.waste_analysis || MOCK_DASHBOARD.waste_analysis || []) : (data.waste_analysis ?? []);
  const topServicePct = summary.monthly_cost > 0
    ? (((costItems[0]?.cost || 0) / summary.monthly_cost) * 100).toFixed(1)
    : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f2f3f3' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={isDemo} onRefresh={loadData} isLoading={loading} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px' }}>
          {/* Header */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eaeded' }}>
            <div style={{ fontSize: '11px', color: '#545b64', marginBottom: '4px' }}>
              AWS Management Console &gt; Cost Management &gt; <strong>Cost Explorer &amp; FinOps</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#16191f', margin: 0 }}>
                  AWS Cost Explorer &amp; FinOps Intelligence
                </h1>
                <p style={{ fontSize: '13px', color: '#545b64', margin: '4px 0 0 0' }}>
                  Analyze cloud spending trends, detect idle resource waste, and optimize cost efficiency across AWS services.
                </p>
              </div>

              {/* View Mode Toggle Buttons */}
              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#ffffff', padding: '3px', borderRadius: '2px', border: '1px solid #d5dbdb' }}>
                <button
                  onClick={() => setActiveTab('heatmap')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '2px',
                    border: 'none',
                    backgroundColor: activeTab === 'heatmap' ? '#ec7211' : 'transparent',
                    color: activeTab === 'heatmap' ? '#ffffff' : '#545b64',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🗺️</span>
                  <span>FinOps Waste Treemap</span>
                </button>

                <button
                  onClick={() => setActiveTab('bars')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '2px',
                    border: 'none',
                    backgroundColor: activeTab === 'bars' ? '#ec7211' : 'transparent',
                    color: activeTab === 'bars' ? '#ffffff' : '#545b64',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>📊</span>
                  <span>Service Spend Breakdown</span>
                </button>
              </div>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <MetricCard
              title="Total Monthly Spend"
              value={`$${summary.monthly_cost.toFixed(2)} USD`}
              subtitle="Cost Explorer Month-To-Date"
              accentColor="#ec7211"
            />
            <MetricCard
              title="Top Cost Contributor"
              value={costItems[0]?.service || 'Amazon EC2'}
              subtitle={`$${(costItems[0]?.cost || 0).toFixed(2)} (${topServicePct}%)`}
              accentColor="#0073bb"
            />
            <MetricCard
              title="Identifiable Savings"
              value={`$${wasteData.reduce((acc, c) => acc + (c.potential_savings || 0), 0).toFixed(2)} USD`}
              subtitle="Immediate waste recoverable"
              accentColor="#c5221f"
            />
            <MetricCard
              title="Services Tracking"
              value={costItems.length}
              subtitle="Active AWS services billed"
              accentColor="#137333"
            />
          </div>

          {/* Main Content: Heatmap vs Bar Chart */}
          {activeTab === 'heatmap' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <WasteHeatmap wasteData={wasteData} totalCost={summary.monthly_cost} />

              <div style={{ marginTop: '8px' }}>
                <CostChart costByService={costItems} totalCost={summary.monthly_cost} currency={summary.currency} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <CostChart costByService={costItems} totalCost={summary.monthly_cost} currency={summary.currency} />

              <div style={{ marginTop: '8px' }}>
                <WasteHeatmap wasteData={wasteData} totalCost={summary.monthly_cost} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
