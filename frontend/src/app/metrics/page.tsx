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
  const [selectedInstance, setSelectedInstance] = useState<string>('i-0a123456789abcdef');
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

  // Adjust metrics based on selected instance
  let metrics: CloudWatchMetrics = data.cloudwatch_metrics || MOCK_CLOUDWATCH_METRICS;
  if (selectedInstance === 'i-0b987654321fedcba') {
    metrics = {
      instance_id: 'i-0b987654321fedcba',
      timestamps: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      cpu: { label: 'CPU Utilization (%)', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], unit: '%' },
      ram: { label: 'Memory Utilization (%)', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], unit: '%' },
      net_in: { label: 'Network In (MB)', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], unit: 'MB' },
      net_out: { label: 'Network Out (MB)', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], unit: 'MB' },
      disk_io: { label: 'Disk Read/Write (MB/s)', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], unit: 'MB/s' },
    };
  }

  const cpuPeak = Math.max(...(metrics.cpu?.values || [0]));
  const ramPeak = Math.max(...(metrics.ram?.values || [0]));
  const netInTotal = (metrics.net_in?.values || []).reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={data.is_mock} onRefresh={loadData} isLoading={loading} />

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
                <option value="i-0a123456789abcdef">i-0a123456789abcdef (t3.micro - Running)</option>
                <option value="i-0b987654321fedcba">i-0b987654321fedcba (t2.medium - Stopped)</option>
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
        </main>
      </div>
    </div>
  );
}
