'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import MetricChart from '../../components/MetricChart';
import MetricCard from '../../components/MetricCard';
import {
  fetchDashboardData,
  checkBackendHealth,
  DashboardResponse,
  MOCK_DASHBOARD,
  MOCK_CLOUDWATCH_METRICS,
  CloudWatchMetrics,
} from '../../lib/api';

export default function CloudWatchMetricsPage() {
  const [data, setData] = useState<DashboardResponse>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [timeWindow, setTimeWindow] = useState<string>('24h');

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
  // Build instance list from real EC2 data; fall back to mock IDs only in demo mode
  const liveInstances = data.ec2 ?? [];
  const demoInstances = MOCK_DASHBOARD.ec2 || [];
  const ec2Instances = isDemo ? demoInstances : liveInstances;

  // In live mode, default to first real instance; in demo mode use mock ID
  const defaultInstanceId = ec2Instances.length > 0 ? ec2Instances[0].InstanceId : '';

  // When data loads, default to first real instance
  useEffect(() => {
    if (!isDemo && data.ec2 && data.ec2.length > 0 && !selectedInstance) {
      setSelectedInstance(data.ec2[0].InstanceId);
    } else if (isDemo && !selectedInstance) {
      setSelectedInstance('i-0a123456789abcdef');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.ec2, isDemo]);

  // Adjust metrics based on selected instance
  const metricsSource = data.cloudwatch_metrics || (isDemo ? MOCK_CLOUDWATCH_METRICS : null);
  const metrics = selectedInstance && metricsSource ? metricsSource : null;

  const cpuPeak = metrics ? Math.max(...(metrics.cpu?.values || [0])) : 0;
  const ramPeak = metrics ? Math.max(...(metrics.ram?.values || [0])) : 0;
  const netInTotal = metrics ? (metrics.net_in?.values || []).reduce((a: number, b: number) => a + b, 0) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={isDemo} onRefresh={loadData} isLoading={loading} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f2f3f3' }}>
          {/* Top Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eaeded' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#16191f' }}>
                Amazon CloudWatch Performance & Telemetry Metrics
              </h1>
              <p style={{ fontSize: '13px', color: '#545b64', marginTop: '2px' }}>
                Live CPU, Memory, Network I/O, and Storage throughput time-series graphs.
              </p>
            </div>

            {/* Instance & Window Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                value={selectedInstance}
                onChange={(e) => setSelectedInstance(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '2px',
                  border: '1px solid #d5dbdb',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#16191f',
                  outline: 'none'
                }}
              >
                {ec2Instances.length === 0 ? (
                  <option value="">No EC2 instances in {data.region || 'us-east-1'}</option>
                ) : (
                  ec2Instances.map(inst => (
                    <option key={inst.InstanceId} value={inst.InstanceId}>
                      {inst.InstanceId} ({inst.InstanceType} - {(inst.State || '').charAt(0).toUpperCase() + (inst.State || '').slice(1)})
                    </option>
                  ))
                )}
              </select>

              <div style={{ display: 'flex', backgroundColor: '#ffffff', border: '1px solid #d5dbdb', borderRadius: '2px', overflow: 'hidden' }}>
                {['1h', '6h', '24h', '7d'].map((w) => (
                  <button
                    key={w}
                    onClick={() => setTimeWindow(w)}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: timeWindow === w ? '#ec7211' : 'transparent',
                      color: timeWindow === w ? '#ffffff' : '#16191f'
                    }}
                  >
                    {w.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metric Stat Widgets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <MetricCard
              title="Peak CPU Utilization"
              value={`${cpuPeak.toFixed(1)}%`}
              subtitle={`Target: ${selectedInstance}`}
              accentColor="#0073bb"
            />
            <MetricCard
              title="Peak RAM Load"
              value={`${ramPeak.toFixed(1)}%`}
              subtitle="CWAgent Unified Metrics"
              accentColor="#ec7211"
            />
            <MetricCard
              title="Total 24h Network In"
              value={`${netInTotal.toFixed(1)} MB`}
              subtitle="Inbound Bandwidth"
              accentColor="#137333"
            />
          </div>

          {/* Time-Series Line Charts Grid */}
          {metrics ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              <MetricChart
                title="CPU Utilization"
                timestamps={metrics.timestamps || []}
                series={metrics.cpu}
                lineColor="#0073bb"
                fillColor="rgba(0, 115, 187, 0.08)"
                maxValue={100}
              />

              <MetricChart
                title="Memory Load (CWAgent)"
                timestamps={metrics.timestamps || []}
                series={metrics.ram}
                lineColor="#ec7211"
                fillColor="rgba(236, 114, 17, 0.08)"
                maxValue={100}
              />

              <MetricChart
                title="Network Throughput (NetworkIn)"
                timestamps={metrics.timestamps || []}
                series={metrics.net_in}
                lineColor="#137333"
                fillColor="rgba(19, 115, 51, 0.08)"
              />

              <MetricChart
                title="Disk Read / Write I/O"
                timestamps={metrics.timestamps || []}
                series={metrics.disk_io}
                lineColor="#b06000"
                fillColor="rgba(176, 96, 0, 0.08)"
              />
            </div>
          ) : (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #eaeded',
              borderRadius: '4px',
              padding: '48px 24px',
              textAlign: 'center',
              marginTop: '16px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#16191f', marginBottom: '8px' }}>
                No CloudWatch Telemetry Available
              </h3>
              <p style={{ fontSize: '13px', color: '#545b64', maxWidth: '500px', margin: '0 auto' }}>
                {ec2Instances.length === 0
                  ? `No EC2 instances were detected in your connected AWS account (${data.region || 'selected region'}). Launch an instance or switch regions to view metrics.`
                  : 'Metrics are still collecting from CloudWatch for the selected instance, or CloudWatch Detailed Monitoring is not yet enabled.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
