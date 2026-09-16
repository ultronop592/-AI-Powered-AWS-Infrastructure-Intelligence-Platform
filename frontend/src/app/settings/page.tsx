'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import AWSConnectModal from '../../components/AWSConnectModal';
import {
  getSavedAWSCredentials,
  clearAWSCredentials,
  checkBackendHealth,
  fetchDashboardData,
  AWSCredentials,
  DashboardResponse,
  MOCK_DASHBOARD,
} from '../../lib/api';

export default function SettingsPage() {
  const [data, setData] = useState<DashboardResponse>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [savedCreds, setSavedCreds] = useState<AWSCredentials | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const health = await checkBackendHealth();
    setIsBackendOnline(health.is_online);
    const creds = getSavedAWSCredentials();
    setSavedCreds(creds);
    const res = await fetchDashboardData();
    setData(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDisconnect = () => {
    clearAWSCredentials();
    setSavedCreds(null);
    loadData();
  };

  const isDemo = data.is_demo ?? data.is_mock ?? true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={isDemo} onRefresh={loadData} isLoading={loading} />

      <AWSConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConnected={loadData} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f8fafc' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                AWS Account Connection &amp; Platform Settings
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                Manage live AWS IAM credentials, region targets, and platform configuration.
              </p>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="aws-btn-primary">
              🔑 {savedCreds ? 'Update AWS Credentials' : 'Connect AWS Account'}
            </button>
          </div>

          {/* Account Status Card */}
          <div className="aws-card" style={{ marginBottom: '24px' }}>
            <div className="aws-card-header">
              <span>Current AWS Connection Status</span>
              <span className={`aws-badge ${savedCreds ? 'aws-badge-success' : 'aws-badge-warning'}`}>
                {savedCreds ? 'LIVE AWS ACCOUNT ACTIVE' : 'DEMO / MOCK MODE'}
              </span>
            </div>

            <div className="aws-card-body">
              {savedCreds ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '12px', backgroundColor: '#fafafa', border: '1px solid #eaeded', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 700, textTransform: 'uppercase' }}>AWS Account ID</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#16191f', marginTop: '4px', fontFamily: 'monospace' }}>
                        {savedCreds.account_id || 'Verified'}
                      </div>
                    </div>

                    <div style={{ padding: '12px', backgroundColor: '#fafafa', border: '1px solid #eaeded', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 700, textTransform: 'uppercase' }}>Target AWS Region</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#ec7211', marginTop: '4px' }}>
                        {savedCreds.region || 'us-east-1'}
                      </div>
                    </div>

                    <div style={{ padding: '12px', backgroundColor: '#fafafa', border: '1px solid #eaeded', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 700, textTransform: 'uppercase' }}>Access Key ID</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#16191f', marginTop: '4px', fontFamily: 'monospace' }}>
                        {savedCreds.access_key.slice(0, 4)}...{savedCreds.access_key.slice(-4)}
                      </div>
                    </div>
                  </div>

                  <button onClick={handleDisconnect} className="aws-btn-secondary" style={{ borderColor: '#c5221f', color: '#c5221f' }}>
                    Disconnect AWS Credentials &amp; Return to Demo Mode
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '14px', color: '#16191f', marginBottom: '12px', lineHeight: '1.5' }}>
                    You are currently using <strong>CloudOps AI in Demo Mode</strong> with local mock AWS infrastructure data.
                  </p>
                  <p style={{ fontSize: '13px', color: '#545b64', marginBottom: '20px' }}>
                    Connecting your AWS credentials allows CloudOps AI to inspect your real-time Cost Explorer spend, EC2 instances, S3 buckets, Security Groups, RDS databases, and CloudWatch metrics.
                  </p>
                  <button onClick={() => setIsModalOpen(true)} className="aws-btn-primary">
                    🔑 Connect Your AWS Account Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
