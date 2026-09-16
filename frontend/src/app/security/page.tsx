'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import SecurityTable from '../../components/SecurityTable';
import MetricCard from '../../components/MetricCard';
import RecommendationsList from '../../components/RecommendationsList';
import { fetchDashboardData, checkBackendHealth, DashboardResponse, MOCK_DASHBOARD, MOCK_SECURITY_GROUPS, MOCK_SECURITY_SUMMARY } from '../../lib/api';

export default function SecurityPage() {
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
  const securityGroups = isDemo ? (data.security_groups || MOCK_SECURITY_GROUPS) : (data.security_groups ?? []);
  const securitySummary = isDemo ? (data.security_summary || MOCK_SECURITY_SUMMARY) : (data.security_summary || { total_security_groups: 0, critical_risk_count: 0, high_risk_count: 0, total_open_ports: 0, security_health_score: 100, security_score: 100 });
  type IAMGuardrails = { root_account_mfa: boolean; root_api_keys: boolean; unused_roles_count: number; overprivileged_policies: number };
  const _ss = data.security_summary as (typeof data.security_summary & { iam_guardrails?: IAMGuardrails }) | undefined;
  const iamGuardrails: IAMGuardrails = _ss?.iam_guardrails || { root_account_mfa: true, root_api_keys: false, unused_roles_count: 0, overprivileged_policies: 0 };
  const securityRecs = (data.recommendations || []).filter(r => r.category === 'Security Guardrails');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={isDemo} onRefresh={loadData} isLoading={loading} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f2f3f3' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eaeded' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#16191f' }}>
              AWS Security & Open Port Guardrail Analyzer
            </h1>
            <p style={{ fontSize: '13px', color: '#545b64', marginTop: '2px' }}>
              Real-time audit of AWS Security Group ingress rules, internet-exposed ports (0.0.0.0/0), and IAM security posture.
            </p>
          </div>

          {/* Metric Summary Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <MetricCard
              title="Security Posture Score"
              value={`${securitySummary.security_health_score}/100`}
              subtitle={securitySummary.security_health_score >= 80 ? 'Good Standing' : 'Action Required'}
              accentColor={securitySummary.security_health_score >= 80 ? '#137333' : '#c5221f'}
              trend={securitySummary.security_health_score >= 80 ? 'PASS' : 'RISK DETECTED'}
            />

            <MetricCard
              title="Critical Port Exposure"
              value={securitySummary.critical_risk_count}
              subtitle="Open SSH (22) / RDP (3389)"
              accentColor="#c5221f"
            />

            <MetricCard
              title="Exposed Database Ports"
              value={securitySummary.high_risk_count}
              subtitle="Open MySQL/Postgres/Mongo"
              accentColor="#b06000"
            />

            <MetricCard
              title="Total Audited Groups"
              value={securitySummary.total_security_groups}
              subtitle={`${securitySummary.total_open_ports} total 0.0.0.0/0 ports`}
              accentColor="#0073bb"
            />
          </div>

          {/* IAM Guardrail Panel */}
          <div className="aws-card" style={{ marginBottom: '24px' }}>
            <div className="aws-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0073bb" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>IAM & Account Security Guardrail Audit</span>
              </div>
            </div>
            <div className="aws-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '12px 16px', border: '1px solid #eaeded', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                  <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 600, textTransform: 'uppercase' }}>
                    Root Account MFA
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: iamGuardrails.root_account_mfa ? '#137333' : '#c5221f', marginTop: '4px' }}>
                    {iamGuardrails.root_account_mfa ? '✓ ENABLED' : '✗ NOT ENABLED'}
                  </div>
                </div>

                <div style={{ padding: '12px 16px', border: '1px solid #eaeded', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                  <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 600, textTransform: 'uppercase' }}>
                    Root Account API Keys
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: iamGuardrails.root_api_keys ? '#c5221f' : '#137333', marginTop: '4px' }}>
                    {iamGuardrails.root_api_keys ? '✗ API KEYS PRESENT' : '✓ NONE (Compliant)'}
                  </div>
                </div>

                <div style={{ padding: '12px 16px', border: '1px solid #eaeded', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                  <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 600, textTransform: 'uppercase' }}>
                    Unused IAM Roles
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: iamGuardrails.unused_roles_count > 0 ? '#b06000' : '#137333', marginTop: '4px' }}>
                    {iamGuardrails.unused_roles_count > 0 ? `${iamGuardrails.unused_roles_count} Role(s) Unused >90d` : '\u2713 None Detected'}
                  </div>
                </div>

                <div style={{ padding: '12px 16px', border: '1px solid #eaeded', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                  <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 600, textTransform: 'uppercase' }}>
                    Over-Privileged Inline Policies
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: iamGuardrails.overprivileged_policies > 0 ? '#c5221f' : '#137333', marginTop: '4px' }}>
                    {iamGuardrails.overprivileged_policies > 0 ? `${iamGuardrails.overprivileged_policies} Policy (*:*)` : '✓ None Detected'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Table Component */}
          <div style={{ marginBottom: '24px' }}>
            <SecurityTable securityGroups={securityGroups} onRefresh={loadData} />
          </div>

          {/* Security Recommendations List */}
          {securityRecs.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <RecommendationsList recommendations={securityRecs} onRefresh={loadData} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
