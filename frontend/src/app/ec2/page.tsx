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

  const instances = data.ec2 || MOCK_DASHBOARD.ec2;
  const runningCount = instances.filter(i => i.State.toLowerCase() === 'running').length;
  const stoppedCount = instances.filter(i => i.State.toLowerCase() === 'stopped').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={data.is_mock} onRefresh={loadData} isLoading={loading} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f2f3f3' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eaeded' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#16191f' }}>
              Amazon EC2 Compute Monitoring
            </h1>
            <p style={{ fontSize: '13px', color: '#545b64', marginTop: '2px' }}>
              List and health status of all EC2 virtual server instances in region us-east-1.
            </p>
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
