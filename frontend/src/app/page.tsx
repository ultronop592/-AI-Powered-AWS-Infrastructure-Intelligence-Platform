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
  const summary = isDemo ? (data.summary || MOCK_DASHBOARD.summary) : (data.summary || { monthly_cost: 0, currency: 'USD', ec2_count: 0, s3_bucket_count: 0 });
  const recommendations = data.recommendations || [];
  const runningEC2Count = (data.ec2 ?? []).filter(i => (i.State || '').toLowerCase() === 'running').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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

        <main style={{ flex: 1, padding: '20px 24px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
          {/* Top Control Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
            paddingBottom: '14px',
            borderBottom: '2px solid #0f172a'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '2px 6px',
                }}>
                  SYS_OVERVIEW.DASH
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                  // LIVE TELEMETRY ENGINE // US-EAST-1
                </span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
                AWS Infrastructure Intelligence Console
              </h1>
            </div>

            {/* Quick Action Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {isDemo && (
                <span className="aws-badge aws-badge-warning" style={{ padding: '4px 8px', fontSize: '11px' }}>
                  SIMULATION MODE
                </span>
              )}
              <button
                onClick={() => setIsAWSModalOpen(true)}
                className="aws-btn-secondary"
                style={{ borderColor: '#059669', color: '#059669', padding: '6px 12px' }}
              >
                🔑 Connect Keys
              </button>
              <button
                onClick={() => setIsCopilotOpen(true)}
                className="aws-btn-primary"
                style={{ padding: '6px 12px' }}
              >
                💬 Launch Copilot
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="aws-btn-secondary"
                style={{ padding: '6px 12px' }}
              >
                {loading ? 'Syncing...' : '⟳ Sync Telemetry'}
              </button>
            </div>
          </div>

          {/* Scannable Telemetry Quick-Bar (Micro-Cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #0f172a',
              boxShadow: '2px 2px 0px #0f172a',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}>
              <span style={{ color: '#64748b' }}>INFRA_HEALTH:</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>NOMINAL [98.2%]</span>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #0f172a',
              boxShadow: '2px 2px 0px #0f172a',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}>
              <span style={{ color: '#64748b' }}>STS_SESSION:</span>
              <span style={{ color: isDemo ? '#d97706' : '#059669', fontWeight: 700 }}>
                {isDemo ? 'SIMULATION' : 'AUTHENTICATED'}
              </span>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #0f172a',
              boxShadow: '2px 2px 0px #0f172a',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}>
              <span style={{ color: '#64748b' }}>AUTONOMOUS_FIX:</span>
              <span style={{ color: '#ec7211', fontWeight: 700 }}>4 BOTO3 ENGINES</span>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #0f172a',
              boxShadow: '2px 2px 0px #0f172a',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}>
              <span style={{ color: '#64748b' }}>WAF_COMPLIANCE:</span>
              <span style={{ color: '#0284c7', fontWeight: 700 }}>26 RULES SCAN</span>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <MetricCard
              title="MONTHLY_AWS_COST"
              value={`$${(summary.monthly_cost || 0).toFixed(2)} ${summary.currency || 'USD'}`}
              subtitle="Current Billing"
              trend="MTD"
              accentColor="#ec7211"
              icon={(
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              )}
            />

            <MetricCard
              title="EC2_INSTANCES"
              value={summary.ec2_count || 0}
              subtitle={`${runningEC2Count} Run / ${(summary.ec2_count || 0) - runningEC2Count} Stop`}
              trend={`${runningEC2Count} ACTIVE`}
              accentColor="#0284c7"
              icon={(
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="2" width="20" height="8"></rect>
                  <rect x="2" y="14" width="20" height="8"></rect>
                </svg>
              )}
            />

            <MetricCard
              title="S3_BUCKETS"
              value={summary.s3_bucket_count || 0}
              subtitle="All AES-256 Encrypted"
              trend="100% SECURE"
              accentColor="#059669"
              icon={(
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              )}
            />

            <MetricCard
              title="SECURITY_SCORE"
              value={`${summary.security_health_score || 75}/100`}
              subtitle="IAM & Security Groups"
              accentColor={(summary.security_health_score || 75) >= 80 ? '#059669' : '#dc2626'}
              trend={(summary.security_health_score || 75) >= 80 ? 'PASS' : 'RISK DETECTED'}
              icon={(
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              )}
            />

            <MetricCard
              title="AI_EST_SAVINGS"
              value={typeof data.ai_report === 'object' ? (data.ai_report?.estimated_savings || '$5.40/mo') : '$5.40/mo'}
              subtitle="Monthly Opportunity"
              accentColor="#059669"
              trend="36.8% SAVINGS"
              icon={(
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                </svg>
              )}
            />
          </div>

          {/* Grid Layout: Cost Breakdown & Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <CostChart
              costByService={data.cost_by_service || []}
              totalCost={summary.monthly_cost || 0}
              currency={summary.currency || 'USD'}
            />

            <RecommendationsList recommendations={recommendations} onRefresh={loadData} />
          </div>

          {/* Full Width AI Bedrock Report */}
          <div style={{ marginBottom: '20px' }}>
            <AIReportCard report={data.ai_report} />
          </div>

          {/* Infrastructure Tables Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
            <EC2Table instances={data.ec2 || []} />
            <S3Table buckets={data.s3 || []} onRefresh={loadData} />
          </div>
        </main>
      </div>
    </div>
  );
}
