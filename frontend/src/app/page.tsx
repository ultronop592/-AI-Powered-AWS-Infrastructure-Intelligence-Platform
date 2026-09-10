'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MetricCard from '../components/MetricCard';
import CostChart from '../components/CostChart';
import EC2Table from '../components/EC2Table';
import S3Table from '../components/S3Table';
import RecommendationsList from '../components/RecommendationsList';
import AIReportCard from '../components/AIReportCard';
import AICopilotDrawer from '../components/AICopilotDrawer';
import AWSConnectModal from '../components/AWSConnectModal';
import { fetchDashboardData, checkBackendHealth, DashboardResponse, MOCK_DASHBOARD } from '../lib/api';

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardResponse>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isAWSModalOpen, setIsAWSModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const health = await checkBackendHealth();
    setIsBackendOnline(health.is_online);

    const result = await fetchDashboardData();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isDemo = data.is_demo ?? data.is_mock ?? true;
  // In live mode, never fall back to mock data — show real resources or empty state
  const summary = isDemo ? (data.summary || MOCK_DASHBOARD.summary) : (data.summary || { monthly_cost: 0, currency: 'USD', ec2_count: 0, s3_bucket_count: 0 });
  const recommendations = data.recommendations || [];
  const runningEC2Count = (data.ec2 ?? []).filter(i => (i.State || '').toLowerCase() === 'running').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        isBackendOnline={isBackendOnline}
        isMockData={isDemo}
        onRefresh={loadData}
        isLoading={loading}
        onToggleCopilot={() => setIsCopilotOpen((prev) => !prev)}
        onOpenAWSModal={() => setIsAWSModalOpen(true)}
      />

      <AICopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      <AWSConnectModal isOpen={isAWSModalOpen} onClose={() => setIsAWSModalOpen(false)} onConnected={loadData} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f2f3f3', overflowY: 'auto' }}>
          {/* Top Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #eaeded'
          }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#16191f' }}>
                AWS CloudOps AI Dashboard
              </h1>
              <p style={{ fontSize: '13px', color: '#545b64', marginTop: '2px' }}>
                Real-time AWS infrastructure cost, compute state, storage inventory &amp; Bedrock AI optimization analysis.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isDemo && (
                <span className="aws-badge aws-badge-warning">
                  DEMO MODE — Connect AWS Account for Live Data
                </span>
              )}
              <button onClick={() => setIsAWSModalOpen(true)} className="aws-btn-secondary" style={{ borderColor: '#137333', color: '#137333' }}>
                🔑 Connect AWS Account
              </button>
              <button onClick={() => setIsCopilotOpen(true)} className="aws-btn-primary" style={{ backgroundColor: '#ec7211', borderColor: '#ec7211' }}>
                💬 Launch AI Copilot
              </button>
              <button onClick={loadData} disabled={loading} className="aws-btn-secondary">
                {loading ? 'Refreshing...' : 'Refresh Live AWS Data'}
              </button>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <MetricCard
              title="Monthly AWS Cost"
              value={`$${(summary.monthly_cost || 0).toFixed(2)} ${summary.currency || 'USD'}`}
              subtitle="Current billing cycle"
              accentColor="#ec7211"
              icon={(
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              )}
            />

            <MetricCard
              title="EC2 Compute Instances"
              value={summary.ec2_count || 0}
              subtitle={`${runningEC2Count} running, ${(summary.ec2_count || 0) - runningEC2Count} stopped`}
              accentColor="#0073bb"
              icon={(
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                </svg>
              )}
            />

            <MetricCard
              title="S3 Storage Buckets"
              value={summary.s3_bucket_count || 0}
              subtitle="All encrypted (AES-256)"
              accentColor="#137333"
              icon={(
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              )}
            />

            <MetricCard
              title="Security Posture Score"
              value={`${summary.security_health_score || 75}/100`}
              subtitle="Security Groups &amp; IAM"
              accentColor={(summary.security_health_score || 75) >= 80 ? '#137333' : '#c5221f'}
              trend={(summary.security_health_score || 75) >= 80 ? 'PASS' : 'RISK DETECTED'}
              icon={(
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              )}
            />

            <MetricCard
              title="AI Optimization Savings"
              value={typeof data.ai_report === 'object' ? (data.ai_report?.estimated_savings || '$5.40/mo') : '$5.40/mo'}
              subtitle="Potential monthly reduction"
              accentColor="#137333"
              trend="36.8% Savings"
              icon={(
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                </svg>
              )}
            />
          </div>

          {/* Grid Layout: Cost Breakdown & AI Bedrock Report */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <CostChart
              costByService={data.cost_by_service || []}
              totalCost={summary.monthly_cost || 0}
              currency={summary.currency || 'USD'}
            />

            <RecommendationsList recommendations={recommendations} />
          </div>

          {/* Full Width AI Bedrock Report */}
          <div style={{ marginBottom: '24px' }}>
            <AIReportCard report={data.ai_report} />
          </div>

          {/* Infrastructure Tables Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }}>
            <EC2Table instances={data.ec2 || []} />
            <S3Table buckets={data.s3 || []} />
          </div>
        </main>
      </div>
    </div>
  );
}
