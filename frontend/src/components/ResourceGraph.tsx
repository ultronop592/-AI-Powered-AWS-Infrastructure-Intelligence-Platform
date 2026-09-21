'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ResourceNode from './ResourceNode';
import { GraphNode, GraphEdge, ResourceGraphResponse } from '../lib/api';

const nodeTypes = {
  ec2: ResourceNode,
  s3: ResourceNode,
  rds: ResourceNode,
  lambda: ResourceNode,
  ebs: ResourceNode,
  security_group: ResourceNode,
  vpc: ResourceNode,
  ecs: ResourceNode,
  custom: ResourceNode,
};

interface ResourceGraphProps {
  graphData: ResourceGraphResponse;
}

export default function ResourceGraph({ graphData }: ResourceGraphProps) {
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [showCriticalOnly, setShowCriticalOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);

  // Transform backend graph nodes into React Flow format
  const initialNodes: Node[] = useMemo(() => {
    return (graphData.nodes || []).map((n) => ({
      id: n.id,
      type: n.type || 'custom',
      position: n.position || { x: 100, y: 100 },
      data: {
        id: n.id,
        type: n.type,
        label: n.label || n.name || n.id,
        name: n.name || n.id,
        service: n.service || 'AWS Resource',
        status: n.status || 'active',
        risk_level: n.risk_level || 'LOW',
        findings_count: n.findings_count || 0,
        details: n.details || {},
      },
    }));
  }, [graphData.nodes]);

  const initialEdges: Edge[] = useMemo(() => {
    return (graphData.edges || []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.animated,
      style: e.style || { stroke: '#aab7b8', strokeWidth: 1.5 },
      labelStyle: { fontSize: 10, fill: '#545b64', fontWeight: 600 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.85 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 2,
    }));
  }, [graphData.edges]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    let result = nodes;

    if (selectedService !== 'ALL') {
      result = result.filter((n) => (n.data?.type as string) === selectedService.toLowerCase());
    }

    if (showCriticalOnly) {
      result = result.filter(
        (n) => (n.data?.risk_level as string) === 'CRITICAL' || (n.data?.findings_count as number) > 0
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          (n.data?.label as string)?.toLowerCase().includes(q) ||
          (n.data?.id as string)?.toLowerCase().includes(q) ||
          (n.data?.service as string)?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [nodes, selectedService, showCriticalOnly, searchQuery]);

  // Edges that connect only currently visible nodes
  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);
  const filteredEdges = useMemo(() => {
    return edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
  }, [edges, visibleNodeIds]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const found = (graphData.nodes || []).find((n) => n.id === node.id);
      if (found) {
        setActiveNode(found);
      } else {
        setActiveNode({
          id: node.id,
          type: (node.data?.type as string) || 'unknown',
          label: (node.data?.label as string) || node.id,
          name: (node.data?.name as string) || node.id,
          service: (node.data?.service as string) || 'AWS',
          status: (node.data?.status as string) || 'active',
          risk_level: (node.data?.risk_level as string) || 'LOW',
          findings_count: (node.data?.findings_count as number) || 0,
          details: (node.data?.details as Record<string, any>) || {},
          position: node.position,
        });
      }
    },
    [graphData.nodes]
  );

  // MiniMap node color logic
  const nodeColor = (node: Node) => {
    switch (node.type) {
      case 'ec2':
        return '#ec7211';
      case 's3':
        return '#137333';
      case 'rds':
        return '#0073bb';
      case 'lambda':
        return '#d13212';
      case 'ebs':
        return '#b06000';
      case 'security_group':
        return '#8c44ad';
      default:
        return '#545b64';
    }
  };

  // Connected edges for active node
  const activeNodeConnections = useMemo(() => {
    if (!activeNode) return [];
    return (graphData.edges || []).filter(
      (e) => e.source === activeNode.id || e.target === activeNode.id
    );
  }, [activeNode, graphData.edges]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 170px)',
      minHeight: '650px',
      backgroundColor: '#f8fafc',
      border: '2px solid #0f172a',
      boxShadow: '4px 4px 0px #0f172a',
      overflow: 'hidden'
    }}>
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
      >
        <Background color="#cbd5e1" gap={20} size={1.5} />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
          position="bottom-right"
          style={{ height: 110, width: 170, backgroundColor: '#ffffff', border: '2px solid #0f172a', boxShadow: '3px 3px 0px #0f172a' }}
        />

        {/* Top Filter Bar Panel */}
        <Panel position="top-left" style={{ margin: '12px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '8px 12px',
            border: '2px solid #0f172a',
            boxShadow: '3px 3px 0px #0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}>
            {/* Service Filters */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[
                { key: 'ALL', label: 'ALL' },
                { key: 'EC2', label: '🖥️ EC2' },
                { key: 'SECURITY_GROUP', label: '🛡️ SGs' },
                { key: 'EBS', label: '💾 EBS' },
                { key: 'RDS', label: '🗄️ RDS' },
                { key: 'S3', label: '🪣 S3' },
                { key: 'LAMBDA', label: 'λ Lambda' },
                { key: 'VPC', label: '🌐 VPC' },
              ].map((srv) => {
                const isActive = selectedService === srv.key;
                return (
                  <button
                    key={srv.key}
                    onClick={() => setSelectedService(srv.key)}
                    style={{
                      padding: '3px 7px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid #0f172a',
                      boxShadow: isActive ? '1px 1px 0px #0f172a' : 'none',
                      backgroundColor: isActive ? '#0f172a' : '#ffffff',
                      color: isActive ? '#ffffff' : '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    {srv.label}
                  </button>
                );
              })}
            </div>

            <div style={{ height: '16px', width: '1px', backgroundColor: '#0f172a' }} />

            {/* Critical Toggle */}
            <button
              onClick={() => setShowCriticalOnly(!showCriticalOnly)}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                border: '1px solid #0f172a',
                boxShadow: '1px 1px 0px #0f172a',
                backgroundColor: showCriticalOnly ? '#fef2f2' : '#ffffff',
                color: showCriticalOnly ? '#dc2626' : '#0f172a',
                cursor: 'pointer',
              }}
            >
              ⚠️ RISKS ONLY
            </button>

            {/* Search Box */}
            <input
              type="text"
              placeholder="SEARCH NODES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                border: '1px solid #0f172a',
                boxShadow: '1px 1px 0px #0f172a',
                outline: 'none',
                width: '130px',
              }}
            />
          </div>
        </Panel>

        {/* Legend Panel at Top Right */}
        <Panel position="top-right" style={{ margin: '12px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '6px 10px',
            border: '2px solid #0f172a',
            boxShadow: '3px 3px 0px #0f172a',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontWeight: 700 }}>[TOPOLOGY]</span>
            <span>NETWORK &rarr; FIREWALL &rarr; COMPUTE &rarr; STORAGE</span>
          </div>
        </Panel>
      </ReactFlow>

      {/* Node Inspector Drawer (Right Panel) */}
      {activeNode && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '360px',
          height: '100%',
          backgroundColor: '#ffffff',
          borderLeft: '2px solid #0f172a',
          boxShadow: '-4px 0px 0px #0f172a',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '2px solid #0f172a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            backgroundColor: '#f1f5f9',
          }}>
            <div>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#64748b',
                letterSpacing: '0.04em',
              }}>
                [{activeNode.service}_INSPECTOR]
              </span>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '3px 0 0 0', wordBreak: 'break-all' }}>
                {activeNode.label || activeNode.name}
              </h3>
            </div>

            <button
              onClick={() => setActiveNode(null)}
              style={{
                background: '#ffffff',
                border: '1px solid #0f172a',
                boxShadow: '1px 1px 0px #0f172a',
                fontSize: '11px',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Status & Risk Summary */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                border: '1px solid #0f172a',
                boxShadow: '1px 1px 0px #0f172a',
                backgroundColor: activeNode.status === 'running' || activeNode.status === 'active' ? '#ecfdf5' : '#fffbeb',
                color: activeNode.status === 'running' || activeNode.status === 'active' ? '#059669' : '#d97706',
              }}>
                STATUS: {(activeNode.status || 'ACTIVE').toUpperCase()}
              </span>

              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                border: '1px solid #0f172a',
                boxShadow: '1px 1px 0px #0f172a',
                backgroundColor: activeNode.risk_level === 'CRITICAL' ? '#fef2f2' : activeNode.risk_level === 'HIGH' ? '#fffbeb' : '#ecfdf5',
                color: activeNode.risk_level === 'CRITICAL' ? '#dc2626' : activeNode.risk_level === 'HIGH' ? '#d97706' : '#059669',
              }}>
                RISK: {activeNode.risk_level || 'LOW'}
              </span>
            </div>

            {/* Key Properties Table */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                [RESOURCE_PROPERTIES]
              </div>
              <div style={{ border: '1.5px solid #0f172a', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '5px 8px', color: '#64748b', fontWeight: 700, width: '40%' }}>ID</td>
                      <td style={{ padding: '5px 8px', color: '#0f172a', fontWeight: 700 }}>{activeNode.id}</td>
                    </tr>
                    {Object.entries(activeNode.details || {}).map(([key, val]) => (
                      <tr key={key} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                        <td style={{ padding: '5px 8px', color: '#64748b', fontWeight: 600 }}>{key}</td>
                        <td style={{ padding: '5px 8px', color: '#0f172a' }}>
                          {Array.isArray(val) ? val.join(', ') : String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Connected Dependencies */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                [CONNECTED_DEPENDENCIES ({activeNodeConnections.length})]
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeNodeConnections.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#64748b' }}>NO DIRECT CONNECTIONS MAPPED.</div>
                ) : (
                  activeNodeConnections.map((conn) => {
                    const isOutgoing = conn.source === activeNode.id;
                    const otherId = isOutgoing ? conn.target : conn.source;
                    return (
                      <div
                        key={conn.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #0f172a',
                          boxShadow: '1px 1px 0px #0f172a',
                          fontSize: '11px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#ec7211', fontWeight: 700 }}>{isOutgoing ? '→' : '←'}</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{otherId}</span>
                        </div>
                        <span style={{ fontSize: '9px', color: '#475569', backgroundColor: '#ffffff', padding: '1px 4px', border: '1px solid #0f172a' }}>
                          {conn.label || 'connected'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Findings Alert */}
            {(activeNode.findings_count || 0) > 0 && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1.5px solid #dc2626',
                boxShadow: '2px 2px 0px #dc2626',
                padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>
                  <span>🚨</span>
                  <span>{activeNode.findings_count} FINDING(S) DETECTED</span>
                </div>
                <div style={{ fontSize: '10px', color: '#7f1d1d', lineHeight: 1.4 }}>
                  USE AUTO-FIX IN DASHBOARD OR ASK AI COPILOT FOR INSTANT BOTO3 REMEDIATION.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

