'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import RDSTable from '../../components/RDSTable';
import LambdaTable from '../../components/LambdaTable';
import EBSTable from '../../components/EBSTable';
import MetricCard from '../../components/MetricCard';
import RecommendationsList from '../../components/RecommendationsList';
import {
  fetchDashboardData,
  checkBackendHealth,
  DashboardResponse,
  MOCK_DASHBOARD,
  MOCK_RDS_INSTANCES,
  MOCK_LAMBDA_FUNCTIONS,
  MOCK_EBS_VOLUMES,
  MOCK_DEEP_SUMMARY,
} from '../../lib/api';

export default function ServicesAnalyticsPage() {
  const [data, setData] = useState<DashboardResponse>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'rds' | 'lambda' | 'ebs'>('all');

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
  const rdsInstances = isDemo ? (data.rds || MOCK_RDS_INSTANCES) : (data.rds ?? []);
  const lambdas = isDemo ? (data.lambdas || MOCK_LAMBDA_FUNCTIONS) : (data.lambdas ?? []);
  const volumes = isDemo ? (data.ebs || MOCK_EBS_VOLUMES) : (data.ebs ?? []);
  const deepSummary = isDemo ? (data.deep_summary || MOCK_DEEP_SUMMARY) : (data.deep_summary || { total_rds_count: rdsInstances.length, multi_az_rds_count: 0, unattached_rds_snapshots: 0, total_lambda_count: lambdas.length, overprovisioned_lambda_count: 0, total_ebs_count: volumes.length, gp2_migration_count: 0, gp3_monthly_savings: 0, unattached_ebs_count: 0, total_ecs_clusters: 0, total_ecs_running_tasks: 0 });
  const deepRecs = (data.recommendations || []).filter(r =>
    ['EBS Storage Optimization', 'Serverless Efficiency', 'Cost Optimization'].includes(r.category || '')
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={isDemo} onRefresh={loadData} isLoading={loading} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f2f3f3' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eaeded' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#16191f' }}>
              AWS Deep Service Analytics & Optimization
            </h1>
            <p style={{ fontSize: '13px', color: '#545b64', marginTop: '2px' }}>
              Deep telemetry monitoring for Amazon RDS databases, AWS Lambda serverless, EBS gp2 → gp3 volume optimizer, and Amazon ECS.
            </p>
          </div>

          {/* Metric Cards Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <MetricCard
              title="gp2 → gp3 Migration Savings"
              value={`$${deepSummary.gp3_monthly_savings.toFixed(2)}/mo`}
              subtitle={`${deepSummary.gp2_migration_count} volumes eligible`}
              accentColor="#137333"
              trend="20% Cost Cut"
            />

            <MetricCard
              title="Amazon RDS Databases"
              value={deepSummary.total_rds_count}
              subtitle={`${deepSummary.multi_az_rds_count} Multi-AZ, ${deepSummary.unattached_rds_snapshots} unattached snapshot`}
              accentColor="#0073bb"
            />

            <MetricCard
              title="AWS Lambda Functions"
              value={deepSummary.total_lambda_count}
              subtitle={`${deepSummary.overprovisioned_lambda_count} over-allocated memory`}
              accentColor="#ec7211"
            />

            <MetricCard
              title="Amazon EBS Volumes"
              value={deepSummary.total_ebs_count}
              subtitle={`${deepSummary.unattached_ebs_count} unattached volume`}
              accentColor="#b06000"
            />
          </div>

          {/* Tab Selection Filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('all')}
              className={activeTab === 'all' ? 'aws-btn-primary' : 'aws-btn-secondary'}
              style={{ padding: '6px 16px', fontSize: '13px' }}
            >
              All Deep Services
            </button>
            <button
              onClick={() => setActiveTab('ebs')}
              className={activeTab === 'ebs' ? 'aws-btn-primary' : 'aws-btn-secondary'}
              style={{ padding: '6px 16px', fontSize: '13px' }}
            >
              💾 EBS Optimizer ({volumes.length})
            </button>
            <button
              onClick={() => setActiveTab('rds')}
              className={activeTab === 'rds' ? 'aws-btn-primary' : 'aws-btn-secondary'}
              style={{ padding: '6px 16px', fontSize: '13px' }}
            >
              🗄️ Amazon RDS ({rdsInstances.length})
            </button>
            <button
              onClick={() => setActiveTab('lambda')}
              className={activeTab === 'lambda' ? 'aws-btn-primary' : 'aws-btn-secondary'}
              style={{ padding: '6px 16px', fontSize: '13px' }}
            >
              ⚡ AWS Lambda ({lambdas.length})
            </button>
          </div>

          {/* Deep Service Tables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
            {(activeTab === 'all' || activeTab === 'ebs') && (
              <EBSTable volumes={volumes} />
            )}

            {(activeTab === 'all' || activeTab === 'rds') && (
              <RDSTable instances={rdsInstances} />
            )}

            {(activeTab === 'all' || activeTab === 'lambda') && (
              <LambdaTable functions={lambdas} />
            )}
          </div>

          {/* Recommendations List */}
          {deepRecs.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <RecommendationsList recommendations={deepRecs} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
