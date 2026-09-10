'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import AIReportCard from '../../components/AIReportCard';
import RecommendationsList from '../../components/RecommendationsList';
import MetricCard from '../../components/MetricCard';
import { fetchDashboardData, checkBackendHealth, DashboardResponse, MOCK_DASHBOARD } from '../../lib/api';

export default function AIInsightsPage() {
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

  const report = data.ai_report || MOCK_DASHBOARD.ai_report;
  const recommendations = data.recommendations || MOCK_DASHBOARD.recommendations;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={data.is_mock} onRefresh={loadData} isLoading={loading} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f2f3f3' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eaeded' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#16191f' }}>
              Amazon Bedrock AI Infrastructure Insights
            </h1>
            <p style={{ fontSize: '13px', color: '#545b64', marginTop: '2px' }}>
              Generative AI infrastructure health evaluation powered by Amazon Nova Lite.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <MetricCard
              title="AI Bedrock Model"
              value="Amazon Nova Lite"
              subtitle="Model ID: amazon.nova-lite-v1:0"
              accentColor="#16191f"
            />
            <MetricCard
              title="Estimated Monthly Savings"
              value={typeof report === 'object' ? (report.estimated_savings || '$5.40/mo') : '$5.40/mo'}
              subtitle="Recommended cost optimization"
              accentColor="#137333"
              trend="36.8% Savings"
            />
            <MetricCard
              title="Rule Recommendations"
              value={recommendations.length}
              subtitle="Automated checks triggered"
              accentColor="#b06000"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }}>
            <AIReportCard report={report} />
            <RecommendationsList recommendations={recommendations} />
          </div>
        </main>
      </div>
    </div>
  );
}
