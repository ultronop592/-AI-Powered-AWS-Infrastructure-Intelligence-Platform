'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import EC2Table from '../../components/EC2Table';
import MetricCard from '../../components/MetricCard';
import { fetchDashboardData, checkBackendHealth, DashboardResponse, MOCK_DASHBOARD } from '../../lib/api';

export default function EC2Page() {
  const [data, setData] = useState<DashboardResponse>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

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
  const instances = isDemo ? (data.ec2 || MOCK_DASHBOARD.ec2) : (data.ec2 ?? []);
  const runningCount = instances.filter(i => (i.State || '').toLowerCase() === 'running').length;
  const stoppedCount = instances.filter(i => (i.State || '').toLowerCase() === 'stopped').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={isDemo} onRefresh={loadData} isLoading={loading} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f8fafc' }}>
          <div style={{ marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Amazon EC2 Compute Monitoring
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                  List and health status of all EC2 virtual server instances in region {data.region || 'us-east-1'}.
                </p>
              </div>
              {!isDemo && (
                <span className="aws-badge aws-badge-success" style={{ fontSize: '11px' }}>
                  LIVE AWS DATA
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <MetricCard
              title="Total Instances"
              value={instances.length}
              subtitle="Provisioned virtual machines"
              accentColor="#0073bb"
            />
            <MetricCard
              title="Running Instances"
              value={runningCount}
              subtitle="Active workloads"
              accentColor="#137333"
            />
            <MetricCard
              title="Stopped / Idle Instances"
              value={stoppedCount}
              subtitle="Cost optimization candidates"
              accentColor="#b06000"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <EC2Table instances={instances} />
          </div>
        </main>
      </div>
    </div>
  );
}
