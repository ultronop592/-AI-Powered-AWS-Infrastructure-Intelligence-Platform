'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ResourceGraph from '../../components/ResourceGraph';
import {
  fetchResourceGraph,
  checkBackendHealth,
  ResourceGraphResponse,
  MOCK_RESOURCE_GRAPH,
} from '../../lib/api';

export default function GraphPage() {
  const [graphData, setGraphData] = useState<ResourceGraphResponse>(MOCK_RESOURCE_GRAPH);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const health = await checkBackendHealth();
    setIsBackendOnline(health.is_online);
    const res = await fetchResourceGraph();
    setGraphData(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isDemo = graphData.is_demo ?? true;
  const summary = isDemo ? (graphData.summary || MOCK_RESOURCE_GRAPH.summary) : (graphData.summary || { total_nodes: 0, total_edges: 0, by_service: {} });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar
        isBackendOnline={isBackendOnline}
        isMockData={graphData.is_demo}
        onRefresh={loadData}
        isLoading={loading}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column' }}>
          {/* Header Bar */}
          <div style={{ marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
              AWS Management Console &gt; Architecture Visualizer &gt; <strong>Resource Dependency Graph</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                  AWS Resource Dependency Graph
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                  Interactive topological network displaying cloud resources, network perimeters, security group firewalls, and data storage attachments.
                </p>
              </div>

              {/* Stats & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '11px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #eaeded',
                  padding: '4px 8px',
                  borderRadius: '2px',
                  color: '#545b64',
                }}>
                  Nodes: <strong style={{ color: '#16191f' }}>{summary.total_nodes}</strong> | Edges: <strong style={{ color: '#16191f' }}>{summary.total_edges}</strong>
                </span>

                <span style={{
                  fontSize: '11px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #eaeded',
                  padding: '4px 8px',
                  borderRadius: '2px',
                  color: '#545b64',
                }}>
                  Region: <strong>{graphData.region || 'us-east-1'}</strong>
                </span>

                <button
                  onClick={loadData}
                  disabled={loading}
                  style={{
                    backgroundColor: '#ec7211',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {loading ? 'Scanning Topology...' : '🔄 Refresh Graph'}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive React Flow Dependency Graph */}
          <ResourceGraph graphData={graphData} />
        </main>
      </div>
    </div>
  );
}
