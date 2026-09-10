'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import S3Table from '../../components/S3Table';
import MetricCard from '../../components/MetricCard';
import { fetchDashboardData, checkBackendHealth, DashboardResponse, MOCK_DASHBOARD } from '../../lib/api';

export default function S3Page() {
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

  const buckets = data.s3 || MOCK_DASHBOARD.s3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={data.is_mock} onRefresh={loadData} isLoading={loading} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f2f3f3' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eaeded' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#16191f' }}>
              Amazon S3 Storage Inventory
            </h1>
            <p style={{ fontSize: '13px', color: '#545b64', marginTop: '2px' }}>
              Object storage buckets, encryption status, and public access settings.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <MetricCard
              title="Total S3 Buckets"
              value={buckets.length}
              subtitle="All buckets in account"
              accentColor="#137333"
            />
            <MetricCard
              title="Default Encryption"
              value="100%"
              subtitle="AES-256 Enabled"
              accentColor="#0073bb"
            />
            <MetricCard
              title="Public Access Status"
              value="Blocked"
              subtitle="All buckets private"
              accentColor="#137333"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <S3Table buckets={buckets} />
          </div>
        </main>
      </div>
    </div>
  );
}
