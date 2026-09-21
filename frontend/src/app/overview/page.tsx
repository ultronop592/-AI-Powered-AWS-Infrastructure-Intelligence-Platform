'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import MetricCard from '../../components/MetricCard';
import CostChart from '../../components/CostChart';
import EC2Table from '../../components/EC2Table';
import S3Table from '../../components/S3Table';
import RecommendationsList from '../../components/RecommendationsList';
import AIReportCard from '../../components/AIReportCard';
import AICopilotDrawer from '../../components/AICopilotDrawer';
import AWSConnectModal from '../../components/AWSConnectModal';
import { fetchDashboardData, checkBackendHealth, DashboardResponse, MOCK_DASHBOARD } from '../../lib/api';

export default function OverviewPage() {
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: '#ec7211',
                  color: '#ffffff',
                  padding: '1px 6px',
                  border: '1.5px solid #0f172a',
                  fontWeight: 800
                }}>
                  [SYS_OVERVIEW.DASH]
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                  :: HYPERVISOR_CONNECTED
                </span>
              </div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                margin: 0
              }}>
                Infrastructure Control Plane
              </h1>
            </div>

            {/* Quick Status Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #0f172a',
                boxShadow: '2px 2px 0px #0f172a',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  backgroundColor: isBackendOnline ? '#059669' : '#dc2626',
                  display: 'inline-block'
                }}></span>
                <span>API: {isBackendOnline ? 'ONLINE' : 'FALLBACK'}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                backgroundColor: isDemo ? '#fff7ed' : '#ecfdf5',
                border: '1.5px solid #0f172a',
                boxShadow: '2px 2px 0px #0f172a',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: isDemo ? '#c2410c' : '#047857'
              }}>
                <span>MODE: {isDemo ? 'SIMULATION' : 'LIVE_AWS'}</span>
              </div>

              <button
                onClick={loadData}
                disabled={loading}
                className="aws-btn-secondary"
                style={{ padding: '5px 10px', fontSize: '11px' }}
              >
                {loading ? 'SYNCING...' : 'RE-SCAN [F5]'}
              </button>
            </div>
          </div>

          {/* Scannable Micro-cards Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              boxShadow: '3px 3px 0px #0f172a',
              padding: '10px 14px'
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700, marginBottom: '2px' }}>
                [HEALTH_STATUS]
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669' }}>
                  OPTIMAL
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  0 Critical Alarms
                </span>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              boxShadow: '3px 3px 0px #0f172a',
              padding: '10px 14px'
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700, marginBottom: '2px' }}>
                [STS_SESSION]
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                  ACTIVE
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  Region: us-east-1
                </span>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              boxShadow: '3px 3px 0px #0f172a',
              padding: '10px 14px'
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700, marginBottom: '2px' }}>
                [AUTO_FIX_ENGINES]
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ec7211' }}>
                  3 READY
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  gp3 / SSH / Idle
                </span>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              boxShadow: '3px 3px 0px #0f172a',
              padding: '10px 14px'
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700, marginBottom: '2px' }}>
                [WAF_FRAMEWORK]
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#7c3aed' }}>
                  82/100
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  5 Pillars Scored
                </span>
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '20px'
          }}>
            <MetricCard
              title="Monthly AWS Spend"
              value={`$${summary.monthly_cost.toFixed(2)}`}
              subtitle="USD/mo · vs last month"
              trend="-12.4% Savings"
              accentColor="#0284c7"
            />
            <MetricCard
              title="EC2 Instances"
              value={summary.ec2_count}
              subtitle={`${runningEC2Count} running instances`}
              trend={summary.ec2_count > 0 ? 'NORMAL' : 'NONE'}
              accentColor="#ec7211"
            />
            <MetricCard
              title="S3 Buckets"
              value={summary.s3_bucket_count}
              subtitle="Storage buckets scanned"
              trend="100% SECURE"
              accentColor="#059669"
            />
            <MetricCard
              title="Optimization Potential"
              value={recommendations.length}
              subtitle="Actionable opportunities"
              trend={recommendations.length > 0 ? 'ACTION REQUIRED' : 'OPTIMAL'}
              accentColor="#dc2626"
            />
          </div>

          {/* Middle Row: AI Report + Cost Chart */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <AIReportCard report={data.ai_report} />
            <CostChart
              costByService={data.cost_by_service || []}
              totalCost={summary.monthly_cost}
              currency={summary.currency || 'USD'}
            />
          </div>

          {/* Bottom Row: Recommendations */}
          <div style={{ marginBottom: '20px' }}>
            <RecommendationsList
              recommendations={recommendations}
              onRefresh={loadData}
            />
          </div>

          {/* Fleet Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '16px'
          }}>
            <EC2Table instances={data.ec2 ?? []} />
            <S3Table buckets={data.s3 ?? []} onRefresh={loadData} />
          </div>
        </main>
      </div>
    </div>
  );
}
