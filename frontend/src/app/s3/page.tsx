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

  const isDemo = data.is_demo ?? data.is_mock ?? true;
  // In live mode, never fall back to mock data — show real resources or empty state
  const buckets = isDemo ? (data.s3 || MOCK_DASHBOARD.s3) : (data.s3 ?? []);
  const encryptedCount = buckets.filter(b => b.Encrypted).length;
  const publicCount = buckets.filter(b => b.PublicAccess).length;
  const encryptionPct = buckets.length > 0 ? Math.round((encryptedCount / buckets.length) * 100) : 100;
  const publicStatus = buckets.length === 0 ? 'N/A' : publicCount === 0 ? 'All Blocked' : `${publicCount} Public`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={isDemo} onRefresh={loadData} isLoading={loading} />

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
              subtitle={isDemo ? 'All buckets in account' : `All buckets in AWS account`}
              accentColor="#137333"
            />
            <MetricCard
              title="Default Encryption"
              value={`${encryptionPct}%`}
              subtitle={isDemo ? 'AES-256 Enabled' : `${encryptedCount} of ${buckets.length} encrypted`}
              accentColor="#0073bb"
            />
            <MetricCard
              title="Public Access Status"
              value={publicStatus}
              subtitle={publicCount > 0 ? `${publicCount} bucket(s) with public access` : 'No public buckets detected'}
              accentColor={publicCount > 0 ? '#c5221f' : '#137333'}
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
